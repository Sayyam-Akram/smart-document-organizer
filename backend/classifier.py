"""Document Classifier using Local ML with Improved Accuracy"""
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
import os


class DocumentClassifier:
    """Local ML document classifier with accurate categorization"""
    
    def __init__(self):
        print("[INFO] Loading ML model...")
        self.model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        print("[OK] Model loaded!")
        
        # Get minimum confidence threshold from environment
        self.min_confidence = float(os.getenv("MIN_CONFIDENCE_THRESHOLD", "0.70"))
        
        # Simplified and more distinct category prototypes
        # Key: Make each category UNIQUE with NO overlapping keywords
        self.categories = {
            "Resume": """
                resume curriculum vitae cv candidate applicant
                work experience employment history job position
                education degree bachelor master university college
                skills qualifications certifications achievements
                professional summary career objective references
                contact information phone email linkedin github
                internship volunteering responsibilities duties
            """,
            
            "Report": """
                quarterly report annual report financial report
                executive summary key findings analysis conclusions
                recommendations methodology research data statistics
                performance metrics KPI growth revenue profit
                market analysis business report project status
                assessment evaluation benchmark comparison trends
                charts graphs tables figures appendix
            """,
            
            "Legal Document": """
                agreement contract legal binding enforceable
                terms and conditions parties hereby pursuant
                whereas witnesseth jurisdiction governing law
                signature notarized witness liability indemnity
                confidentiality non-disclosure plaintiff defendant
                court judgment settlement arbitration clause
                rights obligations provisions termination
                effective date amendment breach remedy damages
            """
        }
        
        # Keywords that indicate "Other" category (poems, stories, etc.)
        self.other_indicators = [
            'poem', 'poetry', 'verse', 'stanza', 'rhyme',
            'story', 'tale', 'fiction', 'novel', 'chapter',
            'love', 'heart', 'soul', 'dream', 'moon', 'stars',
            'song', 'lyrics', 'melody', 'chorus',
            'once upon a time', 'the end',
            'essay', 'diary', 'journal', 'letter', 'note'
        ]
        
        # Strong keywords for each category (must match for high confidence)
        self.strong_keywords = {
            "Resume": ['resume', 'cv', 'curriculum vitae', 'work experience', 
                       'education', 'skills', 'objective', 'references'],
            "Report": ['report', 'analysis', 'findings', 'methodology', 
                       'conclusions', 'recommendations', 'quarterly', 'annual'],
            "Legal Document": ['agreement', 'contract', 'parties', 'hereby', 
                              'terms', 'conditions', 'legal', 'binding', 'court']
        }
        
        # Pre-compute embeddings
        print("[INFO] Computing embeddings...")
        self.category_embeddings = {}
        for cat, text in self.categories.items():
            self.category_embeddings[cat] = self.model.encode(
                text.strip(), 
                convert_to_numpy=True,
                normalize_embeddings=True
            )
        print("[OK] Classifier ready!")
    
    def preprocess_text(self, text: str, max_length: int = 3000) -> str:
        """Clean and prepare text for classification"""
        text = re.sub(r'\s+', ' ', text).strip()
        text = re.sub(r'[^\w\s.,;:!?\-()]', '', text)
        return text[:max_length].lower()
    
    def check_other_indicators(self, text: str) -> bool:
        """Check if text contains indicators of 'Other' category"""
        text_lower = text.lower()
        matches = sum(1 for indicator in self.other_indicators if indicator in text_lower)
        return matches >= 2  # If 2+ indicators found, likely "Other"
    
    def count_strong_keywords(self, text: str, category: str) -> int:
        """Count how many strong keywords match for a category"""
        text_lower = text.lower()
        keywords = self.strong_keywords.get(category, [])
        return sum(1 for kw in keywords if kw in text_lower)
    
    def classify(self, text: str) -> tuple:
        """Classify document text with improved accuracy"""
        cleaned_text = self.preprocess_text(text)
        if not cleaned_text:
            return "Other", self.min_confidence
        
        # First check: Is this likely an "Other" document (poem, story, etc.)?
        if self.check_other_indicators(cleaned_text):
            print(f"[CLASSIFY] Other (detected creative/misc content)")
            return "Other", 0.82
        
        # Generate embedding for the document
        doc_embedding = self.model.encode(
            cleaned_text, 
            convert_to_numpy=True,
            normalize_embeddings=True
        )
        
        # Calculate similarities against all categories
        similarities = {}
        for category, cat_embedding in self.category_embeddings.items():
            similarity = cosine_similarity(
                doc_embedding.reshape(1, -1), 
                cat_embedding.reshape(1, -1)
            )[0][0]
            similarities[category] = float(similarity)
        
        # Count strong keyword matches for each category
        keyword_counts = {}
        for category in self.categories.keys():
            keyword_counts[category] = self.count_strong_keywords(cleaned_text, category)
        
        # Get best category by similarity
        best_category = max(similarities, key=similarities.get)
        best_similarity = similarities[best_category]
        
        # Get best category by keywords
        best_keyword_category = max(keyword_counts, key=keyword_counts.get)
        best_keyword_count = keyword_counts[best_keyword_category]
        
        # Decision logic
        # If strong keywords found (3+), trust keywords over similarity
        if best_keyword_count >= 3:
            final_category = best_keyword_category
            raw_confidence = best_similarity
        # If similarity winner has at least 1 keyword match, use it
        elif keyword_counts[best_category] >= 1:
            final_category = best_category
            raw_confidence = best_similarity
        # If no keywords match anywhere, likely "Other"
        elif best_keyword_count == 0 and sum(keyword_counts.values()) == 0:
            final_category = "Other"
            raw_confidence = 0.0
        else:
            final_category = best_category
            raw_confidence = best_similarity
        
        # Normalize confidence
        normalized_confidence = self._normalize_confidence(raw_confidence, keyword_counts.get(final_category, 0))
        
        # Final safety check: very low raw similarity = "Other"
        if raw_confidence < 0.15 and final_category != "Other":
            final_category = "Other"
            normalized_confidence = 0.75
        
        print(f"[CLASSIFY] {final_category} ({normalized_confidence:.1%}) [raw: {raw_confidence:.3f}, keywords: {keyword_counts}]")
        return final_category, normalized_confidence
    
    def _normalize_confidence(self, raw_score: float, keyword_count: int) -> float:
        """Normalize to user-friendly confidence range (70%-95%)"""
        min_expected = 0.10
        max_expected = 0.45
        
        # Map to 0-1 range
        normalized = (raw_score - min_expected) / (max_expected - min_expected)
        normalized = max(0.0, min(1.0, normalized))
        
        # Keyword bonus (up to 0.10 for multiple keywords)
        keyword_bonus = min(0.10, keyword_count * 0.025)
        normalized = min(1.0, normalized + keyword_bonus)
        
        # Map to 70%-95% range (more conservative upper bound)
        final_confidence = 0.70 + (normalized * 0.25)
        
        return round(final_confidence, 3)