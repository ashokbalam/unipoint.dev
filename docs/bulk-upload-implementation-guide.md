# Bulk Upload – Implementation Guide
_For Categories, Rubrics & Questions_

---

## 1. Feature Overview & Capabilities
The bulk-upload module allows administrators (God Mode users) to ingest or update, in a single operation:
* **Categories** – with optional _rubric_ ranges.  
* **Questions** – nested under each category, each with exactly **3** options and associated points.
* Multiple files per session (`.csv`, `.json`, ≤ 10 MB each).
* **Dry-Run** validation with full diff-style error report.
* Duplicate-handling strategies: **skip**, **update**, **error**.
* Progress bar, result dashboard, downloadable templates.

---

## 2. User-Friendliness Analysis
| UX Aspect | Implementation Detail | Benefit |
|-----------|-----------------------|---------|
| Drag-&-drop zone + file browser | `BulkUpload` React component | Familiar desktop metaphor |
| Inline parsing & preview | 1–10 preview lines (CSV) / prettified JSON | Early error detection |
| Duplicate strategy selector | `Select` + helper text | Non-tech admins understand effect |
| Dry-Run switch | Toggle converts upload to validation | Safe experimentation |
| Template download buttons | Pre-filled CSV & JSON | Reduces formatting mistakes |
| Granular result cards | Created / Updated / Skipped counters | Instant success metric |
| Accordion error table | Line, category, question, message | Quick fix guidance |

Result: **low cognitive load** (< 3 clicks from file to upload), self-guided error recovery, no docs required for casual use.

---

## 3. Required-Fields Validation Summary
### Category
* `name` – string, 1-80 chars, unique per tenant.
* `rubric` – optional `[ {min,max,storyPoints} ]`; rules  
  • ranges non-overlapping  
  • `storyPoints` unique  
  • `min ≤ max`.

### Question
* `text` – string, unique inside its category.
* `options` – array length = 3 with `{label, points}`.  
  • `label` non-empty string  
  • `points` number.

CSV fall-back columns (`option1_label`, `option1_points`, …) must collectively define three options.

---

## 4. Step-by-Step Implementation
1. **Dependencies**  
   `csv-parse`, `multer` (backend) • `@mui/material`/icons (frontend).
2. **Database**  
   No schema change; leverages existing `Category`, `Question` entities.
3. **API**  
   `POST /tenants/:tenantId/bulk-upload`  
   Middleware: `upload.array('files')` (10 MB limit, MIME filter).  
   Controller: `BulkUploadController.bulkUpload`.
4. **Parsing**  
   * JSON → direct `JSON.parse`.  
   * CSV → `csv-parse` then grouping logic (one row ⇒ one question).
5. **Validation** (shared)  
   `validateStructure()` enumerates all rules and populates `errors[]`.
6. **Persistence**  
   Transaction per request (`QueryRunner`) with batch size (default 50).  
   Duplicate strategy enacted during upsert.
7. **Frontend**  
   `BulkUpload` component integrates with Team selector; exposes `onComplete`.  
   Upload options bound to form controls; progress via `onUploadProgress`.
8. **Routing**  
   Add `BulkUploadPage` to React Router; guard with God Mode.
9. **Templates**  
   `GET /bulk-upload/template?format=csv|json` returns ready-to-edit examples.

---

## 5. Testing Guidelines
| Layer | Test Type | Tools |
|-------|-----------|-------|
| Unit (backend) | Validation helper edge-cases, rubric overlap detection | Jest |
| Integration (backend) | Upload happy-path, duplicate strategies, dry-run | Supertest + sqlite memory |
| UI unit | Component renders, option bindings | React Testing Library |
| E2E | Full drag-drop → commit flow | Playwright |
| Load | 5 k rows CSV, observe p95 < 400 ms | k6 |

Checklist:
- ✅ dry-run returns **no DB mutations** (compare row counts).  
- ✅ improper MIME rejected (HTTP 415).  
- ✅ duplicate “error” strategy rolls back entire transaction.

---

## 6. Security Considerations
1. **AuthZ** – route allowed only for God Mode / admin JWT.  
2. **File upload hardening**  
   • MIME & extension whitelist (.csv/.json)  
   • 10 MB size cap  
   • Stored in tmpfs; deleted post-parse.  
3. **SQL Injection** – uses TypeORM parameter binding.  
4. **DoS** – batch size limited to 500; controller aborts on >5 k rows.  
5. **XSS** – server never echoes raw file contents; UI sanitises previews.  
6. **Audit** – log `{userId, tenantId, counts, duration, success}`.

---

## 7. Performance Notes
* Parsing in-memory avoids disk I/O for small files; use streams when > 100 MB (future).  
* Batched inserts amortise round-trip (50 rows ≈ 2× faster than per-row).  
* Indexes on `category.name` + `question.text` ensure upsert search O(log n).  
* Redis cache invalidated after successful upload to refresh category list.

---

## 8. User Experience Flow
```
Admin selects Tenant
      ↓
Drag-drop / Browse files
      ↓
Preview & Options (duplicate, dry-run, batch)
      ↓
Validate (Dry-Run) ──┐
      ↓              │ errors? fix → repeat
Upload (real)        │
      ↓              │
Progress → Success dashboard
      ↓
Return to Categories view (optional)
```

---

## 9. Error-Handling Strategies
* **Validation errors** – aggregated, returned `200 OK` with `success:false`; UI shows accordion table.  
* **Duplicate conflicts** – handled per strategy; “error” => rollback & fail.  
* **File parsing** – per-file error stored in its row, others continue.  
* **Unexpected** – transaction rollback; API `500` with sanitized message in prod; logs verbose in dev.  
* **Partial failures** – counted as `skipped` (when `skip` strategy).  

---

## 10. Future Enhancements
1. **Background Job Queue** (BullMQ) → non-blocking large uploads; real-time status API.  
2. **Excel (.xlsx) support** using `xlsx` lib.  
3. **Inline rubric editor** after preview for quick fixes.  
4. **Versioning** – keep historical rubric & question sets.  
5. **Row-level rollback** – commit successful categories even if others fail.  
6. **Internationalisation** – translations in CSV header mapping.  
7. **AI CSV Linter** – smart suggestions (“Did you mean …?”).  
8. **GraphQL Mutation** alternative for single-page apps.  
9. **Server-side streaming validation** – push incremental results via SSE/WebSocket.  
10. **Permissions Matrix** – delegate uploads to team leads with scoped tenants.

---
_Last updated: 25 Jul 2025_
