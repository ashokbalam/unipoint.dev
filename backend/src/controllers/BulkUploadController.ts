import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Tenant } from '../models/Tenant';
import { Category } from '../models/Category';
import { Question } from '../models/Question';
import { parse as csvParse } from 'csv-parse/sync';
import { EntityManager, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Types for bulk upload
interface BulkUploadOptions {
  duplicateStrategy: 'skip' | 'update' | 'error';
  batchSize: number;
  dryRun: boolean;
}

interface RubricRange {
  min: number;
  max: number;
  storyPoints: number;
}

interface QuestionOption {
  label: string;
  points: number;
}

interface CategoryUpload {
  name: string;
  rubric: RubricRange[];
  questions?: QuestionUpload[];
}

interface QuestionUpload {
  text: string;
  options: QuestionOption[];
}

interface UploadResult {
  success: boolean;
  message: string;
  processed: {
    categories: number;
    questions: number;
  };
  created: {
    categories: number;
    questions: number;
  };
  updated: {
    categories: number;
    questions: number;
  };
  skipped: {
    categories: number;
    questions: number;
  };
  errors: {
    line?: number;
    category?: string;
    question?: string;
    message: string;
  }[];
  dryRun: boolean;
}

export class BulkUploadController {
  /**
   * Handles bulk upload of categories and questions for a tenant
   */
  static async bulkUpload(req: Request, res: Response) {
    let queryRunner: QueryRunner | null = null;
    const tempFiles: string[] = [];
    
    try {
      // Get tenant ID from request
      const { tenantId } = req.params;
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required' });
      }

      // Get upload options from request
      const options: BulkUploadOptions = {
        duplicateStrategy: (req.body.duplicateStrategy || 'skip') as 'skip' | 'update' | 'error',
        batchSize: Math.min(Math.max(parseInt(req.body.batchSize) || 50, 1), 500),
        dryRun: req.body.dryRun === 'true' || req.body.dryRun === true,
      };

      // Check if tenant exists
      const tenantRepo = AppDataSource.getRepository(Tenant);
      const tenant = await tenantRepo.findOneBy({ id: tenantId });
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }

      // Check if file was uploaded
      if (!req.file && !req.files) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Handle single file or multiple files
      const files = req.file ? [req.file] : Array.isArray(req.files) ? req.files : [];
      if (files.length === 0) {
        return res.status(400).json({ error: 'No valid files uploaded' });
      }

      // Process each file
      const results: UploadResult[] = [];
      for (const file of files) {
        // Save file to temp location if it's in memory
        let filePath = file.path;
        if (!filePath && file.buffer) {
          filePath = path.join(os.tmpdir(), `upload-${Date.now()}-${file.originalname}`);
          fs.writeFileSync(filePath, file.buffer);
          tempFiles.push(filePath);
        }

        // Determine file type and parse
        const fileType = path.extname(file.originalname).toLowerCase();
        let data: any[];
        
        if (fileType === '.csv') {
          const csvContent = fs.readFileSync(filePath, 'utf8');
          data = await BulkUploadController.parseCSV(csvContent);
        } else if (fileType === '.json') {
          const jsonContent = fs.readFileSync(filePath, 'utf8');
          data = JSON.parse(jsonContent);
          if (!Array.isArray(data)) {
            data = [data]; // Convert single object to array
          }
        } else {
          results.push({
            success: false,
            message: `Unsupported file type: ${fileType}. Only .csv and .json are supported.`,
            processed: { categories: 0, questions: 0 },
            created: { categories: 0, questions: 0 },
            updated: { categories: 0, questions: 0 },
            skipped: { categories: 0, questions: 0 },
            errors: [{ message: `Unsupported file type: ${fileType}` }],
            dryRun: options.dryRun
          });
          continue;
        }

        // Process the data
        const result = await BulkUploadController.processUpload(tenant, data, options);
        results.push(result);
      }

      // Clean up temp files
      for (const tempFile of tempFiles) {
        try {
          fs.unlinkSync(tempFile);
        } catch (error) {
          console.error(`Error deleting temp file ${tempFile}:`, error);
        }
      }

      // Return results
      if (results.length === 1) {
        return res.status(results[0].success ? 200 : 400).json(results[0]);
      } else {
        const overallSuccess = results.every(r => r.success);
        return res.status(overallSuccess ? 200 : 400).json({
          success: overallSuccess,
          results
        });
      }
    } catch (error: unknown) {
      // Rollback transaction if active
      if (queryRunner) {
        // Use a type assertion to help TypeScript understand the type
        const runner = queryRunner as QueryRunner;
        try {
          if (runner.isTransactionActive) {
            await runner.rollbackTransaction();
          }
          await runner.release();
        } catch (releaseError) {
          console.error('Error releasing query runner:', releaseError);
        }
      }

      // Clean up temp files
      for (const tempFile of tempFiles) {
        try {
          fs.unlinkSync(tempFile);
        } catch (tempError) {
          console.error(`Error deleting temp file ${tempFile}:`, tempError);
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Bulk upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred during bulk upload',
        error: process.env.NODE_ENV === 'production' ? undefined : errorMessage
      });
    }
  }

  /**
   * Parse CSV content into structured data
   */
  private static async parseCSV(csvContent: string): Promise<any[]> {
    // Parse CSV headers and data
    const records = csvParse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // Group by category
    const categoriesMap = new Map<string, CategoryUpload>();
    
    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      const categoryName = record.category_name?.trim();
      
      if (!categoryName) {
        throw new Error(`Row ${i + 2}: Missing category name`);
      }

      // Parse rubric if present
      let rubric: RubricRange[] = [];
      if (record.rubric) {
        try {
          rubric = JSON.parse(record.rubric);
          // Validate rubric structure
          if (!Array.isArray(rubric)) {
            throw new Error(`Row ${i + 2}: Rubric must be an array`);
          }
          for (const range of rubric) {
            if (typeof range.min !== 'number' || typeof range.max !== 'number' || typeof range.storyPoints !== 'number') {
              throw new Error(`Row ${i + 2}: Each rubric range must have numeric min, max, and storyPoints`);
            }
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          throw new Error(`Row ${i + 2}: Invalid rubric format - ${errorMessage}`);
        }
      }

      // Create or update category
      if (!categoriesMap.has(categoryName)) {
        categoriesMap.set(categoryName, {
          name: categoryName,
          rubric: rubric,
          questions: []
        });
      } else if (rubric.length > 0) {
        // Update rubric if provided in this row
        categoriesMap.get(categoryName)!.rubric = rubric;
      }

      // Process question if present
      if (record.question_text) {
        const questionText = record.question_text.trim();
        
        // Parse options
        let options: QuestionOption[] = [];
        if (record.options) {
          try {
            options = JSON.parse(record.options);
            // Validate options structure
            if (!Array.isArray(options)) {
              throw new Error(`Row ${i + 2}: Options must be an array`);
            }
            for (const option of options) {
              if (!option.label || typeof option.points !== 'number') {
                throw new Error(`Row ${i + 2}: Each option must have a label and numeric points`);
              }
            }
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Row ${i + 2}: Invalid options format - ${errorMessage}`);
          }
        } else {
          // Try to parse individual option columns
          const optionCount = 3; // Default to 3 options
          for (let j = 1; j <= optionCount; j++) {
            const label = record[`option${j}_label`]?.trim();
            const points = parseFloat(record[`option${j}_points`]);
            
            if (label && !isNaN(points)) {
              options.push({ label, points });
            }
          }
        }

        // Validate options count
        if (options.length !== 3) {
          throw new Error(`Row ${i + 2}: Each question must have exactly 3 options`);
        }

        // Add question to category
        categoriesMap.get(categoryName)!.questions!.push({
          text: questionText,
          options: options
        });
      }
    }

    return Array.from(categoriesMap.values());
  }

  /**
   * Process the upload data
   */
  private static async processUpload(
    tenant: Tenant, 
    data: any[], 
    options: BulkUploadOptions
  ): Promise<UploadResult> {
    const result: UploadResult = {
      success: true,
      message: options.dryRun ? 'Validation successful' : 'Upload successful',
      processed: { categories: 0, questions: 0 },
      created: { categories: 0, questions: 0 },
      updated: { categories: 0, questions: 0 },
      skipped: { categories: 0, questions: 0 },
      errors: [],
      dryRun: options.dryRun
    };

    // Validate structure
    try {
      await BulkUploadController.validateStructure(data, result);
      if (result.errors.length > 0) {
        result.success = false;
        result.message = 'Validation failed';
        return result;
      }
    } catch (error: unknown) {
      result.success = false;
      result.message = 'Validation failed';
      result.errors.push({ 
        message: error instanceof Error ? error.message : 'Unknown validation error' 
      });
      return result;
    }

    // If dry run and validation passed, return success
    if (options.dryRun) {
      return result;
    }

    // Start transaction
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Process in batches
      const batches = BulkUploadController.createBatches(data, options.batchSize);
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        // Process each category in the batch
        for (const categoryData of batch) {
          try {
            const categoryResult = await BulkUploadController.processCategory(
              queryRunner.manager,
              tenant,
              categoryData,
              options,
              result
            );
            
            // If category processing failed, log error and continue
            if (!categoryResult.success) {
              result.errors.push({
                category: categoryData.name,
                message: categoryResult.error || 'Unknown error processing category'
              });
              continue;
            }
            
            // Process questions if category was created/updated successfully
            if (categoryResult.category && categoryData.questions && categoryData.questions.length > 0) {
              await BulkUploadController.processQuestions(
                queryRunner.manager,
                categoryResult.category,
                categoryData.questions,
                options,
                result
              );
            }
          } catch (error: unknown) {
            result.errors.push({
              category: categoryData.name,
              message: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }

      // Commit transaction if no errors, otherwise rollback
      if (result.errors.length === 0) {
        await queryRunner.commitTransaction();
        result.success = true;
        result.message = 'Upload completed successfully';
      } else {
        await queryRunner.rollbackTransaction();
        result.success = false;
        result.message = 'Upload completed with errors';
      }
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      result.success = false;
      result.message = 'Upload failed';
      result.errors.push({ 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      await queryRunner.release();
    }

    return result;
  }

  /**
   * Validate the structure of the upload data
   */
  private static async validateStructure(data: any[], result: UploadResult): Promise<void> {
    if (!Array.isArray(data)) {
      throw new Error('Upload data must be an array of categories');
    }

    for (let i = 0; i < data.length; i++) {
      const category = data[i];
      
      // Validate category
      if (!category.name || typeof category.name !== 'string') {
        result.errors.push({
          line: i + 1,
          message: 'Category name is required and must be a string'
        });
      }

      // Validate rubric if present
      if (category.rubric) {
        if (!Array.isArray(category.rubric)) {
          result.errors.push({
            line: i + 1,
            category: category.name,
            message: 'Rubric must be an array'
          });
        } else {
          // Check for overlapping ranges and unique story points
          const storyPoints = new Set<number>();
          
          for (let j = 0; j < category.rubric.length; j++) {
            const range = category.rubric[j];
            
            // Validate range structure
            if (!range.min || !range.max || !range.storyPoints) {
              result.errors.push({
                line: i + 1,
                category: category.name,
                message: `Rubric range at index ${j} must have min, max, and storyPoints`
              });
              continue;
            }

            // Validate numeric values
            if (typeof range.min !== 'number' || typeof range.max !== 'number' || typeof range.storyPoints !== 'number') {
              result.errors.push({
                line: i + 1,
                category: category.name,
                message: `Rubric range at index ${j} must have numeric min, max, and storyPoints`
              });
              continue;
            }

            // Validate min <= max
            if (range.min > range.max) {
              result.errors.push({
                line: i + 1,
                category: category.name,
                message: `Rubric range at index ${j} has min (${range.min}) greater than max (${range.max})`
              });
            }

            // Check for duplicate story points
            if (storyPoints.has(range.storyPoints)) {
              result.errors.push({
                line: i + 1,
                category: category.name,
                message: `Duplicate story point value ${range.storyPoints} in rubric`
              });
            } else {
              storyPoints.add(range.storyPoints);
            }

            // Check for overlapping ranges
            for (let k = 0; k < j; k++) {
              const otherRange = category.rubric[k];
              if (range.min <= otherRange.max && range.max >= otherRange.min) {
                result.errors.push({
                  line: i + 1,
                  category: category.name,
                  message: `Overlapping rubric ranges: [${range.min}-${range.max}] and [${otherRange.min}-${otherRange.max}]`
                });
              }
            }
          }
        }
      }

      // Validate questions if present
      if (category.questions) {
        if (!Array.isArray(category.questions)) {
          result.errors.push({
            line: i + 1,
            category: category.name,
            message: 'Questions must be an array'
          });
        } else {
          for (let j = 0; j < category.questions.length; j++) {
            const question = category.questions[j];
            
            // Validate question text
            if (!question.text || typeof question.text !== 'string') {
              result.errors.push({
                line: i + 1,
                category: category.name,
                message: `Question at index ${j} must have text`
              });
            }

            // Validate options
            if (!question.options || !Array.isArray(question.options)) {
              result.errors.push({
                line: i + 1,
                category: category.name,
                question: question.text,
                message: `Question "${question.text}" must have options array`
              });
            } else if (question.options.length !== 3) {
              result.errors.push({
                line: i + 1,
                category: category.name,
                question: question.text,
                message: `Question "${question.text}" must have exactly 3 options, found ${question.options.length}`
              });
            } else {
              // Validate each option
              for (let k = 0; k < question.options.length; k++) {
                const option = question.options[k];
                if (!option.label || typeof option.label !== 'string') {
                  result.errors.push({
                    line: i + 1,
                    category: category.name,
                    question: question.text,
                    message: `Option ${k + 1} for question "${question.text}" must have a label`
                  });
                }
                if (typeof option.points !== 'number') {
                  result.errors.push({
                    line: i + 1,
                    category: category.name,
                    question: question.text,
                    message: `Option ${k + 1} for question "${question.text}" must have numeric points`
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  /**
   * Create batches from data for processing
   */
  private static createBatches<T>(data: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Process a single category
   */
  private static async processCategory(
    entityManager: EntityManager,
    tenant: Tenant,
    categoryData: CategoryUpload,
    options: BulkUploadOptions,
    result: UploadResult
  ): Promise<{ success: boolean; category?: Category; error?: string }> {
    result.processed.categories++;
    
    try {
      const categoryRepo = entityManager.getRepository(Category);
      
      // Check if category exists
      const existingCategory = await categoryRepo.findOne({
        where: { name: categoryData.name, tenant: { id: tenant.id } },
        relations: ['tenant']
      });

      if (existingCategory) {
        // Handle existing category based on duplicate strategy
        if (options.duplicateStrategy === 'error') {
          result.skipped.categories++;
          return {
            success: false,
            error: `Category "${categoryData.name}" already exists`
          };
        } else if (options.duplicateStrategy === 'skip') {
          result.skipped.categories++;
          return { success: true, category: existingCategory };
        } else if (options.duplicateStrategy === 'update') {
          // Update category
          if (categoryData.rubric) {
            existingCategory.rubric = categoryData.rubric;
          }
          await categoryRepo.save(existingCategory);
          result.updated.categories++;
          return { success: true, category: existingCategory };
        }
      }

      // Create new category
      const newCategory = categoryRepo.create({
        name: categoryData.name,
        tenant,
        rubric: categoryData.rubric
      });

      await categoryRepo.save(newCategory);
      result.created.categories++;
      return { success: true, category: newCategory };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : `Failed to process category "${categoryData.name}"`
      };
    }
  }

  /**
   * Process questions for a category
   */
  private static async processQuestions(
    entityManager: EntityManager,
    category: Category,
    questions: QuestionUpload[],
    options: BulkUploadOptions,
    result: UploadResult
  ): Promise<void> {
    const questionRepo = entityManager.getRepository(Question);
    
    for (const questionData of questions) {
      result.processed.questions++;
      
      try {
        // Check if question exists
        const existingQuestion = await questionRepo.findOne({
          where: { text: questionData.text, category: { id: category.id } },
          relations: ['category']
        });

        if (existingQuestion) {
          // Handle existing question based on duplicate strategy
          if (options.duplicateStrategy === 'error') {
            result.errors.push({
              category: category.name,
              question: questionData.text,
              message: `Question "${questionData.text}" already exists in category "${category.name}"`
            });
            result.skipped.questions++;
            continue;
          } else if (options.duplicateStrategy === 'skip') {
            result.skipped.questions++;
            continue;
          } else if (options.duplicateStrategy === 'update') {
            // Update question
            existingQuestion.options = questionData.options;
            await questionRepo.save(existingQuestion);
            result.updated.questions++;
            continue;
          }
        }

        // Create new question
        const newQuestion = questionRepo.create({
          text: questionData.text,
          options: questionData.options,
          category
        });

        await questionRepo.save(newQuestion);
        result.created.questions++;
      } catch (error: unknown) {
        result.errors.push({
          category: category.name,
          question: questionData.text,
          message: error instanceof Error ? error.message : `Failed to process question "${questionData.text}"`
        });
      }
    }
  }

  /**
   * Get upload template as CSV
   */
  static getTemplate(req: Request, res: Response) {
    const format = req.query.format || 'csv';
    
    if (format === 'csv') {
      const csvTemplate = 
        'category_name,rubric,question_text,options,option1_label,option1_points,option2_label,option2_points,option3_label,option3_points\n' +
        'Example Category,"[{""min"":0,""max"":10,""storyPoints"":1},{""min"":11,""max"":20,""storyPoints"":2}]",' +
        'Example Question,"[{""label"":""Option 1"",""points"":0},{""label"":""Option 2"",""points"":5},{""label"":""Option 3"",""points"":10}]",' +
        'Option 1,0,Option 2,5,Option 3,10\n' +
        'Example Category,,"Another Question",,"Yes",0,"Maybe",5,"No",10';

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="bulk_upload_template.csv"');
      return res.send(csvTemplate);
    } else if (format === 'json') {
      const jsonTemplate = [
        {
          "name": "Example Category",
          "rubric": [
            { "min": 0, "max": 10, "storyPoints": 1 },
            { "min": 11, "max": 20, "storyPoints": 2 }
          ],
          "questions": [
            {
              "text": "Example Question",
              "options": [
                { "label": "Option 1", "points": 0 },
                { "label": "Option 2", "points": 5 },
                { "label": "Option 3", "points": 10 }
              ]
            },
            {
              "text": "Another Question",
              "options": [
                { "label": "Yes", "points": 0 },
                { "label": "Maybe", "points": 5 },
                { "label": "No", "points": 10 }
              ]
            }
          ]
        }
      ];

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="bulk_upload_template.json"');
      return res.json(jsonTemplate);
    } else {
      return res.status(400).json({ error: 'Unsupported format. Use "csv" or "json".' });
    }
  }

  /**
   * Get status of an ongoing upload
   */
  static getUploadStatus(req: Request, res: Response) {
    // This would be implemented with a job queue system like Bull
    // For now, return a placeholder response
    return res.status(501).json({
      message: 'Upload status tracking not implemented yet',
      // This would be the structure when implemented:
      // id: req.params.id,
      // status: 'completed', // or 'processing', 'failed'
      // progress: 100,
      // result: { ... }
    });
  }
}
