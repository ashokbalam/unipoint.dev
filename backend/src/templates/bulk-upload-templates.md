# Bulk Upload Templates  
_Comprehensive reference for uploading Categories & Questions for a Tenant_

---

## 1. Overview & Quick-Start

Bulk upload lets admins create or update **Categories**, their **Rubrics**, and nested **Questions** (with option points) in one shot.  
Supported formats:

* CSV – spreadsheet-friendly, one row per question  
* JSON – developer-friendly, nested objects  

**Quick Steps**

1. Download the template (`/bulk-upload/template?format=csv` or `json`).  
2. Fill in the required columns / properties.  
3. In the UI, select files → choose duplicate strategy → (optional) enable **Dry-Run**.  
4. Review validation preview → Upload.  
5. Check the result summary & fix any reported errors.

---

## 2. CSV Format

Each row represents **one Question**.  
Categories are inferred by the `category_name` column; multiple rows with the same category are grouped.

```csv
category_name,rubric,question_text,options,option1_label,option1_points,option2_label,option2_points,option3_label,option3_points
Backend,"[{""min"":0,""max"":10,""storyPoints"":1},{""min"":11,""max"":20,""storyPoints"":3}]","How many micro-services?","[{""label"":""<5"",""points"":0},{""label"":""5-10"",""points"":5},{""label"":"">10"",""points"":10}]",
DevOps,, "CI/CD frequency?",,Daily,0,Weekly,5,Monthly,10
```

### Column-by-Column Breakdown

| Column | Required | Notes |
|--------|----------|-------|
| `category_name` | ✅ | Case-insensitive, unique **per tenant**. |
| `rubric` | ⬜ | JSON array of `{min,max,storyPoints}`. Supply **once** (first row) per category or leave blank to keep existing. |
| `question_text` | ✅ | Unique inside its category. |
| `options` | ⬜ | JSON array of exactly **3** `{label,points}` objects. If omitted, use the next 6 columns. |
| `option1_label` … `option3_points` | ⬜ | Alternative to `options` field. Requires *all* six sub-columns. |

CSV **rules**

1. Exactly **3 options** required after parsing (JSON or 6 columns).  
2. Rubric ranges may **not overlap** & must have **unique** `storyPoints`.  
3. Numeric cells must be plain numbers (no “pts”, no commas).

---

## 3. JSON Format

```json
[
  {
    "name": "Frontend",
    "rubric": [
      { "min": 0, "max": 8, "storyPoints": 1 },
      { "min": 9, "max": 16, "storyPoints": 3 }
    ],
    "questions": [
      {
        "text": "Number of UI frameworks used?",
        "options": [
          { "label": "1", "points": 0 },
          { "label": "2", "points": 5 },
          { "label": "3+", "points": 10 }
        ]
      },
      {
        "text": "Component test coverage?",
        "options": [
          { "label": "<40 %", "points": 10 },
          { "label": "40–70 %", "points": 5 },
          { "label": ">70 %", "points": 0 }
        ]
      }
    ]
  }
]
```

JSON **rules**

* Array of Category objects (or single object).  
* Property names are **camelCase** exactly as shown.  
* `options` array must contain **three** items.  
* Omit `rubric` if you intend to keep the existing rubric.

---

## 4. Field Validation Rules

| Field | Type | Rules |
|-------|------|-------|
| `name` (Category) | string | 1–80 chars; trimmed; duplicate in tenant handled by strategy |
| `rubric[].min/max` | number | `min ≤ max`; integers recommended |
| `rubric[].storyPoints` | number | unique in array |
| `text` (Question) | string | 1–200 chars; unique inside category |
| `options[].label` | string | non-empty |
| `options[].points` | number | integer; duplicates allowed |

Duplicate handling strategies:

* **skip** – keep existing, ignore new  
* **update** – overwrite rubric/options  
* **error** – abort upload for that record

---

## 5. Common Scenarios & Best Practices

### Scenario A – Brand-new Team

1. Download template.  
2. Fill categories, rubrics, and questions.  
3. Use **duplicateStrategy = error** to catch accidental repeats.  

### Scenario B – Add Questions Only

* Leave `rubric` blank, include only new question rows.  
* Choose **skip** so existing categories remain untouched.

### Scenario C – Revise Rubrics

* Provide `rubric` JSON in a single row per category.  
* Use **update** strategy; leave `question_text` blank if no question changes.

### Best Practices

* Validate with **Dry-Run** before committing.  
* Keep CSV under 5 k rows; split large uploads.  
* Use consistent option order (0 → 5 → 10) to avoid user confusion.  
* Store your templates in version control for auditing.

---

## 6. Troubleshooting

| Error Message | Likely Cause | Fix |
|---------------|-------------|-----|
| `Rubric ranges must not overlap` | `min/max` intervals intersect | Adjust ranges so they do not overlap |
| `Each question must have exactly 3 options` | Missing option columns or JSON array length ≠ 3 | Provide three options |
| `Category "X" already exists` (strategy=error) | Duplicate in DB | Switch to **update/skip** or rename |
| `Invalid JSON` | Typo in JSON cell (CSV) | Validate JSON via linter or online tool |
| Upload hangs at 0 % | File >10 MB or network issue | Split file; check connection |

---

## 7. Examples for Different Team Types

### DevOps-Heavy Team (CSV excerpt)

```csv
category_name,rubric,question_text,option1_label,option1_points,option2_label,option2_points,option3_label,option3_points
CI/CD,"[{""min"":0,""max"":5,""storyPoints"":1},{""min"":6,""max"":10,""storyPoints"":3}]",Pipeline failures per month,≤2,0,3-5,5,>5,10
Monitoring,,Alert MTTR (mins),<10,0,10-30,5,>30,10
```

### Mobile-Focused Team (JSON)

```json
{
  "name": "Mobile",
  "questions": [
    {
      "text": "Supported OS versions?",
      "options": [
        { "label": "Current-1", "points": 0 },
        { "label": "Current-2", "points": 5 },
        { "label": "Older", "points": 10 }
      ]
    }
  ]
}
```

### AI/ML Team (mixing new & existing)

* CSV rows add new questions to existing “Data Science” category.  
* Rubric omitted to keep prior ranges.

---

### Need Help?

Contact the platform team (`#unipoint-support` Slack) or open a GitHub Issue with your upload file attached (remove sensitive data).

