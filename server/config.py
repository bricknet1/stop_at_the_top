#!/usr/bin/env python3

import logging
hdlr = logging.FileHandler('log.log')
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)

from dotenv import load_dotenv
load_dotenv()
import os

from flask import Flask, request, make_response, session, jsonify, abort, render_template
from flask_migrate import Migrate
from flask_restful import Api
from flask_cors import CORS
from flask_bcrypt import Bcrypt
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
# uncomment next for local
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
# uncomment next for deploy
# CORS(app, resources={r"/*": {"origins": "https://stopatthetop.onrender.com"}}, supports_credentials=True)
bcrypt = Bcrypt(app)

# uncomment next for local
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
# uncomment next for deploy
# app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI')
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