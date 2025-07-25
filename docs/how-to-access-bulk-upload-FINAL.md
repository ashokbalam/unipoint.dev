# Bulk Upload Feature – Final User Guide

Welcome, Admin!  
The new Bulk Upload workflow lets you create or update large sets of **Categories** and **Questions** in minutes. This guide walks you through every step — from entering God Mode to troubleshooting common errors.

---

## 1. Enter God Mode

Bulk upload is restricted to administrators.

1. Log in to the frontend.
2. Click the orange **“GOD MODE”** toggle (top-right navigation bar).  
3. Enter the pass-code **`admin123`**.  
   • If accepted, a **GOD MODE** badge appears next to the toggle.  
   • To exit, click the toggle again.

> You will not see the **Upload** link until God Mode is active.

---

## 2. Navigate to the Bulk Upload Page

• In the top navigation bar click **Upload**  
  or go directly to `http://localhost/bulk-upload`.

The page title shows **Bulk Upload GOD MODE** to remind you you’re in admin mode.

---

## 3. Select the Target Team (Tenant)

1. In **Select a Team** dropdown, choose the tenant that should receive the new data.  
2. When you switch tenants any previous preview or results reset automatically.

---

## 4. Download & Prepare Your File(s)

### 4.1 Template Download

Use the buttons at the top of the page:

* **⬇️ Download CSV Template** → `bulk_upload_template.csv`  
* **⬇️ Download JSON Template** → `bulk_upload_template.json`

### 4.2 File Specifications

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` / `category_name` | string | ✓ | Category title |
| `rubric` | array \<RubricRange\> | – | JSON string in CSV, array in JSON |
| `questions` | array \<Question\> | – | Only in JSON |
| `question_text` | string | – | CSV only |
| `options` | array\<Option\> OR 3× option columns | – | Each category/question **must** have **exactly 3** options |

RubricRange structure:

```json
{ "min": 0, "max": 10, "storyPoints": 1 }
```

Question option structure:

```json
{ "label": "Yes", "points": 5 }
```

> • **Max file size:** 10 MB  
> • Multiple files allowed — mix CSV & JSON as needed.

---

## 5. Upload Workflow

### 5.1 Add Files

* Drag-and-drop onto the dashed panel **or** click to browse.  
* Invalid files show a red ❌ status.

### 5.2 Preview

A live preview counts categories & questions and shows:

* JSON tree (first 10 lines for CSV)
* Errors in red rows (before any data is saved)

### 5.3 Configure Options

| Option | Description |
|--------|-------------|
| **Duplicate Strategy** | `skip` (default) • `update` • `error` |
| **Batch Size** | 1-500 items per DB batch (default 50) |
| **Dry Run** | Validate without persisting. Recommended first! |

### 5.4 Validate (Dry Run)

1. Tick **Dry Run**.  
2. Press **Validate Data**.  
3. Review the results:
   * Green **Success** chip → no schema errors.
   * Red **Failed** chip → expand **Errors** accordion for details.

### 5.5 Commit the Real Upload

1. If Dry Run is clean, un-tick **Dry Run**.  
2. Click **Upload Data**.  
3. Progress bar shows network upload %, followed by server processing.  
4. On success the results pane lists **Created**, **Updated**, **Skipped** counts.

---

## 6. Understanding the Result Chips

* **Success (green):** All data inserted/updated.  
* **Failed (red):** At least one error; nothing is committed if you chose `error` strategy.  
* **Dry Run (blue):** Validation only — DB unchanged.

---

## 7. Troubleshooting

| Issue | Cause / Fix |
|-------|-------------|
| **“Admin Access Required”** page | You are not in God Mode. Activate with the pass-code. |
| **File size exceeds limit** | Split the file or compress questions into multiple files. |
| **“Unsupported file type”** | Only `.csv` or `.json` are accepted. |
| **“Each question must have exactly 3 options”** | Ensure every question has **three** options with `label` and `points`. |
| **Duplicate errors** when strategy = `error` | Switch to `skip` or `update` if duplicates are expected. |
| **Backend refuses SSL connection** (local dev) | Set `DB_SSL=false` in backend `.env` **or** use Docker Compose which already connects to the remote RDS. |
| **Docker build fails** during dev | Run `docker compose up --build --remove-orphans` after pulling latest code. |
| **Frontend blank after build** | Clear browser cache or run `docker compose restart frontend`. |

---

## 8. Quick CLI Checks (Optional)

```bash
# Check backend health
curl -s http://localhost:4000/health  # {"status":"ok"}

# Download templates
curl -O http://localhost:4000/bulk-upload/template?format=json
curl -O http://localhost:4000/bulk-upload/template?format=csv
```

---

## 9. Next Steps & Best Practices

1. **Always dry-run** first in production.  
2. Keep rubric ranges **non-overlapping** and story points **unique** per category.  
3. Use **batch size 100-200** for large (>10 k rows) uploads to optimise DB locks.  
4. Version-control your JSON templates for auditing.

Happy uploading! 🎉
