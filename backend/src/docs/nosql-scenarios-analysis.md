# NoSQL Scenarios Analysis  
_When a switch (or addition) to NoSQL becomes beneficial for **unipoint.dev**_

---

## 1. Data-Pattern Shifts That Favour NoSQL

| Pattern Change | Rationale for NoSQL | Suitable NoSQL Model |
|----------------|---------------------|----------------------|
| **Document-centric objects** become deeply nested (≥ 3 levels) and vary per tenant (custom fields, per-question metadata) | Schemaless design prevents constant migrations | Document DB (MongoDB, Couchbase) |
| **High-volume append-only event streams** (answers, telemetry) produced at ≥ 5 k writes/sec | Write-optimised, horizontally-scalable stores | Wide-column (Cassandra), Log DB (Kafka + tiered storage) |
| **Real-time collaboration data** (typing indicators, presence) with sub-50 ms latency + TTL expiry | Memory-first, key/value store, automatic eviction | Redis / DynamoDB DAX |
| **Search-first access** (complex fuzzy search, faceting) on Questions/Answers across millions of docs | Inverted indices & scoring | Elasticsearch / OpenSearch |
| **Graph relationships** emerge (dependency mapping between questions, category prerequisites) | Graph traversal outperforms joins | Neo4j / Amazon Neptune |

---

## 2. Scale Thresholds Where NoSQL Outperforms

| Dimension | PostgreSQL Sweet-Spot | NoSQL Advantage Beyond |
|-----------|-----------------------|------------------------|
| **Write throughput** | ≤ 10 k writes/min (single writer) | > 100 k writes/min sustained |
| **Dataset size** | ≤ 1 TB active, 5 TB cold (RDS) | Petabyte-scale with shard-per-table (Cassandra) |
| **Concurrent connections** | ≤ 10 k (with pgBouncer) | 100 k+ concurrent HTTP/SDK calls (DynamoDB) |
| **Full-text search QPS** | ≤ 1 k QPS (tsvector) | > 10 k QPS, sub-100 ms (Elasticsearch) |
| **Low-latency (<10 ms) key lookup** | In-memory cache required | Built-in (Redis Cluster, DynamoDB Accelerator) |

_Note_: Numbers assume >3× replication for HA.

---

## 3. Polyglot Persistence Strategies

1. **Source-of-truth in PostgreSQL, high-volume writes in NoSQL**  
   • Append user answer events to DynamoDB stream → periodic batch to Postgres for reporting.  

2. **CQRS (Command-Query Responsibility Segregation)**  
   • Commands (writes) hit Kafka topic → consumers store in Postgres and Elasticsearch; queries go to Elasticsearch.

3. **Cache-Aside Pattern**  
   • Keep Redis Cluster for ultra-fast tenant/autocomplete reads; fall back to Postgres on miss.  

4. **Event-carried State Transfer**  
   • Postgres triggers publish `NOTIFY` events → Change-Data-Capture (Debezium) replicates to MongoDB read models for flexible dashboards.

---

## 4. Hybrid Approaches

| Concern | Store | Responsibility |
|---------|-------|----------------|
| **Transactional integrity** | PostgreSQL | Tenants, Categories, Questions metadata |
| **Autoscale reads (<5 ms)** | Redis | Autocomplete suggestions & hot tenants |
| **Large-scale search** | Elasticsearch | Fuzzy, stemming, faceted search |
| **Time-series analytics** | TimescaleDB _or_ InfluxDB | Answer events, engagement metrics |
| **Cold archival** | S3 + Athena | >1 year historical answers, cost-optimised queries |

All stores synchronise via CDC pipelines (Debezium → Kafka).

---

## 5. Example Reference Architectures

### 5.1 Medium Scale (≤ 10 k Active Users)

```
React UI ──► API Gateway ──► Node/Express
                        │
                        ├─► PostgreSQL (Aurora)  ←── CDC ───┐
                        │                                    │
                        └─► Redis (Elasticache) ◄─ Cache ────┘
```

*Switch Trigger*: search QPS grows >2 k → add Elasticsearch side-car.

---

### 5.2 High Scale (50 k – 500 k Active Users)

```
Clients
  │
  ├─► GraphQL / REST Federation
  │
  ├─► Write Service ─► Kafka ─► DynamoDB  (answers stream)
  │                   │
  │                   └─► Debezium → PostgreSQL (metadata)
  │
  └─► Read Service  ─► Elasticsearch (search)
                       ▲
                       └─ Lambda consumer from Kafka to build search docs
```

*Benefits*: horizontal writes, elastic search, Postgres remains authoritative.

---

### 5.3 Massive Scale (1 M+ Active Users, Global)

```
Edge Clients
   │
   ├─► Global API Edge (CloudFront + Lambda@Edge)
   │
   ├─► Regional Write APIs ─► Kafka (multi-region) ─► Cassandra (event log)
   │                                          │
   │                                          └─► Spark jobs → S3 data lake → Athena
   │
   └─► Search APIs ─► OpenSearch (cross-cluster) ─► RedisEdge CDN cache
```

*Characteristics*  
• Multi-region active-active writes  
• Geo-partitioned NoSQL (Cassandra) for <50 ms local writes  
• Post-processed analytics in lakehouse; Postgres remains for control data only.

---

## Decision Flowchart (Textual)

1. **Are writes > 10 k/min?**  
   • No → stay on Postgres + Redis.  
   • Yes → proceed.

2. **Need multi-document joins?**  
   • Yes → Postgres sharding (Citus) or cross-partition DynamoDB transactions → evaluate effort.  
   • No → DynamoDB/Cassandra viable.

3. **Search QPS > 3 k with fuzzy queries?**  
   • Yes → Add Elasticsearch.  
   • No → PostgreSQL full-text with GIN index sufficient.

4. **Latency SLA < 10 ms globally?**  
   • Yes → Edge cache (CloudFront + Redis global).  
   • No → standard regional deployment.

---

## Key Takeaways

1. **Stay relational** until data patterns or scale cross specific inflection points.  
2. **Adopt polyglot** incrementally—start with read-side search or caching.  
3. **Maintain single source-of-truth** (PostgreSQL) to minimise consistency bugs.  
4. **Plan CDC early**; data pipelines become harder once scale forces migration.  
5. **Re-evaluate annually**; today’s thresholds change with cloud offerings and traffic growth.
