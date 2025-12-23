"""Data Models"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional
import re

class SignupRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    
    @field_validator('password')
    @classmethod
    def password_must_contain_digit(cls, v):
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        return v

class LoginRequest(BaseModel):
    username: str
    password: str

class User(BaseModel):
    username: str
    email: str
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.now)

class Document(BaseModel):
    id: str
    filename: str
    category: str
    confidence: float
    text_preview: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)