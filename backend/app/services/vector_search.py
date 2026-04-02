import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from bson import ObjectId
import logging
from app.services.embedding_service import embedding_service
from app.database.mongodb import get_db
from app.services.match_engine import match_engine

logger = logging.getLogger(__name__)

class VectorSearch:
    def __init__(self):
        self.embedding_service = embedding_service
        self.match_engine = match_engine
    
    def add_resource(self, resource_id: str, embedding: List[float], metadata: dict):
        """Add a resource to the vector index"""
        # For now, we'll store embeddings in a separate collection
        # In production, you'd use a proper vector database like FAISS
        try:
            db = get_db()
            db.embeddings.insert_one({
                'resource_id': resource_id,
                'embedding': embedding,
                'metadata': metadata,
                'created_at': datetime.utcnow()
            })
            logger.info(f"Added resource {resource_id} to vector index")
        except Exception as e:
            logger.error(f"Error adding resource to vector index: {e}")
    
    def search_similar(self, 
                       query: str, 
                       user_id: str, 
                       limit: int = 10,
                       resource_type: Optional[str] = None,
                       category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search for resources similar to query"""
        try:
            # Generate query embedding
            query_embedding = self.embedding_service.generate_embedding(query.lower())
            
            # Get all embeddings from database
            db = get_db()
            
            # Build query for resources
            resource_query = {'status': 'active'}
            if resource_type:
                resource_query['resource_type'] = {'$ne': resource_type}  # Opposite type for matches
            if category:
                resource_query['category'] = category
            
            # Get resources
            resources = list(db.resources.find(resource_query))
            
            if not resources:
                return []
            
            # Calculate similarity scores
            results = []
            for resource in resources:
                if str(resource['user_id']) == user_id:
                    continue  # Skip own resources
                
                if 'embedding' not in resource or not resource['embedding']:
                    continue
                
                # Calculate semantic similarity
                resource_embedding = np.array(resource['embedding'])
                query_embedding_array = np.array(query_embedding)
                distance = np.linalg.norm(resource_embedding - query_embedding_array)
                
                # Calculate match score
                score = self.match_engine.calculate_match_score(
                    distance,
                    '',  # Source location (not needed for search)
                    resource.get('location', ''),
                    None,
                    resource.get('coordinates')
                )
                
                results.append({
                    'resource_id': str(resource['_id']),
                    'title': resource['title'],
                    'resource_type': resource['resource_type'],
                    'company_name': resource['company_name'],
                    'location': resource.get('location', ''),
                    'score': score,
                    'distance': distance
                })
            
            # Sort by score and limit
            results.sort(key=lambda x: x['score'], reverse=True)
            return results[:limit]
            
        except Exception as e:
            logger.error(f"Error in semantic search: {e}")
            return []
    
    def find_matches_for_resource(self, 
                                  resource_id: str, 
                                  user_id: str, 
                                  limit: int = 10) -> List[Dict[str, Any]]:
        """Find matches for a specific resource"""
        try:
            db = get_db()
            
            # Get source resource
            source_resource = db.resources.find_one({'_id': ObjectId(resource_id)})
            if not source_resource or 'embedding' not in source_resource:
                return []
            
            # Determine opposite resource type to match
            opposite_type = 'resource' if source_resource['resource_type'] == 'waste' else 'waste'
            
            # Get potential matches
            match_query = {
                'status': 'active',
                'resource_type': opposite_type,
                'user_id': {'$ne': user_id}
            }
            
            # Add category matching if applicable
            if source_resource.get('category'):
                # Add similar categories logic here
                pass
            
            matches = list(db.resources.find(match_query))
            
            if not matches:
                return []
            
            # Calculate scores
            results = []
            source_embedding = np.array(source_resource['embedding'])
            
            for match in matches:
                if 'embedding' not in match:
                    continue
                
                match_embedding = np.array(match['embedding'])
                distance = np.linalg.norm(match_embedding - source_embedding)
                
                score = self.match_engine.calculate_match_score(
                    distance,
                    source_resource.get('location', ''),
                    match.get('location', ''),
                    source_resource.get('coordinates'),
                    match.get('coordinates')
                )
                
                results.append({
                    'resource_id': str(match['_id']),
                    'matched_resource_id': str(match['_id']),
                    'title': match['title'],
                    'resource_type': match['resource_type'],
                    'company_name': match['company_name'],
                    'location': match.get('location', ''),
                    'score': score,
                    'distance': distance
                })
            
            # Sort by score and limit
            results.sort(key=lambda x: x['score'], reverse=True)
            return results[:limit]
            
        except Exception as e:
            logger.error(f"Error finding matches for resource: {e}")
            return []
    
    def update_resource(self, resource_id: str, new_embedding: List[float], metadata: dict):
        """Update resource embedding"""
        try:
            db = get_db()
            db.embeddings.update_one(
                {'resource_id': resource_id},
                {'$set': {
                    'embedding': new_embedding,
                    'metadata': metadata,
                    'updated_at': datetime.utcnow()
                }},
                upsert=True
            )
            logger.info(f"Updated resource {resource_id} embedding")
        except Exception as e:
            logger.error(f"Error updating resource embedding: {e}")
    
    def remove_resource(self, resource_id: str):
        """Remove resource embedding"""
        try:
            db = get_db()
            db.embeddings.delete_one({'resource_id': resource_id})
            logger.info(f"Removed resource {resource_id} from vector index")
        except Exception as e:
            logger.error(f"Error removing resource embedding: {e}")
    
    def calculate_distance(self, coords1: Dict[str, float], coords2: Dict[str, float]) -> float:
        """Calculate distance between two coordinates"""
        return self.match_engine._haversine_distance(
            coords1['lat'], coords1['lng'],
            coords2['lat'], coords2['lng']
        )

# Singleton instance
vector_search = VectorSearch()

# Import datetime
from datetime import datetime