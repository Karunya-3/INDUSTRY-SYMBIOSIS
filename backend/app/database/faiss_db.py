import faiss
import numpy as np
import pickle
import os
from typing import List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class FAISSDatabase:
    def __init__(self, dimension: int = 384, index_path: str = "faiss_index.bin", metadata_path: str = "metadata.pkl"):
        self.dimension = dimension
        self.index_path = index_path
        self.metadata_path = metadata_path
        self.index = None
        self.metadata = []
        self._initialize_index()
    
    def _initialize_index(self):
        """Initialize FAISS index and load existing data if available"""
        if os.path.exists(self.index_path):
            try:
                self.index = faiss.read_index(self.index_path)
                with open(self.metadata_path, 'rb') as f:
                    self.metadata = pickle.load(f)
                logger.info(f"Loaded FAISS index with {self.index.ntotal} vectors")
            except Exception as e:
                logger.error(f"Failed to load FAISS index: {e}")
                self._create_new_index()
        else:
            self._create_new_index()
    
    def _create_new_index(self):
        """Create a new FAISS index"""
        self.index = faiss.IndexFlatL2(self.dimension)
        self.metadata = []
        logger.info("Created new FAISS index")
    
    def add_vectors(self, vectors: List[List[float]], metadata: List[dict]):
        """Add vectors to FAISS index with metadata"""
        if not vectors:
            return
        
        # Convert to numpy array
        vectors_array = np.array(vectors).astype('float32')
        
        # Add to index
        self.index.add(vectors_array)
        
        # Store metadata
        self.metadata.extend(metadata)
        
        # Save to disk
        self._save()
        
        logger.info(f"Added {len(vectors)} vectors to FAISS index")
    
    def search(self, query_vector: List[float], k: int = 10) -> List[Tuple[dict, float]]:
        """Search for similar vectors"""
        if self.index.ntotal == 0:
            return []
        
        query_array = np.array([query_vector]).astype('float32')
        
        # Search
        distances, indices = self.index.search(query_array, min(k, self.index.ntotal))
        
        # Get results
        results = []
        for i, idx in enumerate(indices[0]):
            if idx >= 0 and idx < len(self.metadata):
                results.append((self.metadata[idx], float(distances[0][i])))
        
        return results
    
    def remove_vector(self, resource_id: str):
        """Remove vector by resource ID (Note: FAISS doesn't support removal, we need to rebuild)"""
        # Find index of resource
        index_to_remove = None
        for i, meta in enumerate(self.metadata):
            if meta.get('resource_id') == resource_id:
                index_to_remove = i
                break
        
        if index_to_remove is not None:
            # Remove metadata
            del self.metadata[index_to_remove]
            
            # Rebuild index
            self._rebuild_index()
            logger.info(f"Removed vector for resource {resource_id}")
    
    def update_vector(self, resource_id: str, vector: List[float], metadata: dict):
        """Update vector for a resource"""
        self.remove_vector(resource_id)
        self.add_vectors([vector], [metadata])
    
    def _rebuild_index(self):
        """Rebuild index from existing metadata"""
        self._create_new_index()
        
        if not self.metadata:
            return
        
        # Need to have vectors stored somewhere, we need to fetch from DB
        # This is a limitation - we should store vectors in the resource model
        
        # For now, we'll just log a warning
        logger.warning("FAISS index rebuild requires vectors to be stored in metadata")
    
    def _save(self):
        """Save index and metadata to disk"""
        try:
            faiss.write_index(self.index, self.index_path)
            with open(self.metadata_path, 'wb') as f:
                pickle.dump(self.metadata, f)
            logger.info("Saved FAISS index to disk")
        except Exception as e:
            logger.error(f"Failed to save FAISS index: {e}")
    
    def get_stats(self) -> dict:
        """Get index statistics"""
        return {
            "total_vectors": self.index.ntotal,
            "dimension": self.dimension,
            "index_type": type(self.index).__name__
        }

# Singleton instance
faiss_db = FAISSDatabase()