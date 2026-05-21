#!/usr/bin/env python3

import logging
hdlr = logging.FileHandler('log.log')
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)

import os
from pathlib import Path

from dotenv import load_dotenv

# Load repo-root .env regardless of where the server is started from.
dotenv_path = Path(__file__).resolve().parent.parent / ".env"
if dotenv_path.exists():
    load_dotenv(dotenv_path)

from flask import Flask, request, make_response, session, jsonify, abort, render_template
from flask_migrate import Migrate
from flask_restful import Api
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
app = Flask(
    __name__,
    static_url_path='',
    static_folder='../client/build',
    template_folder='../client/build'
)
app.debug=True
app.logger.addHandler(hdlr) 

IS_DEPLOY = os.environ.get('RENDER') is not None

if IS_DEPLOY:
    CORS(app, resources={r"/*": {"origins": "https://stopatthetop.onrender.com"}}, supports_credentials=True)
    # Prefer DATABASE_URL (Render injects it when Postgres is linked); DATABASE_URI for manual config.
    db_uri = os.environ.get('DATABASE_URL') or os.environ.get('DATABASE_URI')
    if not db_uri:
        raise RuntimeError(
            "Deploy mode requires DATABASE_URL or DATABASE_URI (PostgreSQL connection string)."
        )
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
else:
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SAMESITE']='Strict'
app.json.compact = False

# python -c 'import os; print(os.urandom(16))'
app.secret_key = os.environ.get('APP_SECRET_KEY')

migrate = Migrate(app, db)
db.init_app(app)

@app.route('/')
@app.route('/<int:id>')
def index(id=0):
    return render_template("index.html")

api = Api(app)