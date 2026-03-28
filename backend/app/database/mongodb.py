from pymongo import MongoClient
from flask import current_app, g
import certifi

def get_db():
    if 'db' not in g:
        client = MongoClient(current_app.config['MONGODB_URI'], tlsCAFile=certifi.where())
        g.db = client[current_app.config['MONGODB_DB']]
    return g.db

def init_db(app):
    with app.app_context():
        db = get_db()
        
        # Create indexes
        db.users.create_index('email', unique=True)
        db.users.create_index('verification_token', sparse=True)
        db.users.create_index('reset_token', sparse=True)
        
        print("Database initialized successfully")

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.client.close()