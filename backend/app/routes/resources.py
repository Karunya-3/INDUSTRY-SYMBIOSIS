from flask import Blueprint, request, jsonify
from bson import ObjectId
import logging
from datetime import datetime
from app.database.mongodb import get_db
from app.middleware.auth import jwt_required as token_required

logger = logging.getLogger(__name__)
resources_bp = Blueprint('resources', __name__)

# Helper function to convert MongoDB document to JSON serializable
def serialize_resource(resource):
    """Convert MongoDB document to JSON serializable format"""
    if resource:
        resource['_id'] = str(resource['_id'])
        if 'user_id' in resource and isinstance(resource['user_id'], ObjectId):
            resource['user_id'] = str(resource['user_id'])
    return resource

@resources_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'Resources blueprint is working!'}), 200

@resources_bp.route('/', methods=['POST'])
@resources_bp.route('', methods=['POST'])
@token_required
def create_resource(current_user):
    """Create a new resource listing"""
    try:
        data = request.get_json()
        print(f"📥 Received: {data}")
        
        # Validate required fields
        required_fields = ['resource_type', 'category', 'title', 'description']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Get user ID from User object
        if hasattr(current_user, 'data'):
            user_id = current_user.data.get('_id')
            company_name = current_user.data.get('company_name', '')
            location = current_user.data.get('location', '')
            print(f"👤 User ID from data: {user_id}")
        elif isinstance(current_user, dict):
            user_id = current_user.get('_id')
            company_name = current_user.get('company_name', '')
            location = current_user.get('location', '')
        else:
            user_id = getattr(current_user, '_id', None)
            company_name = getattr(current_user, 'company_name', '')
            location = getattr(current_user, 'location', '')
        
        # Convert user_id to ObjectId if it's a string
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        if not user_id:
            return jsonify({'error': 'User ID not found'}), 400
        
        # Process specifications - convert list of dicts to dict if needed
        specifications = data.get('specifications', {})
        if isinstance(specifications, list):
            # Convert list of {key, value} to dictionary
            specs_dict = {}
            for spec in specifications:
                if isinstance(spec, dict) and 'key' in spec and 'value' in spec:
                    specs_dict[spec['key']] = spec['value']
            specifications = specs_dict
        
        # Create resource object
        resource = {
            'user_id': user_id,
            'company_name': company_name,
            'resource_type': data['resource_type'],
            'category': data['category'],
            'title': data['title'],
            'description': data['description'],
            'specifications': specifications,
            'quantity': data.get('quantity') if data.get('quantity') else None,
            'unit': data.get('unit') if data.get('unit') else None,
            'frequency': data.get('frequency'),
            'availability': data.get('availability'),
            'location': location,
            'coordinates': data.get('coordinates'),
            'status': 'active',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        # Insert into database
        db = get_db()
        result = db.resources.insert_one(resource)
        
        # Get the created resource and convert to serializable format
        created_resource = db.resources.find_one({'_id': result.inserted_id})
        created_resource = serialize_resource(created_resource)
        
        print(f"✅ Resource created: {created_resource['_id']}")
        
        return jsonify({
            'message': 'Resource created successfully',
            'resource': created_resource
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating resource: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/', methods=['GET'])
@resources_bp.route('', methods=['GET'])
@token_required
def get_resources(current_user):
    """Get user's resources"""
    try:
        # Get user ID
        if hasattr(current_user, 'data'):
            user_id = current_user.data.get('_id')
        elif isinstance(current_user, dict):
            user_id = current_user.get('_id')
        else:
            user_id = getattr(current_user, '_id', None)
        
        # Convert to ObjectId if string
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        if not user_id:
            return jsonify({'error': 'User ID not found'}), 400
        
        db = get_db()
        resources = list(db.resources.find({'user_id': user_id}))
        
        # Convert each resource to serializable format
        for resource in resources:
            serialize_resource(resource)
        
        return jsonify({'resources': resources}), 200
        
    except Exception as e:
        logger.error(f"Error getting resources: {e}")
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/<resource_id>', methods=['GET'])
@token_required
def get_resource(current_user, resource_id):
    """Get a specific resource"""
    try:
        # Get user ID
        if hasattr(current_user, 'data'):
            user_id = current_user.data.get('_id')
        elif isinstance(current_user, dict):
            user_id = current_user.get('_id')
        else:
            user_id = getattr(current_user, '_id', None)
        
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        db = get_db()
        resource = db.resources.find_one({'_id': ObjectId(resource_id)})
        
        if not resource:
            return jsonify({'error': 'Resource not found'}), 404
        
        if str(resource['user_id']) != str(user_id):
            return jsonify({'error': 'Unauthorized'}), 403
        
        resource = serialize_resource(resource)
        
        return jsonify({'resource': resource}), 200
        
    except Exception as e:
        logger.error(f"Error getting resource: {e}")
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/<resource_id>', methods=['PUT'])
@token_required
def update_resource(current_user, resource_id):
    """Update a resource"""
    try:
        # Get user ID
        if hasattr(current_user, 'data'):
            user_id = current_user.data.get('_id')
        elif isinstance(current_user, dict):
            user_id = current_user.get('_id')
        else:
            user_id = getattr(current_user, '_id', None)
        
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        db = get_db()
        resource = db.resources.find_one({'_id': ObjectId(resource_id)})
        
        if not resource:
            return jsonify({'error': 'Resource not found'}), 404
        
        if str(resource['user_id']) != str(user_id):
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        # Process specifications if present
        specifications = data.get('specifications', None)
        if specifications and isinstance(specifications, list):
            specs_dict = {}
            for spec in specifications:
                if isinstance(spec, dict) and 'key' in spec and 'value' in spec:
                    specs_dict[spec['key']] = spec['value']
            specifications = specs_dict
        
        update_data = {
            'resource_type': data.get('resource_type', resource['resource_type']),
            'category': data.get('category', resource['category']),
            'title': data.get('title', resource['title']),
            'description': data.get('description', resource['description']),
            'quantity': data.get('quantity') if data.get('quantity') else None,
            'unit': data.get('unit') if data.get('unit') else None,
            'frequency': data.get('frequency', resource.get('frequency')),
            'availability': data.get('availability', resource.get('availability')),
            'coordinates': data.get('coordinates', resource.get('coordinates')),
            'status': data.get('status', resource.get('status')),
            'updated_at': datetime.utcnow()
        }
        
        # Only update specifications if provided
        if specifications is not None:
            update_data['specifications'] = specifications
        
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        
        db.resources.update_one(
            {'_id': ObjectId(resource_id)},
            {'$set': update_data}
        )
        
        updated_resource = db.resources.find_one({'_id': ObjectId(resource_id)})
        updated_resource = serialize_resource(updated_resource)
        
        return jsonify({
            'message': 'Resource updated successfully',
            'resource': updated_resource
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating resource: {e}")
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/<resource_id>', methods=['DELETE'])
@token_required
def delete_resource(current_user, resource_id):
    """Delete a resource"""
    try:
        # Get user ID
        if hasattr(current_user, 'data'):
            user_id = current_user.data.get('_id')
        elif isinstance(current_user, dict):
            user_id = current_user.get('_id')
        else:
            user_id = getattr(current_user, '_id', None)
        
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        db = get_db()
        resource = db.resources.find_one({'_id': ObjectId(resource_id)})
        
        if not resource:
            return jsonify({'error': 'Resource not found'}), 404
        
        if str(resource['user_id']) != str(user_id):
            return jsonify({'error': 'Unauthorized'}), 403
        
        db.resources.delete_one({'_id': ObjectId(resource_id)})
        
        return jsonify({'message': 'Resource deleted successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error deleting resource: {e}")
        return jsonify({'error': str(e)}), 500

@resources_bp.route('/<resource_id>/status', methods=['PATCH'])
@token_required
def update_resource_status(current_user, resource_id):
    """Update resource status"""
    try:
        # Get user ID
        if hasattr(current_user, 'data'):
            user_id = current_user.data.get('_id')
        elif isinstance(current_user, dict):
            user_id = current_user.get('_id')
        else:
            user_id = getattr(current_user, '_id', None)
        
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['active', 'inactive', 'matched']:
            return jsonify({'error': 'Invalid status'}), 400
        
        db = get_db()
        resource = db.resources.find_one({'_id': ObjectId(resource_id)})
        
        if not resource:
            return jsonify({'error': 'Resource not found'}), 404
        
        if str(resource['user_id']) != str(user_id):
            return jsonify({'error': 'Unauthorized'}), 403
        
        db.resources.update_one(
            {'_id': ObjectId(resource_id)},
            {'$set': {'status': new_status, 'updated_at': datetime.utcnow()}}
        )
        
        return jsonify({'message': 'Resource status updated successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error updating resource status: {e}")
        return jsonify({'error': str(e)}), 500