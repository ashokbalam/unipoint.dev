import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Question } from '../models/Question';
import { Category } from '../models/Category';

export class QuestionController {
  static async createQuestion(req: Request, res: Response) {
    try {
      const { text, options, categoryId } = req.body;
      if (!Array.isArray(options) || options.length !== 3) {
        return res.status(400).json({ error: 'Each question must have exactly 3 options.' });
      }
      const categoryRepo = AppDataSource.getRepository(Category);
      const category = await categoryRepo.findOneBy({ id: categoryId });
      if (!category) return res.status(404).json({ error: 'Category not found' });
      const repo = AppDataSource.getRepository(Question);
      const existing = await repo.findOne({ where: { text, category: { id: categoryId } }, relations: ['category'] });
      if (existing) {
        return res.status(409).json({ error: 'Question with this text already exists for this category.' });
      }
      const question = repo.create({ text, options, category });
      await repo.save(question);
      res.status(201).json(question);
    } catch (err) {
      res.status(400).json({ error: 'Could not create question', details: err });
    }
  }

  static async getQuestions(req: Request, res: Response) {
    try {
      const { categoryId } = req.query;
      const repo = AppDataSource.getRepository(Question);
      const questions = await repo.find({
        where: categoryId ? { category: { id: categoryId as string } } : {},
        relations: ['category'],
      });
      res.json(questions);
    } catch (err) {
      res.status(500).json({ error: 'Could not fetch questions', details: err });
    }
  }

  static async updateQuestion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { text, options } = req.body;
      const repo = AppDataSource.getRepository(Question);
      const question = await repo.findOne({ where: { id }, relations: ['category'] });
      if (!question) return res.status(404).json({ error: 'Question not found' });
      // Validate options
      if (options) {
        if (!Array.isArray(options) || options.length < 2) {
          return res.status(400).json({ error: 'Each question must have at least 2 options.' });
        }
        for (const opt of options) {
          if (!opt.label || typeof opt.points !== 'number') {
            return res.status(400).json({ error: 'Each option must have a label and points.' });
          }
        }
        question.options = options;
      }
      if (text) question.text = text;
      await repo.save(question);
      res.json(question);
    } catch (err) {
      res.status(400).json({ error: 'Could not update question', details: err });
    }
  }
} 