"""FastAPI Backend Application - Smart Document Organizer (Production Ready)"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
import uuid
import os
import re
import logging
from dotenv import load_dotenv

# Rate Limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Load environment variables first
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

from auth import hash_password, verify_password, create_token, verify_token
from classifier import DocumentClassifier
from pdf_utils import extract_text_from_pdf
from docx_utils import extract_text_from_docx
from models import SignupRequest, LoginRequest, User, Document
from llm_service import get_llm_service
import database as db

# ========================================
# Configuration from Environment
# ========================================
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

# Rate limiter - uses IP address for identification
limiter = Limiter(key_func=get_remote_address)

# Initialize app
app = FastAPI(
    title="Smart Document Organizer",
    description="AI-powered document classification and summarization",
    version="2.2.0"
)

# Add rate limiter to app state and exception handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS - Configurable via environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
db.init_db()

# ML Classifier
classifier = DocumentClassifier()


# ========================================
# Request/Response Models
# ========================================
class SummarizeRequest(BaseModel):
    document_id: str


class SummarizeResponse(BaseModel):
    success: bool
    summary: Optional[str] = None
    key_points: List[str] = []
    document_type: Optional[str] = None
    error: Optional[str] = None


# ========================================
# Helper Functions
# ========================================
def get_current_user(authorization: str = Header(None)) -> str:
    """Get username from token"""
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="No token provided")
    
    token = authorization.split(' ')[1]
    username = verify_token(token)
    
    if not username or not db.user_exists(username):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return username


def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal and injection"""
    # Remove path separators and null bytes
    filename = os.path.basename(filename)
    filename = filename.replace('\x00', '')
    # Keep only safe characters
    filename = re.sub(r'[^\w\s\-\.]', '_', filename)
    return filename[:255]  # Limit length


# ========================================
# Routes - Authentication
# ========================================
@app.post("/signup")
@limiter.limit("5/minute")  # Prevent brute force registration
async def signup(request: Request, body: SignupRequest):
    """Create new account"""
    if db.user_exists(body.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    
    if db.email_exists(body.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    password_hash = hash_password(body.password)
    db.create_user(body.username, body.email, password_hash)
    
    logger.info(f"New user registered: {body.username}")
    return {"message": "Account created successfully", "username": body.username}


@app.post("/login")
@limiter.limit("10/minute")  # Prevent brute force login
async def login(request: Request, body: LoginRequest):
    """Login user"""
    user = db.get_user(body.username)
    
    if not user:
        logger.warning(f"Login attempt for non-existent user: {body.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(body.password, user["password_hash"]):
        logger.warning(f"Failed login attempt for user: {body.username}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(body.username)
    logger.info(f"User logged in: {body.username}")
    return {"token": token, "username": body.username, "message": "Login successful"}


# ========================================
# Routes - Documents
# ========================================
@app.post("/upload-documents")
@limiter.limit("10/minute")
async def upload_documents(
    request: Request,
    files: List[UploadFile] = File(...),
    username: str = Header(None, alias="Authorization")
):
    """Upload and classify documents (PDF and DOCX supported)"""
    username = get_current_user(username)
    
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 files allowed per upload")
    
    allowed_extensions = ['.pdf', '.docx']
    results = []
    
    for file in files:
        # Sanitize filename
        safe_filename = sanitize_filename(file.filename)
        
        # Check file extension
        filename_lower = safe_filename.lower()
        file_ext = None
        for ext in allowed_extensions:
            if filename_lower.endswith(ext):
                file_ext = ext
                break
        
        if not file_ext:
            raise HTTPException(
                status_code=400, 
                detail=f"{safe_filename} is not a supported file type. Only PDF and DOCX files are allowed."
            )
        
        content = await file.read()
        
        # Check file size
        if len(content) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"{safe_filename} exceeds maximum file size of {MAX_FILE_SIZE_MB}MB"
            )
        
        # Extract text based on file type
        try:
            if file_ext == '.pdf':
                text = extract_text_from_pdf(content)
            elif file_ext == '.docx':
                text = extract_text_from_docx(content)
            else:
                text = ""
        except Exception as e:
            logger.error(f"Error extracting text from {safe_filename}: {e}")
            text = ""
        
        if not text or len(text.strip()) < 50:
            results.append({
                "filename": safe_filename,
                "category": "Other",
                "confidence": 0.70
            })
            continue
        
        category, confidence = classifier.classify(text)
        
        doc_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()
        
        # Store document and text in database
        db.add_document(
            doc_id=doc_id,
            username=username,
            filename=safe_filename,
            category=category,
            confidence=confidence,
            timestamp=timestamp,
            text=text
        )
        
        results.append({
            "id": doc_id,
            "filename": safe_filename,
            "category": category,
            "confidence": round(confidence, 3)
        })
    
    logger.info(f"User {username} uploaded {len(results)} documents")
    return {"message": f"Classified {len(results)} documents", "results": results}


@app.get("/categories")
async def get_categories(authorization: str = Header(None)):
    """Get document categories with counts"""
    username = get_current_user(authorization)
    
    # Get counts from database
    db_categories = db.get_user_categories(username)
    
    # Ensure all categories are present
    categories = {"Resume": 0, "Report": 0, "Legal Document": 0, "Other": 0}
    categories.update(db_categories)
    
    return {"categories": categories}


@app.get("/documents")
async def get_documents(category: str, authorization: str = Header(None)):
    """Get documents by category"""
    username = get_current_user(authorization)
    
    docs = db.get_user_documents(username, category)
    
    return {"documents": docs}


@app.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, authorization: str = Header(None)):
    """Delete a document"""
    username = get_current_user(authorization)
    
    success = db.delete_document(doc_id, username)
    
    if not success:
        raise HTTPException(status_code=404, detail="Document not found or not authorized")
    
    logger.info(f"User {username} deleted document {doc_id}")
    return {"message": "Document deleted successfully", "id": doc_id}


@app.get("/download-zip")
async def download_zip(authorization: str = Header(None)):
    """Download all user documents as organized ZIP"""
    import io
    import zipfile
    from fastapi.responses import StreamingResponse
    
    username = get_current_user(authorization)
    
    # Get all documents with content
    documents = db.get_all_user_documents(username)
    
    if not documents:
        raise HTTPException(status_code=404, detail="No documents found")
    
    # Create ZIP in memory
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for doc in documents:
            # Sanitize category and filename for ZIP paths
            category = sanitize_filename(doc['category'].replace(' ', '_'))
            filename = sanitize_filename(doc['filename'])
            content = doc.get('content', '')
            
            # Create a text file with document info and content
            file_path = f"{category}/{filename}.txt"
            file_content = f"Document: {filename}\n"
            file_content += f"Category: {doc['category']}\n"
            file_content += f"Confidence: {doc['confidence']*100:.0f}%\n"
            file_content += f"Uploaded: {doc['timestamp']}\n"
            file_content += f"\n{'='*50}\n\n"
            file_content += content if content else "(No text content available)"
            
            zip_file.writestr(file_path, file_content)
    
    zip_buffer.seek(0)
    
    # Sanitize username for filename
    safe_username = sanitize_filename(username)
    
    logger.info(f"User {username} downloaded all documents as ZIP")
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename=documents_{safe_username}.zip"}
    )


# ========================================
# Routes - AI Summarization
# ========================================
@app.post("/summarize", response_model=SummarizeResponse)
@limiter.limit("20/hour")
async def summarize_document(
    request: Request,
    body: SummarizeRequest,
    authorization: str = Header(None)
):
    """Generate AI summary for a document using Gemini LLM"""
    username = get_current_user(authorization)
    
    # Find the document
    doc = db.get_document(body.document_id)
    
    if not doc or doc["username"] != username:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Get document text
    text = db.get_document_text(body.document_id) or ""
    
    if not text or len(text.strip()) < 50:
        return SummarizeResponse(
            success=False,
            error="Document has insufficient text for summarization"
        )
    
    # Get LLM service and summarize
    llm = get_llm_service()
    result = llm.summarize_document(text, doc["filename"])
    
    return SummarizeResponse(
        success=result["success"],
        summary=result.get("summary"),
        key_points=result.get("key_points", []),
        document_type=result.get("document_type"),
        error=result.get("error")
    )


@app.get("/llm-status")
async def get_llm_status():
    """Check if LLM service is configured and available"""
    llm = get_llm_service()
    return {
        "available": llm.is_available,
        "message": "LLM ready" if llm.is_available else "Add GEMINI_API_KEY to .env file"
    }


# ========================================
# Health Check
# ========================================
@app.get("/")
async def root():
    """Health check endpoint"""
    llm = get_llm_service()
    return {
        "message": "Smart Document Organizer API",
        "version": "2.2.0",
        "status": "running",
        "llm_available": llm.is_available
    }


@app.get("/health")
async def health_check():
    """Detailed health check for monitoring"""
    try:
        # Test database connection
        db.get_user("__health_check__")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    llm = get_llm_service()
    
    return {
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "llm": "available" if llm.is_available else "unavailable",
        "version": "2.2.0"
    }


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    logger.info(f"[SERVER] Starting API on {host}:{port}...")
    uvicorn.run(app, host=host, port=port)