"""LLM Service for Document Summarization using Google Gemini"""
import os
import json
import logging
import time
from typing import Optional, Dict, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class LLMService:
    """Service for AI-powered document summarization using Gemini"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY", "")
        self.client = None
        self.is_available = False
        # Use gemini-2.5-flash - confirmed working!
        self.model_name = "gemini-2.5-flash"
        
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                self._initialize_client()
            except Exception as e:
                logger.warning(f"Failed to initialize LLM: {e}")
                self.is_available = False
        else:
            logger.info("⚠️ GEMINI_API_KEY not configured. LLM features disabled.")
    
    def _initialize_client(self):
        """Initialize the Gemini client"""
        try:
            from google import genai
            
            # Create client with API key
            self.client = genai.Client(api_key=self.api_key)
            self.is_available = True
            logger.info(f"✅ LLM Service initialized with {self.model_name}")
            
        except ImportError as e:
            logger.error(f"google-genai not installed: {e}")
            self.is_available = False
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            self.is_available = False
    
    def _call_with_retry(self, prompt: str, max_retries: int = 3) -> Optional[str]:
        """Call the API with retry logic for rate limits"""
        for attempt in range(max_retries):
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
                return response.text
            except Exception as e:
                error_str = str(e)
                if "429" in error_str or "Too Many Requests" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    wait_time = (attempt + 1) * 3  # 3, 6, 9 seconds
                    logger.info(f"Rate limited. Waiting {wait_time}s before retry {attempt+1}/{max_retries}...")
                    time.sleep(wait_time)
                    continue
                else:
                    logger.error(f"API error: {error_str}")
                    raise e
        return None
    
    def summarize_document(self, text: str, filename: str = "") -> Dict[str, Any]:
        """
        Generate a concise summary of the document.
        Uses minimal tokens for efficiency.
        """
        if not self.is_available or not self.client:
            return {
                "success": False,
                "error": "LLM not configured. Add GEMINI_API_KEY to .env file.",
                "summary": None,
                "key_points": []
            }
        
        # Truncate text to minimize tokens (first 1500 chars)
        truncated_text = text[:1500] if len(text) > 1500 else text
        
        # Simple, efficient prompt
        prompt = f"""Summarize this document briefly. Return ONLY valid JSON with this format:
{{"summary": "2-3 sentence summary here", "key_points": ["key point 1", "key point 2", "key point 3"], "document_type": "type of document"}}

Document content:
{truncated_text}

Return ONLY the JSON, nothing else."""

        try:
            response_text = self._call_with_retry(prompt)
            
            if not response_text:
                return {
                    "success": False,
                    "error": "Failed to get response from LLM after retries. Please wait a moment and try again.",
                    "summary": None,
                    "key_points": []
                }
            
            # Parse JSON response with fallback
            parsed = self._parse_response(response_text.strip())
            
            return {
                "success": True,
                "summary": parsed.get("summary", "Summary not available"),
                "key_points": parsed.get("key_points", []),
                "document_type": parsed.get("document_type", "Unknown"),
                "error": None
            }
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"LLM summarization failed: {error_msg}")
            
            # Provide helpful error message
            if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
                return {
                    "success": False,
                    "error": "Rate limit reached. Please wait 30 seconds and try again.",
                    "summary": None,
                    "key_points": []
                }
            
            return {
                "success": False,
                "error": f"LLM Error: {error_msg[:100]}",
                "summary": None,
                "key_points": []
            }
    
    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse LLM response with multiple fallback strategies"""
        
        # Strategy 1: Direct JSON parse
        try:
            # Clean up response (remove markdown code blocks if present)
            cleaned = response_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            return json.loads(cleaned)
        except json.JSONDecodeError:
            pass
        
        # Strategy 2: Extract JSON from text
        try:
            import re
            # Find JSON object pattern
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
        except:
            pass
        
        # Strategy 3: Create structured response from plain text
        lines = response_text.strip().split('\n')
        summary = ' '.join([l.strip() for l in lines[:3] if l.strip()])
        
        return {
            "summary": summary[:500] if summary else "Summary not available",
            "key_points": [],
            "document_type": "Document"
        }


# Singleton instance
_llm_service: Optional[LLMService] = None


def get_llm_service() -> LLMService:
    """Get or create the LLM service singleton"""
    global _llm_service
    if _llm_service is None:
        _llm_service = LLMService()
    return _llm_service
