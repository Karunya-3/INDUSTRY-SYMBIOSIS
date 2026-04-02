from datetime import datetime, timedelta
import bcrypt
import secrets
from flask import current_app
from flask_jwt_extended import create_access_token, create_refresh_token
from app.database.mongodb import get_db
from bson.objectid import ObjectId

class User:
    def __init__(self, user_data):
        self.data = user_data if user_data else None
    
    @staticmethod
    def create(email, password, user_type, company_name, industry, location, phone=None):
        """Create a new user"""
        db = get_db()
        
        # Hash password
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
        
        user = {
            'email': email,
            'password_hash': password_hash,
            'user_type': user_type,  # 'factory' or 'business'
            'company_name': company_name,
            'industry': industry,
            'location': location,
            'phone': phone,
            'is_verified': False,
            'verification_token': secrets.token_urlsafe(32),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'is_active': True,
            'coordinates': None,  # For location-based matching (lat/lng)
            'total_matches': 0,   # For tracking match statistics
            'resources_count': 0   # For tracking resources count
        }
        
        result = db.users.insert_one(user)
        user['_id'] = result.inserted_id
        
        return User(user)
    
    @staticmethod
    def find_by_email(email):
        """Find user by email"""
        db = get_db()
        user_data = db.users.find_one({'email': email})
        return User(user_data) if user_data else None
    
    @staticmethod
    def find_by_id(user_id):
        """Find user by ID"""
        db = get_db()
        try:
            user_data = db.users.find_one({'_id': ObjectId(user_id)})
            return User(user_data) if user_data else None
        except:
            return None
    
    @staticmethod
    def find_by_verification_token(token):
        """Find user by verification token"""
        db = get_db()
        user_data = db.users.find_one({'verification_token': token})
        return User(user_data) if user_data else None
    
    @staticmethod
    def find_by_reset_token(token):
        """Find user by password reset token"""
        db = get_db()
        user_data = db.users.find_one({'reset_token': token})
        return User(user_data) if user_data else None
    
    def verify_password(self, password):
        """Verify user password"""
        if not self.data:
            return False
        return bcrypt.checkpw(password.encode('utf-8'), self.data['password_hash'])
    
    def generate_tokens(self):
        """Generate access and refresh tokens"""
        access_token = create_access_token(identity=str(self.data['_id']))
        refresh_token = create_refresh_token(identity=str(self.data['_id']))
        return access_token, refresh_token
    
    def verify_email(self):
        """Mark user as verified"""
        db = get_db()
        db.users.update_one(
            {'_id': self.data['_id']},
            {
                '$set': {
                    'is_verified': True,
                    'verified_at': datetime.utcnow(),
                    'updated_at': datetime.utcnow()
                },
                '$unset': {'verification_token': ''}
            }
        )
        self.data['is_verified'] = True
    
    def generate_reset_token(self):
        """Generate password reset token"""
        reset_token = secrets.token_urlsafe(32)
        db = get_db()
        db.users.update_one(
            {'_id': self.data['_id']},
            {
                '$set': {
                    'reset_token': reset_token,
                    'reset_token_expires': datetime.utcnow() + timedelta(hours=24),
                    'updated_at': datetime.utcnow()
                }
            }
        )
        self.data['reset_token'] = reset_token
        return reset_token
    
    def reset_password(self, new_password):
        """Reset user password"""
        salt = bcrypt.gensalt()
        password_hash = bcrypt.hashpw(new_password.encode('utf-8'), salt)
        
        db = get_db()
        db.users.update_one(
            {'_id': self.data['_id']},
            {
                '$set': {
                    'password_hash': password_hash,
                    'updated_at': datetime.utcnow()
                },
                '$unset': {'reset_token': '', 'reset_token_expires': ''}
            }
        )
    
    def update_profile(self, **kwargs):
        """Update user profile fields"""
        db = get_db()
        
        # Fields that can be updated
        updatable_fields = ['company_name', 'email', 'industry', 'location', 'phone']
        
        update_data = {}
        for field in updatable_fields:
            if field in kwargs and kwargs[field] is not None:
                update_data[field] = kwargs[field]
        
        if not update_data:
            return self
        
        # If email is being updated, check if it's already taken
        if 'email' in update_data and update_data['email'] != self.data['email']:
            existing_user = db.users.find_one({
                'email': update_data['email'],
                '_id': {'$ne': self.data['_id']}
            })
            if existing_user:
                raise ValueError("Email already registered")
        
        # Add updated timestamp
        update_data['updated_at'] = datetime.utcnow()
        
        # Update the user in database
        db.users.update_one(
            {'_id': self.data['_id']},
            {'$set': update_data}
        )
        
        # Update local data
        self.data.update(update_data)
        
        return self
    
    def update_coordinates(self, lat, lng):
        """Update user's geographic coordinates for location-based matching"""
        db = get_db()
        coordinates = {'lat': lat, 'lng': lng}
        db.users.update_one(
            {'_id': self.data['_id']},
            {'$set': {'coordinates': coordinates, 'updated_at': datetime.utcnow()}}
        )
        self.data['coordinates'] = coordinates
    
    def increment_resources_count(self):
        """Increment user's resources count"""
        db = get_db()
        db.users.update_one(
            {'_id': self.data['_id']},
            {'$inc': {'resources_count': 1}, '$set': {'updated_at': datetime.utcnow()}}
        )
        if 'resources_count' in self.data:
            self.data['resources_count'] += 1
        else:
            self.data['resources_count'] = 1
    
    def decrement_resources_count(self):
        """Decrement user's resources count"""
        db = get_db()
        db.users.update_one(
            {'_id': self.data['_id']},
            {'$inc': {'resources_count': -1}, '$set': {'updated_at': datetime.utcnow()}}
        )
        if 'resources_count' in self.data:
            self.data['resources_count'] -= 1
    
    def to_dict(self, public=False):
        """Convert user to dictionary (safe for API)"""
        if not self.data:
            return None
        
        user_dict = {
            'id': str(self.data['_id']),
            'email': self.data['email'],
            'user_type': self.data['user_type'],
            'company_name': self.data['company_name'],
            'industry': self.data['industry'],
            'location': self.data['location'],
            'phone': self.data.get('phone'),
            'is_verified': self.data['is_verified'],
            'created_at': self.data['created_at'].isoformat() if self.data.get('created_at') else None,
            'updated_at': self.data['updated_at'].isoformat() if self.data.get('updated_at') else None,
            'resources_count': self.data.get('resources_count', 0),
            'total_matches': self.data.get('total_matches', 0)
        }
        
        # Add coordinates if available
        if self.data.get('coordinates'):
            user_dict['coordinates'] = self.data['coordinates']
        
        # If public view, remove sensitive information
        if public:
            sensitive_fields = ['email', 'phone']
            for field in sensitive_fields:
                user_dict.pop(field, None)
        
        return user_dict
    
    def get_stats(self):
        """Get user statistics"""
        db = get_db()
        
        # Get resources stats
        resources = list(db.resources.find({'user_id': str(self.data['_id'])}))
        
        waste_resources = [r for r in resources if r.get('resource_type') == 'waste']
        input_resources = [r for r in resources if r.get('resource_type') == 'resource']
        active_resources = [r for r in resources if r.get('status') == 'active']
        
        # Get matches count (simplified)
        # In production, this would be a more complex query
        matches_count = 0
        for resource in resources:
            # Count matches for this resource
            matches = db.matches.count_documents({
                '$or': [
                    {'source_resource_id': str(resource['_id'])},
                    {'target_resource_id': str(resource['_id'])}
                ]
            })
            matches_count += matches
        
        return {
            'total_resources': len(resources),
            'waste_outputs': len(waste_resources),
            'resource_inputs': len(input_resources),
            'active_resources': len(active_resources),
            'total_matches': matches_count,
            'last_active': self.data.get('updated_at')
        }
    
    def delete_account(self):
        """Delete user account and all associated data"""
        db = get_db()
        
        # Delete all user's resources
        db.resources.delete_many({'user_id': str(self.data['_id'])})
        
        # Delete all user's embeddings
        db.embeddings.delete_many({'user_id': str(self.data['_id'])})
        
        # Delete user's matches
        db.matches.delete_many({
            '$or': [
                {'source_user_id': str(self.data['_id'])},
                {'target_user_id': str(self.data['_id'])}
            ]
        })
        
        # Delete user
        db.users.delete_one({'_id': self.data['_id']})
        
        return True