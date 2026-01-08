"""Document Classifier using Keyword-Based Classification (Lightweight)"""
import re
import os


class DocumentClassifier:
    """Lightweight keyword-based document classifier"""
    
    def __init__(self):
        print("[INFO] Initializing lightweight classifier...")
        
        # Get minimum confidence threshold from environment
        self.min_confidence = float(os.getenv("MIN_CONFIDENCE_THRESHOLD", "0.70"))
        
        # Strong keywords for each category
        self.keywords = {
            "Resume": [
                'resume', 'cv', 'curriculum vitae', 'work experience', 
                'education', 'skills', 'objective', 'references',
                'employment history', 'job position', 'professional summary',
                'qualifications', 'certifications', 'career', 'internship'
            ],
            "Report": [
                'report', 'analysis', 'findings', 'methodology', 
                'conclusions', 'recommendations', 'quarterly', 'annual',
                'executive summary', 'data', 'statistics', 'metrics',
                'performance', 'assessment', 'benchmark', 'trends'
            ],
            "Legal Document": [
                'agreement', 'contract', 'parties', 'hereby', 
                'terms', 'conditions', 'legal', 'binding', 'court',
                'whereas', 'jurisdiction', 'liability', 'indemnity',
                'confidentiality', 'plaintiff', 'defendant', 'witness'
            ]
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
        
        print("[OK] Classifier ready!")
    
    def preprocess_text(self, text: str, max_length: int = 3000) -> str:
        """Clean and prepare text for classification"""
        text = re.sub(r'\s+', ' ', text).strip()
        text = re.sub(r'[^\w\s.,;:!?\-()\']', '', text)
        return text[:max_length].lower()
    
    def check_other_indicators(self, text: str) -> bool:
        """Check if text contains indicators of 'Other' category"""
        text_lower = text.lower()
        matches = sum(1 for indicator in self.other_indicators if indicator in text_lower)
        return matches >= 2  # If 2+ indicators found, likely "Other"
    
    def count_keywords(self, text: str, category: str) -> int:
        """Count how many keywords match for a category"""
        text_lower = text.lower()
        keywords = self.keywords.get(category, [])
        return sum(1 for kw in keywords if kw in text_lower)
    
    def classify(self, text: str) -> tuple:
        """Classify document text using keyword matching"""
        cleaned_text = self.preprocess_text(text)
        if not cleaned_text:
            return "Other", self.min_confidence
        
        # Check if this is likely an "Other" document (poem, story, etc.)
        if self.check_other_indicators(cleaned_text):
            print(f"[CLASSIFY] Other (detected creative/misc content)")
            return "Other", 0.82
        
        # Count keyword matches for each category
        keyword_counts = {}
        for category in self.keywords.keys():
            keyword_counts[category] = self.count_keywords(cleaned_text, category)
        
        # Get best category by keyword count
        best_category = max(keyword_counts, key=keyword_counts.get)
        best_count = keyword_counts[best_category]
        
        # If no keywords match, classify as "Other"
        if best_count == 0:
            print(f"[CLASSIFY] Other (no keywords matched)")
            return "Other", 0.75
        
        # Calculate confidence based on keyword matches
        # More keywords = higher confidence
        confidence = self._calculate_confidence(best_count, sum(keyword_counts.values()))
        
        print(f"[CLASSIFY] {best_category} ({confidence:.1%}) [keywords: {keyword_counts}]")
        return best_category, confidence
    
    def _calculate_confidence(self, category_count: int, total_count: int) -> float:
        """Calculate confidence based on keyword matches"""
        # Base confidence starts at 70%
        base_confidence = 0.70
        
        # Add bonus based on number of matches (max 25% bonus)
        match_bonus = min(0.25, category_count * 0.03)
        
        # Add bonus if this category has most of the matches
        if total_count > 0:
            dominance = category_count / total_count
            dominance_bonus = dominance * 0.05
        else:
            dominance_bonus = 0
        
        confidence = base_confidence + match_bonus + dominance_bonus
        return round(min(0.95, confidence), 3)