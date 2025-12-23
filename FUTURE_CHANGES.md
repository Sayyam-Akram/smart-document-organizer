# Future Changes - Smart Document Organizer

Updated feature roadmap with prioritized improvements.

---

## ✅ Completed Features

- [x] User authentication (signup/login)
- [x] Document upload (PDF/DOCX)
- [x] ML classification (Resume, Report, Legal, Other)
- [x] AI summarization with Gemini LLM
- [x] SQLite database persistence
- [x] Responsive UI with bookish theme
- [x] **Dark Mode** - Theme toggle with localStorage persistence
- [x] **Document Search** - Filter by filename
- [x] **Rate Limiting** - 10 uploads/min, 20 summaries/hour

---

## 🚀 Upcoming Features

### 1. 🗑️ Delete Document
**Priority:** High | **Difficulty:** Easy | **Time:** 15 min

Allow users to delete uploaded documents.

**Changes:**
- `database.py` - Add `delete_document()` function
- `main.py` - Add `DELETE /documents/{id}` endpoint
- `App.js` - Add delete button with confirmation

---

### 2. 📦 Download Organized ZIP
**Priority:** High | **Difficulty:** Medium | **Time:** 30 min

Export all documents as organized ZIP folder structure.

**Output:**
```
organized-docs.zip
  ├── Resume/
  │   └── john_resume.pdf
  ├── Report/
  │   └── quarterly_report.pdf
  └── Legal Document/
      └── contract.pdf
```

**Changes:**
- `database.py` - Store original file bytes
- `main.py` - Add `GET /download-organized` endpoint
- `App.js` - Add "Download Organized" button

---

### 3. 📊 Analytics Dashboard

**Priority:** Low | **Difficulty:** Medium | **Time:** 45 min

Show usage statistics and insights.

**Metrics:**
- Total documents uploaded
- Documents per category (pie chart)
- Upload trends over time
- Storage usage

**Changes:**
- `main.py` - Add `GET /analytics` endpoint
- `App.js` - Create AnalyticsDashboard component

---

## ☁️ Deployment Phase

### Backend → Render (Free)
- [ ] Create Dockerfile
- [ ] Configure environment variables
- [ ] Set up auto-deploy from GitHub

### Frontend → Vercel (Free)
- [ ] Update API_BASE URL
- [ ] Configure CORS for production
- [ ] Deploy from GitHub

---

## Implementation Order

1. Delete Document _(essential)_
2. Download Organized ZIP _(core feature)_
3. Analytics Dashboard _(insights)_
4. Deploy to Cloud _(go live!)_

---

*Last Updated: December 21, 2024*
