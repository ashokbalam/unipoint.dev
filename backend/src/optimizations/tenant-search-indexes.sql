-- PostgreSQL Indexes for Tenant Search Optimization

-- 1. Case-insensitive index using LOWER() function
-- This index optimizes the current query that uses LOWER(tenant.name) LIKE LOWER(:search)
-- It prevents full table scans when searching with case-insensitive matching
CREATE INDEX idx_tenant_name_lower ON tenant (LOWER(name));
COMMENT ON INDEX idx_tenant_name_lower IS 'Optimizes case-insensitive searches using LOWER() function';

-- 2. Full-text search index using PostgreSQL's tsvector
-- First, add a tsvector column for the name field
ALTER TABLE tenant ADD COLUMN name_tsv tsvector;

-- Create a function to automatically update the tsvector column
CREATE OR REPLACE FUNCTION tenant_name_trigger() RETURNS trigger AS $$
BEGIN
  NEW.name_tsv := to_tsvector('english', NEW.name);
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Create a trigger to update the tsvector column on insert or update
CREATE TRIGGER tenant_name_update 
BEFORE INSERT OR UPDATE ON tenant
FOR EACH ROW EXECUTE FUNCTION tenant_name_trigger();

-- Update existing records
UPDATE tenant SET name_tsv = to_tsvector('english', name);

-- Create a GIN index on the tsvector column for fast full-text search
CREATE INDEX idx_tenant_name_tsv ON tenant USING GIN (name_tsv);
COMMENT ON INDEX idx_tenant_name_tsv IS 'Enables fast full-text search with ranking capabilities';

-- 3. Prefix search index using text_pattern_ops
-- This optimizes LIKE 'prefix%' queries which are common in autocomplete
CREATE INDEX idx_tenant_name_prefix ON tenant (name text_pattern_ops);
COMMENT ON INDEX idx_tenant_name_prefix IS 'Optimizes prefix searches like LIKE "prefix%"';

-- 4. Trigram index for fuzzy matching
-- First, enable the pg_trgm extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create a GIN index on the name column using trigram similarity
CREATE INDEX idx_tenant_name_trigram ON tenant USING GIN (name gin_trgm_ops);
COMMENT ON INDEX idx_tenant_name_trigram IS 'Enables fuzzy search and similarity matching for typo tolerance';

-- Note: After adding these indexes, you should modify your queries to take advantage of them.
-- For example, for full-text search:
-- SELECT * FROM tenant WHERE name_tsv @@ to_tsquery('english', 'search_term');
-- 
-- For trigram similarity search:
-- SELECT * FROM tenant WHERE name % 'search_term' ORDER BY similarity(name, 'search_term') DESC LIMIT 10;
