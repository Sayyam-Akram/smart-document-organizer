# Smart Document Organizer - Project Context

Complete reference for understanding and working with this codebase.

---

## 📋 Project Overview

A full-stack AI-powered document classification and summarization tool.

**Tech Stack:**
- **Frontend:** React 18 + Tailwind CSS
- **Backend:** FastAPI + Python 3.13
- **ML:** Sentence Transformers (MiniLM-L6-v2)
- **LLM:** Google Gemini 2.5 Flash (via google-genai SDK)
- **Auth:** JWT + bcrypt

---

## 🗂️ Complete File Structure

```
smart-document-organizer/
├── backend/
│   ├── main.py              # FastAPI app, all routes
│   ├── classifier.py        # ML document classifier
│   ├── llm_service.py       # Gemini LLM integration
│   ├── auth.py              # JWT/bcrypt authentication
│   ├── models.py            # Pydantic data models
│   ├── pdf_utils.py         # PDF text extraction
│   ├── docx_utils.py        # DOCX text extraction
│   ├── llm_test.py          # Test file for Gemini API
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # API keys (gitignored)
│   ├── .env.example         # Environment template
│   └── venv/                # Python virtual environment
│
├── frontend/
│   ├── src/
│   │   └── App.js           # Main React app (all pages)
│   ├── public/
│   │   └── index.html       # HTML + Tailwind config
│   ├── package.json         # Node dependencies
│   └── .env                 # BROWSER=none (prevents double tabs)
│
├── QUICKSTART.md            # Setup instructions
├── FUTURE_CHANGES.md        # Planned enhancements
├── readme.md                # Project documentation
├── .gitignore               # Git ignore rules
└── setup.sh                 # Setup script
```

---

## 🔧 Backend Architecture

### main.py (298 lines)
FastAPI application with routes:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check |
| `/signup` | POST | User registration |
| `/login` | POST | User authentication |
| `/upload-documents` | POST | Upload & classify files |
| `/categories` | GET | Get category counts |
| `/documents` | GET | Get docs by category |
| `/summarize` | POST | AI document summary |
| `/llm-status` | GET | Check LLM availability |

**Key Components:**
- In-memory storage: `users_db`, `documents_db`, `document_texts` (dicts)
- CORS enabled for localhost:3000
- Max 5 files per upload, 20 docs per user

### classifier.py (188 lines)
ML-based document classification:

**Model:** `sentence-transformers/all-MiniLM-L6-v2`

**Categories:**
1. Resume - CVs, work history, skills
2. Report - Analysis, findings, metrics
3. Legal Document - Contracts, agreements
4. Other - Poems, stories, misc

**Classification Logic:**
1. Preprocess text (clean, lowercase, truncate)
2. Check for "Other" indicators (poem, story, etc.)
3. Generate document embedding
4. Calculate cosine similarity to category prototypes
5. Count strong keyword matches
6. Combine similarity + keywords for final decision
7. Normalize confidence to 70%-95% range

### llm_service.py (190 lines)
Gemini LLM integration:

**Model:** `gemini-2.5-flash` (confirmed working)
**SDK:** `google-genai` (new official SDK)

**Features:**
- Singleton pattern for efficiency
- Retry logic (3 attempts) for rate limits
- JSON response parsing with 3 fallback strategies
- Minimal token usage (~300 per summary)

### auth.py (41 lines)
Authentication utilities:
- `hash_password()` - bcrypt hashing
- `verify_password()` - bcrypt verification
- `create_token()` - JWT generation (24h expiry)
- `verify_token()` - JWT validation

### models.py (35 lines)
Pydantic models:
- `SignupRequest` - username, email, password (validated)
- `LoginRequest` - username, password
- `User` - stored user data
- `Document` - classified document data

### pdf_utils.py (34 lines)
PDF extraction using PyPDF2:
- Handles encrypted PDFs (returns empty)
- Extracts text from all pages
- Logs extraction stats

### docx_utils.py (39 lines)
DOCX extraction using python-docx:
- Extracts paragraphs and table cells
- Handles import errors gracefully

---

## 🎨 Frontend Architecture

### App.js (1169 lines)
Single React file with all components:

**Pages:**
- `SignupPage` - User registration
- `LoginPage` - User login with animated quotes
- `UploadPage` - File upload with processing indicator
- `OrganizedPage` - Category-based document view

**Components:**
- `Logo` - App branding
- `AnimatedQuote` - Rotating quotes
- `BackButton` - Navigation
- `PasswordRequirements` - Password validation hints
- `FeatureCard` - Feature highlights
- `SummaryModal` - AI summary display
- `ProcessingIndicator` - Upload progress

**Styling:**
- Bookish theme (cream, brown, golden colors)
- Custom CSS classes in index.html
- Tailwind for utilities

**API Service:**
- `api.signup/login/uploadDocuments/getCategories/getDocuments/summarizeDocument/getLLMStatus`

---

## 🔑 Environment Variables

### backend/.env
```
GEMINI_API_KEY=AIzaSyBQksTPN...  # Working Gemini key
JWT_SECRET_KEY=...               # Change in production
TOKEN_EXPIRY_HOURS=24
HOST=0.0.0.0
PORT=8000
MIN_CONFIDENCE_THRESHOLD=0.70
```

### frontend/.env
```
BROWSER=none  # Prevents double browser tabs
```

---

## 🚀 Running the Application

### Backend
```bash
cd backend
source venv/bin/activate
python main.py
# Runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

---

## 📊 Current Capabilities

| Feature | Status |
|---------|--------|
| PDF Upload | ✅ Working |
| DOCX Upload | ✅ Working |
| ML Classification | ✅ 70-95% confidence |
| AI Summarization | ✅ gemini-2.5-flash |
| User Auth | ✅ JWT + bcrypt |
| Category View | ✅ 4 categories |
| Poem Detection | ✅ Goes to "Other" |

---

## ⚠️ Known Limitations

1. **In-memory storage** - Data lost on server restart
2. **No password reset** - Users must re-register
3. **No email verification** - Anyone can signup
4. **Rate limits** - Gemini free tier has quotas
5. **Single server** - Not horizontally scalable

---

## 🔮 Next Steps (See FUTURE_CHANGES.md)

1. Database integration (PostgreSQL)
2. Cloud deployment (Railway + Vercel)
3. More LLM features (Q&A, tags)
4. UI enhancements (dark mode, animations)

---

*Last Updated: December 17, 2024*
