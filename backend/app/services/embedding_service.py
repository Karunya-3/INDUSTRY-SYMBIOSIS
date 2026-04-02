import numpy as np
from sentence_transformers import SentenceTransformer
import logging
from typing import List, Union

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        try:
            # Using a lightweight model that works well for technical descriptions
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Embedding model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        try:
            embedding = self.model.encode(text, convert_to_numpy=True)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise
    
    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        try:
            embeddings = self.model.encode(texts, convert_to_numpy=True)
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")
            raise
    
    def prepare_search_text(self, resource: dict) -> str:
        """Prepare text for embedding by combining relevant fields"""
        text_parts = [
            resource.get('title', ''),
            resource.get('description', ''),
            resource.get('category', ''),
        ]
        
        # Add specifications if present
        if resource.get('specifications'):
            for key, value in resource['specifications'].items():
                text_parts.append(f"{key}: {value}")
        
        # Add quantity and unit if present
        if resource.get('quantity') and resource.get('unit'):
            text_parts.append(f"quantity: {resource['quantity']} {resource['unit']}")
        
        return " ".join(text_parts).lower()

# Singleton instance
embedding_service = EmbeddingService()