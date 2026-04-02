from flask import Blueprint, request, jsonify
from bson import ObjectId
import logging
from app.middleware.auth import jwt_required as token_required
from app.services.vector_search import vector_search
from app.database.mongodb import get_db

logger = logging.getLogger(__name__)
search_bp = Blueprint('search', __name__)

# Helper function to convert MongoDB documents to JSON serializable
def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc is None:
        return None
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            elif isinstance(value, list):
                result[key] = [serialize_doc(item) if isinstance(item, dict) else item for item in value]
            else:
                result[key] = value
        return result
    return doc

# Helper function to get user ID from User object
def get_user_id(current_user):
    """Extract user ID from User object or dict"""
    if hasattr(current_user, 'data'):
        user_id = current_user.data.get('_id')
        return str(user_id) if user_id else None
    elif isinstance(current_user, dict):
        user_id = current_user.get('_id')
        return str(user_id) if user_id else None
    else:
        user_id = getattr(current_user, '_id', None)
        return str(user_id) if user_id else None

@search_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Search blueprint is working!'}), 200

@search_bp.route('', methods=['POST'])
@token_required
def search_matches(current_user):
    """Search for matches based on query"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        resource_type = data.get('resource_type')
        category = data.get('category')
        max_distance = data.get('max_distance', 100)
        min_score = data.get('min_score', 0)
        limit = data.get('limit', 20)
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        # Get user ID from User object
        user_id = get_user_id(current_user)
        
        if not user_id:
            return jsonify({'error': 'User ID not found'}), 400
        
        # Simple text search as fallback
        db = get_db()
        
        # Build search filter
        search_filter = {
            'user_id': {'$ne': ObjectId(user_id)},  # Not user's own resources
            'status': 'active'
        }
        
        if resource_type:
            search_filter['resource_type'] = resource_type
        if category:
            search_filter['category'] = category
        
        # Simple text search using $or for title and description
        if query:
            search_filter['$or'] = [
                {'title': {'$regex': query, '$options': 'i'}},
                {'description': {'$regex': query, '$options': 'i'}}
            ]
        
        # Get resources
        resources = list(db.resources.find(search_filter).limit(limit * 2))
        
        # Format matches with scores
        matches = []
        for resource in resources:
            # Calculate simple relevance score
            score = 0
            if query:
                if query.lower() in resource.get('title', '').lower():
                    score += 50
                if query.lower() in resource.get('description', '').lower():
                    score += 30
                if resource.get('category', '').lower() == category:
                    score += 20
            else:
                score = 50  # Default score if no query
            
            if score >= min_score:
                # Serialize the resource
                serialized_resource = serialize_doc(resource)
                matches.append({
                    'resource_id': str(resource['_id']),
                    'score': score,
                    'resource': serialized_resource
                })
        
        # Sort by score
        matches.sort(key=lambda x: x['score'], reverse=True)
        
        return jsonify({
            'matches': matches[:limit],
            'total': len(matches)
        }), 200
        
    except Exception as e:
        logger.error(f"Error searching matches: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@search_bp.route('/resource/<resource_id>', methods=['GET'])
@token_required
def find_matches_for_resource(current_user, resource_id):
    """Find matches for a specific resource"""
    try:
        user_id = get_user_id(current_user)
        
        if not user_id:
            return jsonify({'error': 'User ID not found'}), 400
        
        db = get_db()
        resource = db.resources.find_one({'_id': ObjectId(resource_id)})
        
        if not resource:
            return jsonify({'error': 'Resource not found'}), 404
        
        # Check if user owns the resource
        if str(resource['user_id']) != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Find potential matches (resources of opposite type)
        opposite_type = 'resource' if resource['resource_type'] == 'waste' else 'waste'
        
        matches = list(db.resources.find({
            'user_id': {'$ne': ObjectId(user_id)},
            'resource_type': opposite_type,
            'status': 'active',
            'category': resource['category']  # Same category
        }).limit(20))
        
        # Format matches with scores
        formatted_matches = []
        for match in matches:
            # Simple scoring based on category match
            score = 70 if match['category'] == resource['category'] else 50
            
            # Serialize the match
            serialized_match = serialize_doc(match)
            formatted_matches.append({
                'matched_resource_id': str(match['_id']),
                'score': score,
                'resource': serialized_match
            })
        
        # Sort by score
        formatted_matches.sort(key=lambda x: x['score'], reverse=True)
        
        return jsonify({
            'matches': formatted_matches,
            'total': len(formatted_matches)
        }), 200
        
    except Exception as e:
        logger.error(f"Error finding matches for resource: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@search_bp.route('/dashboard', methods=['GET'])
@token_required
def get_dashboard_matches(current_user):
    """Get matches for user's dashboard"""
    try:
        user_id = get_user_id(current_user)
        
        if not user_id:
            return jsonify({'error': 'User ID not found'}), 400
        
        db = get_db()
        
        # Get user's resources
        resources = list(db.resources.find({
            'user_id': ObjectId(user_id), 
            'status': 'active'
        }))
        
        if not resources:
            return jsonify({
                'matches': [],
                'total': 0,
                'stats': {
                    'total_matches': 0,
                    'resources_count': 0
                }
            }), 200
        
        # Find matches for each resource
        all_matches = []
        for resource in resources:
            opposite_type = 'resource' if resource['resource_type'] == 'waste' else 'waste'
            
            potential_matches = list(db.resources.find({
                'user_id': {'$ne': ObjectId(user_id)},
                'resource_type': opposite_type,
                'status': 'active',
                'category': resource['category']
            }).limit(5))
            
            for match in potential_matches:
                # Calculate simple score
                score = 70 if match['category'] == resource['category'] else 50
                
                # Serialize both resources
                serialized_match = serialize_doc(match)
                serialized_source = serialize_doc(resource)
                
                all_matches.append({
                    'matched_resource_id': str(match['_id']),
                    'score': score,
                    'resource': serialized_match,
                    'source_resource': {
                        '_id': str(resource['_id']),
                        'title': resource['title'],
                        'resource_type': resource['resource_type']
                    }
                })
        
        # Sort by score
        all_matches.sort(key=lambda x: x.get('score', 0), reverse=True)
        
        # Calculate stats
        stats = {
            'total_matches': len(all_matches),
            'resources_count': len(resources),
            'top_score': all_matches[0]['score'] if all_matches else 0
        }
        
        # Serialize the response
        response_data = {
            'matches': all_matches[:10],  # Top 10 matches
            'total': len(all_matches),
            'stats': stats
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Error getting dashboard matches: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500