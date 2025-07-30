import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Category } from '../models/Category';
import { Tenant } from '../models/Tenant';

export class CategoryController {
  static async createCategory(req: Request, res: Response) {
    try {
      const { name, tenantId, rubric } = req.body;
      // Rubric validation: no overlap and unique storyPoints
      if (rubric && Array.isArray(rubric)) {
        for (let i = 0; i < rubric.length; i++) {
          for (let j = i + 1; j < rubric.length; j++) {
            // Overlap: (minA <= maxB && maxA >= minB)
            if (
              rubric[i].min <= rubric[j].max &&
              rubric[i].max >= rubric[j].min
            ) {
              return res.status(400).json({ error: 'Rubric ranges must not overlap.' });
            }
            // Unique storyPoints
            if (rubric[i].storyPoints === rubric[j].storyPoints) {
              return res.status(400).json({ error: 'Each rubric range must have a unique story point value.' });
            }
          }
        }
      }
      const tenantRepo = AppDataSource.getRepository(Tenant);
      const tenant = await tenantRepo.findOneBy({ id: tenantId });
      if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
      const repo = AppDataSource.getRepository(Category);
      const existing = await repo.findOne({ where: { name, tenant: { id: tenantId } }, relations: ['tenant'] });
      if (existing) {
        return res.status(409).json({ error: 'Category with this name already exists for this tenant.' });
      }
      const category = repo.create({ name, tenant, rubric });
      await repo.save(category);
      res.status(201).json(category);
    } catch (err) {
      res.status(400).json({ error: 'Could not create category', details: err });
    }
  }

  static async getCategories(req: Request, res: Response) {
    try {
      const { tenantId } = req.query;
      const repo = AppDataSource.getRepository(Category);
      const categories = await repo.find({
        where: tenantId ? { tenant: { id: tenantId as string } } : {},
        relations: ['tenant'],
      });
      res.json(categories);
    } catch (err) {
      res.status(500).json({ error: 'Could not fetch categories', details: err });
    }
  }

  static async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const repo = AppDataSource.getRepository(Category);
      const category = await repo.findOne({ where: { id }, relations: ['tenant'] });
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json(category);
    } catch (err) {
      res.status(500).json({ error: 'Could not fetch category', details: err });
    }
  }

  static async updateCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, rubric } = req.body;
      const repo = AppDataSource.getRepository(Category);
      const category = await repo.findOne({ where: { id }, relations: ['tenant'] });
      if (!category) return res.status(404).json({ error: 'Category not found' });
      // Rubric validation: no overlap and unique storyPoints
      if (rubric && Array.isArray(rubric)) {
        for (let i = 0; i < rubric.length; i++) {
          for (let j = i + 1; j < rubric.length; j++) {
            if (
              rubric[i].min <= rubric[j].max &&
              rubric[i].max >= rubric[j].min
            ) {
              return res.status(400).json({ error: 'Rubric ranges must not overlap.' });
            }
            if (rubric[i].storyPoints === rubric[j].storyPoints) {
              return res.status(400).json({ error: 'Each rubric range must have a unique story point value.' });
            }
          }
        }
      }
      if (name) category.name = name;
      if (rubric) category.rubric = rubric;
      await repo.save(category);
      res.json(category);
    } catch (err) {
      res.status(400).json({ error: 'Could not update category', details: err });
    }
  }
} 