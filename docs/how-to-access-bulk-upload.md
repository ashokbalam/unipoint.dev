# How to Access & Use the Bulk Upload Feature

This guide walks you through enabling the admin (“God Mode”) interface and uploading **Categories**, **Rubrics**, and **Questions** in bulk.

---

## 1 – Start the Application

| Environment | Command |
|-------------|---------|
| **Local (Docker Compose)** | `docker compose up --build` |
| **Local (node)**<br/>Backend | `cd backend && npm run dev` |
|  | Ensure PostgreSQL 🐘 is running (`.env` variables set). |
| **Frontend** | `cd frontend && npm run dev` (Vite dev server) |

Once both servers are up:

```
Frontend:  http://localhost:5173
Backend:   http://localhost:4000
```

---

## 2 – Enable God Mode (Admin Access)

1. Open the web app in your browser.  
2. In the **top-right nav bar** click the **lock icon** or any *struck-through* admin link.  
3. When prompted, enter the pass-code:

```
admin123
```

> You will see the nav links lose their strikethrough and an **orange “GOD MODE” badge** appear next to page headers.

---

## 3 – Navigate to **Bulk Upload**

1. In the main navigation, click **Upload** (appears only in God Mode).  
2. URL changes to `/bulk-upload`.

### Visual Cue

```
┌────────────────────────────┐
│  Estimate  Teams Categories  Questions  Upload│
│                                   ^ orange underline on hover
└────────────────────────────┘
```

---

## 4 – Using the Bulk Upload Page

### 4.1 Select a Team

* A **“Select a Team”** drop-down lists all tenants.
* Pick the team you want to populate.  
  The upload widget activates once a team is selected.

### 4.2 Add Files

| Method | How |
|--------|-----|
| **Drag-&-Drop** | Drop `.csv` or `.json` files onto the dashed area. |
| **Browse** | Click the area to open the file dialog. |

* Max size **10 MB** each; multiple files allowed.

### 4.3 Preview & Options

* **Preview Panel** shows:
  * Total categories / questions detected.
  * First 10 CSV lines or pretty-printed JSON.
* **Upload Options:**
  * **Duplicate Strategy:** Skip • Update • Error
  * **Batch Size:** 1 – 500 (default 50)
  * **Dry Run** toggle (validate only)

### 4.4 Validate or Upload

| Button | Action |
|--------|--------|
| **Validate Data** | (Dry Run on) parses & validates without DB writes. |
| **Upload Data** | Commits to DB; progress bar indicates 0 → 100 %. |

### 4.5 Result Dashboard

After completion you’ll see:

* Success / Failed chip  
* Cards: *Processed • Created • Updated • Skipped*  
* **Errors accordion** with line, category, message.  
* If Dry Run succeeded, click **“Proceed with Actual Upload”** to commit.

---

## 5 – UI Walk-through (Textual Screenshots)

1. **Drag-Drop Zone**

```
┌────────────────────────────────────────────┐
│  ⬆️  Drag & Drop Files Here                │
│      or click to browse                    │
│  Supported formats: CSV, JSON (max 10 MB)  │
└────────────────────────────────────────────┘
```

2. **File Table**

```
┌───────────────────────────────────────────────────────────────┐
│ File Name     Type  Size   Status   [🗑]                      │
├───────────────────────────────────────────────────────────────┤
│ upload.csv    CSV   6 KB   ✅ Valid                           │
└───────────────────────────────────────────────────────────────┘
```

3. **Upload Summary & Button**

```
Ready to upload 1 file with 3 categories and 15 questions.
[ Validate Data ]   (large primary button)
```

4. **Result Dashboard (Success)**

```
🟢 Success  | Upload completed successfully
┌── Cards ──┐               ┌── Errors (0) ──┐
│Created 3  │               │(collapsed)     │
└───────────┘               └───────────────┘
```

---

## 6 – Troubleshooting

| Symptom | Possible Cause | Fix |
|---------|----------------|-----|
| **Upload link greyed / struck-through** | God Mode disabled | Click link, enter pass-code. |
| **“Only CSV and JSON files are allowed”** | Wrong file type | Ensure `.csv` or `.json`. |
| **Validation fails: “Rubric ranges overlap”** | Overlapping `min/max` in rubric | Adjust ranges so intervals don’t intersect. |
| **Progress bar stuck at 0 %** | File > 10 MB or network issue | Split file; check backend logs. |
| **HTTP 500 during upload** | DB connection/env mis-config | Check `.env` DB creds, backend console. |
| **Questions not visible after upload** | Cached list | Refresh page or clear Redis cache if enabled. |

---

### Need Help?

* Slack: **#unipoint-support**  
* Email: `platform@unipoint.dev`

_Last updated: 25 Jul 2025_
