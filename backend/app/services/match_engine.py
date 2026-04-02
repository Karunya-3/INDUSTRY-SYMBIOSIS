import numpy as np
from typing import List, Dict, Any, Tuple
from math import radians, cos, sin, asin, sqrt
import logging

logger = logging.getLogger(__name__)

class MatchEngine:
    def __init__(self, semantic_weight: float = 0.7, location_weight: float = 0.3):
        self.semantic_weight = semantic_weight
        self.location_weight = location_weight
    
    def calculate_match_score(self, 
                              semantic_distance: float, 
                              source_location: str, 
                              target_location: str,
                              source_coords: Dict[str, float] = None,
                              target_coords: Dict[str, float] = None) -> float:
        """Calculate combined match score"""
        # Convert semantic distance to similarity score (0-100)
        # FAISS uses L2 distance, smaller is better
        # Convert to similarity score: 1 / (1 + distance)
        semantic_similarity = (1 / (1 + semantic_distance)) * 100
        
        # Calculate location similarity
        location_similarity = self._calculate_location_similarity(
            source_location, target_location, source_coords, target_coords
        )
        
        # Combined score
        combined_score = (semantic_similarity * self.semantic_weight + 
                         location_similarity * self.location_weight)
        
        return round(combined_score, 2)
    
    def _calculate_location_similarity(self, 
                                       source_location: str, 
                                       target_location: str,
                                       source_coords: Dict[str, float] = None,
                                       target_coords: Dict[str, float] = None) -> float:
        """Calculate location similarity based on distance"""
        try:
            # Try to use coordinates first
            if source_coords and target_coords:
                distance = self._haversine_distance(
                    source_coords['lat'], source_coords['lng'],
                    target_coords['lat'], target_coords['lng']
                )
            else:
                # Fall back to string comparison
                if source_location.lower() == target_location.lower():
                    distance = 0
                else:
                    distance = 100  # Default distance for different locations
            
            # Convert distance to similarity score (0-100)
            # Assume 0km = 100%, 100km = 0%
            similarity = max(0, 100 - distance)
            return similarity
            
        except Exception as e:
            logger.error(f"Error calculating location similarity: {e}")
            return 50  # Default neutral score
    
    def _haversine_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculate distance between two points in km using Haversine formula"""
        R = 6371  # Earth's radius in km
        
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        
        return R * c
    
    def calculate_batch_scores(self, 
                               query_vector: List[float],
                               query_location: str,
                               query_coords: Dict[str, float] = None,
                               candidates: List[Dict[str, Any]] = None,
                               candidate_vectors: List[List[float]] = None) -> List[Tuple[Dict[str, Any], float]]:
        """Calculate scores for multiple candidates"""
        results = []
        
        if not candidates:
            return results
        
        # Calculate semantic distances
        if candidate_vectors:
            query_array = np.array([query_vector]).astype('float32')
            candidate_array = np.array(candidate_vectors).astype('float32')
            
            # Calculate distances
            distances = np.linalg.norm(candidate_array - query_array, axis=1)
            
            for i, candidate in enumerate(candidates):
                score = self.calculate_match_score(
                    distances[i],
                    query_location,
                    candidate.get('location', ''),
                    query_coords,
                    candidate.get('coordinates')
                )
                results.append((candidate, score))
        else:
            # Fallback to simple comparison
            for candidate in candidates:
                results.append((candidate, 50))  # Default score
        
        # Sort by score descending
        results.sort(key=lambda x: x[1], reverse=True)
        
        return results

# Singleton instance
match_engine = MatchEngine()