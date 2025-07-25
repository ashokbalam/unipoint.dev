import { Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Tenant } from '../models/Tenant';
import { ILike, Like, Raw } from 'typeorm';

// Simple in-memory cache implementation
interface CacheEntry {
  data: any;
  timestamp: number;
}

class SearchCache {
  private cache: Map<string, CacheEntry> = new Map();
  private ttl: number; // Time to live in milliseconds

  constructor(ttlSeconds: number = 300) { // Default 5 minutes TTL
    this.ttl = ttlSeconds * 1000;
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    // Delete entries that match the pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats
  getStats(): { size: number } {
    return {
      size: this.cache.size
    };
  }
}

// Initialize the cache
const tenantSearchCache = new SearchCache();

export class OptimizedTenantController {
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
      
      // Invalidate cache when a new tenant is created
      tenantSearchCache.invalidate();
      
      res.status(201).json(tenant);
    } catch (err) {
      res.status(400).json({ error: 'Could not create tenant', details: err });
    }
  }

  static async getTenants(req: Request, res: Response) {
    const startTime = performance.now();
    try {
      const { 
        search, 
        mode = 'auto',
        page = 1, 
        limit = 10,
        exact = false
      } = req.query;
      
      // Parse pagination parameters
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 10));
      const skip = (pageNum - 1) * limitNum;
      
      // If no search term, return paginated results
      if (!search || typeof search !== 'string') {
        const tenants = await AppDataSource.getRepository(Tenant).find({
          skip,
          take: limitNum,
          order: { name: 'ASC' }
        });
        
        const total = await AppDataSource.getRepository(Tenant).count();
        
        return res.json({
          data: tenants,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        });
      }
      
      // Generate cache key based on all parameters
      const cacheKey = `tenants:${search}:${mode}:${pageNum}:${limitNum}:${exact}`;
      
      // Check cache first
      const cachedResult = tenantSearchCache.get(cacheKey);
      if (cachedResult) {
        // Add cache hit information to response headers
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Lookup-Time-ms', '0');
        
        const endTime = performance.now();
        res.setHeader('X-Response-Time-ms', (endTime - startTime).toFixed(2));
        
        return res.json(cachedResult);
      }
      
      res.setHeader('X-Cache', 'MISS');
      
      const repo = AppDataSource.getRepository(Tenant);
      let queryBuilder = repo.createQueryBuilder('tenant');
      let tenants;
      let total = 0;
      
      // Determine search strategy based on mode and search term
      const searchMode = determineSearchMode(mode as string, search);
      
      switch (searchMode) {
        case 'exact':
          // Exact match (case-insensitive)
          tenants = await queryBuilder
            .where('LOWER(tenant.name) = LOWER(:search)', { search })
            .skip(skip)
            .take(limitNum)
            .getMany();
            
          total = await queryBuilder
            .where('LOWER(tenant.name) = LOWER(:search)', { search })
            .getCount();
          break;
          
        case 'prefix':
          // Prefix search (optimized for autocomplete)
          tenants = await queryBuilder
            .where('tenant.name ILIKE :search', { search: `${search}%` })
            .skip(skip)
            .take(limitNum)
            .orderBy('tenant.name', 'ASC')
            .getMany();
            
          total = await queryBuilder
            .where('tenant.name ILIKE :search', { search: `${search}%` })
            .getCount();
          break;
          
        case 'fulltext':
          // Full-text search with ranking
          // This assumes you've added the name_tsv column and index as per the SQL file
          tenants = await queryBuilder
            .where('tenant.name_tsv @@ to_tsquery(:search)', { 
              search: search.split(' ').join(' & ') 
            })
            .orderBy(
              'ts_rank(tenant.name_tsv, to_tsquery(:search))', 
              'DESC'
            )
            .skip(skip)
            .take(limitNum)
            .getMany();
            
          total = await queryBuilder
            .where('tenant.name_tsv @@ to_tsquery(:search)', { 
              search: search.split(' ').join(' & ') 
            })
            .getCount();
          break;
          
        case 'fuzzy':
          // Fuzzy search using trigram similarity
          // This assumes you've enabled pg_trgm extension and created the trigram index
          tenants = await queryBuilder
            .where('tenant.name % :search', { search })
            .orderBy('similarity(tenant.name, :search)', 'DESC')
            .skip(skip)
            .take(limitNum)
            .getMany();
            
          total = await queryBuilder
            .where('tenant.name % :search', { search })
            .getCount();
          break;
          
        case 'contains':
        default:
          // Contains search (default fallback)
          tenants = await queryBuilder
            .where('LOWER(tenant.name) LIKE LOWER(:search)', { search: `%${search}%` })
            .skip(skip)
            .take(limitNum)
            .orderBy('tenant.name', 'ASC')
            .getMany();
            
          total = await queryBuilder
            .where('LOWER(tenant.name) LIKE LOWER(:search)', { search: `%${search}%` })
            .getCount();
          break;
      }
      
      const result = {
        data: tenants,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        },
        meta: {
          searchMode,
          query: search
        }
      };
      
      // Cache the result
      tenantSearchCache.set(cacheKey, result);
      
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      // Add performance metrics to response headers
      res.setHeader('X-Response-Time-ms', responseTime.toFixed(2));
      res.setHeader('X-Cache-Lookup-Time-ms', responseTime.toFixed(2));
      
      res.json(result);
    } catch (err) {
      const endTime = performance.now();
      res.setHeader('X-Response-Time-ms', (endTime - startTime).toFixed(2));
      
      console.error('Search error:', err);
      res.status(500).json({ 
        error: 'Could not fetch tenants', 
        details: process.env.NODE_ENV === 'production' ? undefined : err 
      });
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
  
  // Cache management endpoints (for admin use)
  static async getCacheStats(req: Request, res: Response) {
    try {
      const stats = tenantSearchCache.getStats();
      res.json({
        ...stats,
        message: 'Cache statistics retrieved successfully'
      });
    } catch (err) {
      res.status(500).json({ error: 'Could not fetch cache stats', details: err });
    }
  }
  
  static async invalidateCache(req: Request, res: Response) {
    try {
      const { pattern } = req.query;
      tenantSearchCache.invalidate(pattern as string);
      res.json({ 
        message: pattern 
          ? `Cache invalidated for pattern: ${pattern}` 
          : 'Complete cache invalidated successfully' 
      });
    } catch (err) {
      res.status(500).json({ error: 'Could not invalidate cache', details: err });
    }
  }
}

// Helper function to determine the best search mode based on the query
function determineSearchMode(requestedMode: string, searchTerm: string): string {
  // If explicit mode is requested and valid, use it
  const validModes = ['exact', 'prefix', 'fulltext', 'fuzzy', 'contains', 'auto'];
  if (validModes.includes(requestedMode) && requestedMode !== 'auto') {
    return requestedMode;
  }
  
  // Auto-detect mode based on search term characteristics
  const term = searchTerm.trim();
  
  // If empty search, use contains
  if (!term) return 'contains';
  
  // If quoted exact phrase, use exact match
  if (term.startsWith('"') && term.endsWith('"')) {
    return 'exact';
  }
  
  // If short term (1-2 chars), use prefix search for better autocomplete
  if (term.length <= 2) {
    return 'prefix';
  }
  
  // If term contains spaces, likely a phrase search, use fulltext
  if (term.includes(' ')) {
    return 'fulltext';
  }
  
  // If term is 3-5 chars, likely typing for autocomplete, use prefix
  if (term.length <= 5) {
    return 'prefix';
  }
  
  // For longer terms, use fuzzy search to handle potential typos
  return 'fuzzy';
}

/*
 * To extend this implementation with Redis instead of in-memory cache:
 * 
 * 1. Install redis and redis client:
 *    npm install redis
 * 
 * 2. Create a Redis client connection:
 * 
 * import { createClient } from 'redis';
 * const redisClient = createClient({
 *   url: process.env.REDIS_URL || 'redis://localhost:6379'
 * });
 * redisClient.connect().catch(console.error);
 * 
 * 3. Modify the SearchCache class to use Redis instead of Map
 * 
 * 4. For production, consider adding connection pooling and error handling
 */
