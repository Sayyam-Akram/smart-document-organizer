# 📄 Smart Document Organizer

> AI-powered document classification & summarization using React, FastAPI, and Google Gemini.

![Python](https://img.shields.io/badge/python-3.9+-green.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- 🔐 **User Auth** — Secure signup/login with JWT
- 📁 **AI Classification** — Automatically categorizes documents (Resume, Report, Legal, Other)
- 🤖 **AI Summarization** — Generate summaries using Google Gemini
- 📤 **Batch Upload** — Upload up to 5 PDF/DOCX files at once
- 📥 **Download ZIP** — Export all documents organized by category
- 🌙 **Dark Mode** — Beautiful light/dark theme toggle

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your_api_key_here" > .env
echo "JWT_SECRET_KEY=your-secret-key-here" >> .env

python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

**Open:** http://localhost:3000

## 📁 Project Structure

```
├── backend/
│   ├── main.py          # FastAPI app & routes
│   ├── auth.py          # JWT authentication
│   ├── classifier.py    # ML document classifier
│   ├── llm_service.py   # Gemini AI integration
│   └── database.py      # SQLite storage
│
├── frontend/
│   └── src/
│       ├── App.js       # React router
│       ├── pages/       # Auth, Upload, Organized pages
│       └── services/    # API service
```

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Tailwind CSS |
| Backend | FastAPI, Python |
| Database | SQLite |
| AI/ML | Google Gemini, Sentence Transformers |
| Auth | JWT, bcrypt |

## 📝 License

MIT License — feel free to use for your portfolio!

---

**Built by [Sayyam Akram](https://github.com/Sayyam-Akram)**