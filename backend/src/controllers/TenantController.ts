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

  static async getTenants(req: Request, res: Response) {
    try {
      const { search } = req.query;
      const repo = AppDataSource.getRepository(Tenant);
      
      let tenants;
      if (search && typeof search === 'string') {
        tenants = await repo
          .createQueryBuilder('tenant')
          .where('LOWER(tenant.name) LIKE LOWER(:search)', { search: `%${search}%` })
          .take(10) // Limit results for performance
          .getMany();
      } else {
        // Return a limited number of tenants if no search term
        tenants = await repo.find({ take: 10 });
      }
      
      res.json(tenants);
    } catch (err) {
      res.status(500).json({ error: 'Could not fetch tenants', details: err });
    }
  }

  static async getTenantById(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Tenant);
      const tenant = await repo.findOneBy({ id: req.params.id });
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
      res.json(tenant);
    } catch (err) {
      res.status(500).json({ error: 'Could not fetch tenant', details: err });
    }
  }
} 