from flask import Flask, request, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from config import Config
from app.routes import auth_bp, users_bp, resources_bp, search_bp

jwt = JWTManager()
mail = Mail()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    app.url_map.strict_slashes = False  # ← add this too

    CORS(app,
         origins=["http://localhost:5173"],
         supports_credentials=True)

    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = make_response('', 200)
            response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, PATCH, OPTIONS'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            return response

    jwt.init_app(app)
    mail.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(resources_bp, url_prefix='/api/resources')
    app.register_blueprint(search_bp, url_prefix='/api/search')

    from app.database.mongodb import init_db
    init_db(app)

    print("Registered routes:")
    for rule in app.url_map.iter_rules():
        print(f"{rule.endpoint}: {rule.methods} {rule}")

    return app