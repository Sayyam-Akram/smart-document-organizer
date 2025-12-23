# 📄 Smart Document Organizer

> **AI-powered document classification system using local machine learning**
> 
> A full-stack web application demonstrating modern software engineering practices with React, FastAPI, and Transformers ML.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 🌟 Features

### Core Functionality
- ✅ **User Authentication**: Secure signup/login with bcrypt password hashing and JWT tokens
- 📁 **Smart Classification**: AI-powered document categorization (Resume, Report, Legal Document, Other)
- 📤 **Batch Upload**: Process up to 5 PDF documents simultaneously
- 🔍 **Document Management**: View organized documents by category with confidence scores
- 💾 **Memory Management**: Automatically maintains last 10 documents per user

### Technical Highlights
- 🤖 **Local ML**: No external APIs - runs 100% offline using sentence-transformers
- 🚀 **Fast & Lightweight**: ~80MB model, instant classification
- 🔒 **Secure**: Industry-standard authentication with bcrypt + JWT
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- 📝 **Well-Documented**: Extensive comments explaining AI/ML concepts

---

## 🏗️ Project Structure

```
smart-document-organizer/
├── backend/
│   ├── main.py              # FastAPI application & API endpoints
│   ├── auth.py              # Authentication logic (bcrypt, JWT)
│   ├── classifier.py        # ML classification engine
│   ├── pdf_utils.py         # PDF text extraction
│   ├── models.py            # Pydantic data models
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── src/
│   │   └── App.js           # React application (all components)
│   ├── package.json         # Node dependencies
│   └── public/
│
└── README.md                # This file
```

---

## 🚀 Quick Start

### Prerequisites

**System Requirements:**
- Python 3.9 or higher
- Node.js 16+ and npm
- 2GB free disk space (for ML model)
- 4GB RAM minimum

**Check versions:**
```bash
python --version    # Should show 3.9+
node --version      # Should show v16+
npm --version       # Should show 7+
```

---

## 📦 Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/smart-document-organizer.git
cd smart-document-organizer
```

### Step 2: Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# First run will download ML model (~80MB)
# This happens automatically - be patient!
```

**Expected output during first run:**
```
📥 Loading sentence-transformers model...
Downloading: 100%|████████| 80.0M/80.0M [00:30<00:00]
✅ Model loaded successfully!
🧮 Computing category embeddings...
✅ Classifier ready!
```

### Step 3: Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Should install React, Axios, Lucide icons, etc.
```

---

## ▶️ Running the Application

### Terminal 1: Start Backend

```bash
cd backend
source venv/bin/activate  # Activate venv if not active
python main.py
```

**Expected output:**
```
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

🌐 **Backend API**: http://localhost:8000
📚 **API Docs**: http://localhost:8000/docs (Swagger UI)

### Terminal 2: Start Frontend

```bash
cd frontend
npm start
```

**Expected output:**
```
Compiled successfully!
You can now view the app in your browser.

  Local:            http://localhost:3000
```

🎨 **Application**: http://localhost:3000

---

## 📖 Usage Guide

### 1. Create Account
- Navigate to http://localhost:3000
- Click "Sign Up"
- Enter username, email, and password (min 6 characters)
- Submit to create account

### 2. Login
- Enter your username and password
- Click "Login"
- You'll be redirected to the upload page

### 3. Upload Documents
- Click "Click to select PDF files" or drag & drop
- Select 1-5 PDF documents
- Click "Upload & Organize"
- Wait for classification (usually < 1 second per document)

### 4. View Organized Documents
- Click on category cards to see documents
- View confidence scores for each classification
- Upload more documents or logout

---

## 🤖 How the ML Classification Works

### The Magic Behind the Scenes

#### 1. **Embeddings: Text → Numbers**
```
"Resume: John Doe, Software Engineer" 
    ↓ 
[0.23, -0.15, 0.89, ..., 0.45]  (384 numbers)
```

Embeddings convert text into numerical vectors that capture semantic meaning. Similar texts have similar vectors.

#### 2. **Category Prototypes**
```python
Categories = {
    "Resume": "professional experience skills education",
    "Report": "analysis findings results data",
    "Legal": "agreement contract terms",
    "Other": "miscellaneous general"
}
```

Pre-defined text examples for each category are converted to embeddings.

#### 3. **Cosine Similarity**
```
Similarity = cos(θ) = (A · B) / (||A|| × ||B||)

Example:
Document vector: [0.5, 0.3, 0.8]
Resume vector:   [0.6, 0.4, 0.7]
Similarity: 0.87 ← High match!
```

Measures the "angle" between vectors:
- 1.0 = Identical (perfect match)
- 0.5 = Somewhat similar
- 0.0 = Unrelated

#### 4. **Classification Decision**
```
Similarities:
- Resume: 0.87 ← Winner!
- Report: 0.45
- Legal: 0.32
- Other: 0.28

Result: "Resume" with 87% confidence
```

---

## 🔧 Configuration

### Backend Settings

**Edit `backend/auth.py`:**
```python
SECRET_KEY = "your-secret-key-here"  # Change for production!
TOKEN_EXPIRY_HOURS = 24              # Token validity period
```

**Edit `backend/models.py`:**
```python
max_documents_per_user = 10   # Documents to keep per user
max_files_per_upload = 5      # Files per batch upload
```

### Frontend Settings

**Edit `frontend/src/App.js`:**
```javascript
const API_BASE = 'http://localhost:8000';  // Backend URL
```

---

## 🧪 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:8000/health

# Expected response:
{
  "status": "healthy",
  "classifier_loaded": true,
  "users_count": 0,
  "total_documents": 0
}
```

### Interactive API Testing

Visit: http://localhost:8000/docs

FastAPI provides an interactive Swagger UI where you can:
- Test all endpoints
- View request/response schemas
- Generate code samples

---

## 📊 System Architecture

```
┌─────────────┐        HTTP         ┌──────────────┐
│   React     │◄──────────────────►│   FastAPI    │
│  Frontend   │     JSON/Files      │   Backend    │
└─────────────┘                     └──────────────┘
                                            │
                                            ▼
                                    ┌──────────────┐
                                    │  In-Memory   │
                                    │   Storage    │
                                    └──────────────┘
                                            │
                                            ▼
                                    ┌──────────────┐
                                    │ Sentence-    │
                                    │ Transformers │
                                    │   Model      │
                                    └──────────────┘
```

### Request Flow

1. **User uploads PDF** → Frontend sends multipart/form-data
2. **Backend receives** → Extracts text with PyPDF2
3. **ML classification** → Generates embeddings, computes similarity
4. **Store & respond** → Saves document, returns category + confidence
5. **Frontend displays** → Shows organized view with categories

---

## 🔐 Security Best Practices

### Implemented Security

✅ **Password Hashing**: Bcrypt with automatic salt generation  
✅ **JWT Tokens**: Secure, stateless authentication  
✅ **Token Expiry**: 24-hour validity (configurable)  
✅ **Input Validation**: Pydantic models validate all inputs  
✅ **File Validation**: Only PDF files accepted  

### Production Recommendations

⚠️ **Change the secret key!**
```python
# DON'T use default in production
SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-key')
```

⚠️ **Use HTTPS in production**
```python
# Enable secure cookies
app.add_middleware(
    SessionMiddleware,
    secret_key=SECRET_KEY,
    https_only=True
)
```

⚠️ **Use real database**
```python
# Replace in-memory storage
from sqlalchemy import create_engine
DATABASE_URL = "postgresql://user:pass@localhost/dbname"
```

---

## 🚀 Performance Optimization

### Current Performance

| Metric | Value |
|--------|-------|
| Model Load Time | 3-5 seconds (first run) |
| Classification Speed | ~100ms per document |
| Memory Usage | ~500MB (model + app) |
| File Size Limit | 10MB per PDF |

### Optimization Tips

**1. Batch Processing**
```python
# Process multiple documents in parallel
import concurrent.futures

with concurrent.futures.ThreadPoolExecutor() as executor:
    results = executor.map(classify_document, documents)
```

**2. Model Caching**
```python
# Model loads once at startup, cached for all requests
@lru_cache(maxsize=1)
def load_model():
    return SentenceTransformer('all-MiniLM-L6-v2')
```

**3. Text Truncation**
```python
# Limit text length for faster processing
text = text[:2000]  # First 2000 characters
```

---

## 🔄 Upgrading to LLM APIs (Optional)

Want more sophisticated classification? Replace local ML with ChatGPT or Gemini!

### Option 1: OpenAI ChatGPT

**Install:**
```bash
pip install openai
```

**Replace in `classifier.py`:**
```python
import openai

def classify_with_chatgpt(text):
    openai.api_key = "your-api-key"
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{
            "role": "user",
            "content": f"Classify this document: {text[:1000]}"
        }]
    )
    return response.choices[0].message.content
```

### Option 2: Google Gemini

**Install:**
```bash
pip install google-generativeai
```

**Replace in `classifier.py`:**
```python
import google.generativeai as genai

def classify_with_gemini(text):
    genai.configure(api_key="your-api-key")
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(f"Classify: {text[:1000]}")
    return response.text
```

**Cost Comparison:**
- **Local ML**: $0 (completely free!)
- **ChatGPT**: ~$0.002 per document
- **Gemini**: ~$0.001 per document

---

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start
```
Error: ModuleNotFoundError: No module named 'sentence_transformers'
```
**Solution:** Install dependencies
```bash
pip install -r requirements.txt
```

#### Frontend connection error
```
Error: Failed to connect to server
```
**Solution:** Make sure backend is running on port 8000
```bash
curl http://localhost:8000/health
```

#### Model download fails
```
Error: SSL certificate verify failed
```
**Solution:** Temporary fix (not recommended for production)
```bash
pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org sentence-transformers
```

#### Port already in use
```
Error: Address already in use
```
**Solution:** Kill process or use different port
```bash
# Find process
lsof -i :8000
# Kill process
kill -9 <PID>
# Or change port
uvicorn main:app --port 8001
```

---

## 📚 Further Learning

### Understanding Embeddings
- [Sentence Transformers Documentation](https://www.sbert.net/)
- [Understanding Word Embeddings](https://jalammar.github.io/illustrated-word2vec/)

### FastAPI Resources
- [Official Tutorial](https://fastapi.tiangolo.com/tutorial/)
- [Real Python Guide](https://realpython.com/fastapi-python-web-apis/)

### React Best Practices
- [React Documentation](https://react.dev/)
- [React Hooks Guide](https://react.dev/reference/react)

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👨‍💻 Author

**Your Name**
- Portfolio: [yourportfolio.com](https://yourportfolio.com)
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourname)

---

## 🙏 Acknowledgments

- **Sentence Transformers**: For the amazing pre-trained models
- **FastAPI**: For the excellent web framework
- **React**: For the powerful UI library
- **HuggingFace**: For hosting the ML models

---

## 📈 Roadmap

### Version 1.1 (Planned)
- [ ] Add document preview functionality
- [ ] Implement search across documents
- [ ] Add export to CSV/JSON
- [ ] Dark mode theme

### Version 2.0 (Future)
- [ ] PostgreSQL database integration
- [ ] User profile management
- [ ] Document sharing between users
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

---

## 💡 Tips for Portfolio/Resume

**Highlight these skills:**
- ✨ Full-stack development (React + FastAPI)
- 🤖 Machine Learning integration (transformers)
- 🔒 Security implementation (authentication, encryption)
- 📊 System design (architecture, data flow)
- 📝 Documentation & code quality
- 🎨 UI/UX design (responsive, modern)

**Talking points for interviews:**
- "Implemented local ML classification to avoid API costs"
- "Designed scalable architecture with user-scoped data"
- "Used embeddings for semantic document understanding"
- "Built secure authentication with industry-standard practices"

---

**Made with ❤️ by developers, for developers**