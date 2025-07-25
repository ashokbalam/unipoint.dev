# Tenant Search Optimization Guide

Optimize, monitor, and continuously improve the tenant search service using the strategies introduced in the codebase.

---

## 1. Step-by-Step Implementation Instructions

| Step | Action | Outcome |
|------|--------|---------|
| 1 | **Create new DB objects**.<br/>Run `backend/src/optimizations/tenant-search-indexes.sql` against each environment. | Adds functional, full-text, prefix and trigram indexes, triggers, and extensions. |
| 2 | **Replace controller**.<br/>Wire `OptimizedTenantController` in `app.ts` routes. | Enables multi-strategy search, caching, pagination, metrics headers. |
| 3 | **Integrate caching layer** (optional).<br/>Switch `SearchCache` to Redis (see inline docs). | Off-process cache & horizontal scalability. |
| 4 | **Add React hook**.<br/>Replace ad-hoc `/tenants?search=` logic with `useOptimizedTenantSearch` in the UI. | Debounced, paginated, cached front-end queries. |
| 5 | **Migrations & CI**.<br/>Add DB migration step to CI pipeline (`npm run typeorm:run`). | Guarantees indexes exist in every environment. |
| 6 | **Smoke test**.<br/>`curl -v "http://localhost:4000/tenants?search=Eagle&mode=auto"` | Verify results, headers `X-Response-Time` & `X-Cache`. |

---

## 2. Database Optimization Checklist

- [ ] `idx_tenant_name_lower` exists and is used (`EXPLAIN ANALYZE` shows index scan).
- [ ] `pg_trgm` extension is enabled.
- [ ] `idx_tenant_name_trigram` created for fuzzy search.
- [ ] `name_tsv` column populated and kept up-to-date by trigger.
- [ ] `idx_tenant_name_tsv` GIN index exists.
- [ ] `idx_tenant_name_prefix` for `ILIKE 'prefix%'` searches created.
- [ ] Autovacuum tuned for table `tenant` (check `autovacuum_vacuum_scale_factor`).
- [ ] Statistics target (`ALTER TABLE tenant ALTER COLUMN name SET STATISTICS 500`) increased if tenant table > 1 M rows.
- [ ] `work_mem` and `maintenance_work_mem` tuned for expected workload.

---

## 3. Performance Monitoring Guidelines

1. **Application-level headers**  
   - `X-Response-Time-ms` – total API time.  
   - `X-Cache` – HIT / MISS.  
   - Log values via middleware to ELK/Grafana.
2. **Database metrics**  
   - Track `pg_stat_statements` for top search queries.  
   - Alert on sequential scans on `tenant`.
3. **Infrastructure metrics**  
   - CPU, memory, connection pool saturation.  
   - Redis hit ratio if using Redis.
4. **Alert thresholds**  
   - p95 API latency > 150 ms (warn) / 300 ms (critical).  
   - Cache hit ratio < 70 % for 15 min (warn).

---

## 4. Benchmarking & Testing Recommendations

| Test | Tool | Target |
|------|------|--------|
| Load test | k6 / Locust | 100 RPS sustained, 10 min |
| Cold-cache test | Disable Redis, clear in-memory cache | Confirm p95 < 250 ms |
| Warm-cache test | Primed cache | Expect p95 < 50 ms |
| Regression suite | Jest + Supertest | Validate pagination, modes, error cases |
| Index effectiveness | `EXPLAIN ANALYZE` | Seq Scan should be 0 for typical queries |

---

## 5. Troubleshooting Common Issues

| Symptom | Possible Cause | Fix |
|---------|----------------|-----|
| High DB CPU | Missing index, `LOWER()` scan | Re-run SQL script, verify index usage |
| `X-Cache: MISS` always | Cache TTL too low, key collision | Increase TTL, validate cache key generation |
| `pg_trgm` errors | Extension not enabled | `CREATE EXTENSION pg_trgm;` |
| Stale search results | Cache not invalidated on create/update | Call `tenantSearchCache.invalidate()` after writes or publish invalidation message to Redis |
| Missing results for short queries | Search mode `prefix` disabled | Ensure `mode=auto` or pass `mode=prefix` |

---

## 6. A/B Testing Suggestions

1. **Traffic splitting**  
   - Use a feature flag to direct X % of users to `OptimizedTenantController`.
2. **Metrics to compare**  
   - Average search latency.  
   - Click-through rate on first suggestion.  
   - Backend CPU & query count.
3. **Duration**  
   - Minimum one week or 1 000 unique users.
4. **Success criteria**  
   - ≥ 20 % latency reduction and no degradation in suggestion CTR.

---

## 7. Production Deployment Checklist

- [ ] All DB migrations executed in staging & prod.
- [ ] Env vars (`REDIS_URL`, `CACHE_TTL_SEC`, `PG_STAT_STATEMENTS`) set.
- [ ] `NODE_ENV=production` to suppress error details.
- [ ] Auto-scaling rules updated for additional Redis / DB load.
- [ ] Health-check `/health` returns `{"status":"ok"}`.
- [ ] Canary release with 5 % traffic for 1 hour, monitor.
- [ ] Rollback plan defined (`git revert`, redeploy previous image).

---

## 8. Performance Targets & KPIs

| KPI | Target | Notes |
|-----|--------|-------|
| p95 API latency (warm cache) | ≤ 50 ms | 10 results, same region |
| p95 API latency (cold cache) | ≤ 250 ms | 10 results |
| Cache hit ratio | ≥ 70 % | For autocomplete bursts |
| DB CPU utilization | ≤ 60 % | During peak |
| Error rate | ≤ 0.1 % | 5xx over total calls |
| Autocomplete suggestion CTR | ≥ 40 % | Searches leading to selection |
| Uptime | ≥ 99.9 % | Monthly |

---

### Keep this document version controlled and update after every major optimization or architectural change.
