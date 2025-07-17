import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Tenant } from '../models/Tenant';

export class TenantController {
  static async createTenant(req: Request, res: Response) {
    try {
      const { name } = req.body;
      const repo = AppDataSource.getRepository(Tenant);
      const existing = await repo.findOneBy({ name });
      if (existing) {
        return res.status(409).json({ error: 'Tenant with this name already exists.' });
      }
      const tenant = repo.create({ name });
      await repo.save(tenant);
      res.status(201).json(tenant);
    } catch (err) {
      res.status(400).json({ error: 'Could not create tenant', details: err });
    }
  }

  static async getTenants(_req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Tenant);
      const tenants = await repo.find();
      res.json(tenants);
    } catch (err) {
      res.status(500).json({ error: 'Could not fetch tenants', details: err });
    }
  }
} 