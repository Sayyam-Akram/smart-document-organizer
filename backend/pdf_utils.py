"""PDF Text Extraction"""
from PyPDF2 import PdfReader
from io import BytesIO
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF file"""
    try:
        pdf_file = BytesIO(pdf_bytes)
        reader = PdfReader(pdf_file)
        
        if reader.is_encrypted:
            logger.warning("PDF is encrypted")
            return ""
        
        text_content = []
        for page in reader.pages:
            try:
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    text_content.append(page_text)
            except Exception as e:
                logger.error(f"Error extracting page: {e}")
                continue
        
        full_text = "\n".join(text_content)
        logger.info(f"Extracted {len(full_text)} characters")
        return full_text
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        return ""