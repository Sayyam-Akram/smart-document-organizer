# Smart Document Organizer - Start Guide

## Prerequisites
- Python 3.10+ with venv in `backend/venv`
- Node.js 18+ with packages in `frontend/node_modules`
- Google Gemini API key in `backend/.env`

---

## Quick Start (CMD Recommended)

### 1. Kill Any Running Servers First
Open **CMD** and run:
```cmd
# Kill port 3000 (Frontend)
for /f "tokens=5" %a in ('netstat -ano ^| findstr :3000') do taskkill /PID %a /F

# Kill port 8000 (Backend)  
for /f "tokens=5" %a in ('netstat -ano ^| findstr :8000') do taskkill /PID %a /F
```

### 2. Start Backend
Open **CMD** in project folder:
```cmd
cd backend
.\venv\Scripts\python.exe -m uvicorn main:app --reload
```
✅ Backend runs at: http://localhost:8000

### 3. Start Frontend (New CMD Window)
```cmd
cd frontend
npm start
```
✅ Frontend runs at: http://localhost:3000

---

## Terminal Recommendations

| Terminal | Works? | Notes |
|----------|--------|-------|
| **CMD** | ✅ Yes | Recommended - No script issues |
| **Git Bash** | ✅ Yes | Use `source venv/Scripts/activate` |
| **PowerShell** | ⚠️ Issues | Need to run: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |

---

## Common Issues

### "Port already in use"
Kill the process using the port (see Step 1 above), or press `Y` when React asks to use another port.

### "Scripts disabled" (PowerShell)
Either use CMD, or run this once in PowerShell as Admin:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Backend not connecting
Make sure backend is running FIRST at http://localhost:8000 before testing the frontend.

---

## Test the App
1. Go to http://localhost:3000
2. Create an account → Login
3. Upload a PDF or DOCX file
4. View organized documents
5. Click "AI Summary" on a document
