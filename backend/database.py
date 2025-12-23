"""SQLite Database Module for Smart Document Organizer"""
import sqlite3
import os
from contextlib import contextmanager

# Database file path
DB_PATH = os.path.join(os.path.dirname(__file__), "app.db")


def init_db():
    """Initialize database and create tables if they don't exist"""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                username TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Documents table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                filename TEXT NOT NULL,
                category TEXT NOT NULL,
                confidence REAL NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (username) REFERENCES users(username)
            )
        """)
        
        # Document texts for summarization
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS document_texts (
                document_id TEXT PRIMARY KEY,
                content TEXT NOT NULL,
                FOREIGN KEY (document_id) REFERENCES documents(id)
            )
        """)
        
        conn.commit()
        print("[OK] Database initialized")


@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Enable dict-like access
    try:
        yield conn
    finally:
        conn.close()


# User operations
def create_user(username: str, email: str, password_hash: str) -> bool:
    """Create a new user. Returns True if successful, False if user exists."""
    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                (username, email, password_hash)
            )
            conn.commit()
            return True
    except sqlite3.IntegrityError:
        return False


def get_user(username: str) -> dict | None:
    """Get user by username. Returns None if not found."""
    with get_db() as conn:
        row = conn.execute(
            "SELECT username, email, password_hash FROM users WHERE username = ?",
            (username,)
        ).fetchone()
        return dict(row) if row else None


def user_exists(username: str) -> bool:
    """Check if username exists"""
    return get_user(username) is not None


def email_exists(email: str) -> bool:
    """Check if email exists"""
    with get_db() as conn:
        row = conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone()
        return row is not None


# Document operations
def add_document(doc_id: str, username: str, filename: str, category: str, 
                 confidence: float, timestamp: str, text: str):
    """Add a new document and its text"""
    with get_db() as conn:
        conn.execute(
            "INSERT INTO documents (id, username, filename, category, confidence, timestamp) VALUES (?, ?, ?, ?, ?, ?)",
            (doc_id, username, filename, category, confidence, timestamp)
        )
        conn.execute(
            "INSERT INTO document_texts (document_id, content) VALUES (?, ?)",
            (doc_id, text)
        )
        conn.commit()


def get_user_categories(username: str) -> dict:
    """Get category counts for a user"""
    with get_db() as conn:
        rows = conn.execute(
            "SELECT category, COUNT(*) as count FROM documents WHERE username = ? GROUP BY category",
            (username,)
        ).fetchall()
        return {row["category"]: row["count"] for row in rows}


def get_user_documents(username: str, category: str) -> list:
    """Get documents for a user by category"""
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, filename, category, confidence, timestamp FROM documents WHERE username = ? AND category = ? ORDER BY timestamp DESC",
            (username, category)
        ).fetchall()
        return [dict(row) for row in rows]


def get_document_text(doc_id: str) -> str | None:
    """Get document text by ID"""
    with get_db() as conn:
        row = conn.execute(
            "SELECT content FROM document_texts WHERE document_id = ?",
            (doc_id,)
        ).fetchone()
        return row["content"] if row else None


def get_document(doc_id: str) -> dict | None:
    """Get document by ID"""
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, username, filename, category, confidence, timestamp FROM documents WHERE id = ?",
            (doc_id,)
        ).fetchone()
        return dict(row) if row else None


def delete_document(doc_id: str, username: str) -> bool:
    """Delete a document and its text. Returns True if deleted, False if not found or not owned."""
    with get_db() as conn:
        # Check if document exists and belongs to user
        row = conn.execute(
            "SELECT id FROM documents WHERE id = ? AND username = ?",
            (doc_id, username)
        ).fetchone()
        
        if not row:
            return False
        
        # Delete document text first (foreign key)
        conn.execute("DELETE FROM document_texts WHERE document_id = ?", (doc_id,))
        # Delete document
        conn.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        conn.commit()
        return True


def get_all_user_documents(username: str) -> list:
    """Get all documents for a user (for ZIP download)"""
    with get_db() as conn:
        rows = conn.execute(
            """SELECT d.id, d.filename, d.category, d.confidence, d.timestamp, dt.content 
               FROM documents d 
               LEFT JOIN document_texts dt ON d.id = dt.document_id 
               WHERE d.username = ? 
               ORDER BY d.category, d.timestamp DESC""",
            (username,)
        ).fetchall()
        return [dict(row) for row in rows]

