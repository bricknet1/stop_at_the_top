#!/usr/bin/env python3

import os
from dotenv import load_dotenv
load_dotenv()

from flask import request, make_response, session, jsonify, abort, render_template, redirect, url_for
from flask_restful import Resource
from werkzeug.exceptions import NotFound, Unauthorized
from flask_socketio import join_room, leave_room, send, SocketIO, emit
import random
from string import ascii_uppercase

from models import User
from config import app, db, api

socketio = SocketIO(app, cors_allowed_origins="*", manage_session=True)

tables = {}

def generate_unique_code(length):
    while True:
        code = ""
        for i in range(length):
            code += random.choice(ascii_uppercase)
        if code not in tables:
            break
    return code

@app.route('/table', methods=["POST"])
def table():
    # session.clear()

    data = request.get_json()

    # username = request.form.get("username")
    table = data["table"]
    join = data["join"]
    create = data["create"]

    if join != False and not table:
        return make_response({'error':"Enter a room code."}, 404)

    if create != False:
        table = generate_unique_code(4)
        tables[table] = {"players":0, "messages": [], 'table':table}
    elif table not in tables:
        return make_response({'error':"Room does not exist."}, 404)

    session['table'] = table
    print(session)
    print(tables)
    # return redirect(url_for("table"))
    # return print("we here")
    response = make_response(tables[table], 200)
    # response.headers.add('Access-Control-Allow-Origin', '*')
    # response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    # response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    # print(response.headers)
    return response

@socketio.on("message")
def message(data):
    table = session.get("table")
    print(session)
    if table not in tables:
        return
    
    content = {
        "username": session.get("username"),
        "message": data["data"]
    }
    # content.headers.add('Access-Control-Allow-Origin', '*')
    # content.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    # content.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    send(content, to=table)
    tables[table]["messages"].append(content)
    print(f"{session.get('username')} said: {data['data']}")

@socketio.on("connect")
def connect(auth):
    table = session.get("table")
    username = session.get("username")
    if not table or not username:
        return
    if table not in tables:
        leave_room(table)
        return
    
    join_room(table)
    content = {"username": username, "message": "has joined the table"}
    # content.headers.add('Access-Control-Allow-Origin', '*')
    # content.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    # content.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    send(content, to=table)
    tables[table]["members"] += 1
    print(f"{username} joined table {table}")

@socketio.on("disconnect")
def disconnect():
    table = session.get("table")
    username = session.get("username")
    leave_room(table)

    if table in tables:
        tables[table]["members"] -= 1
        if tables[table]["members"] <= 0:
            del tables[table]

    content = {"username": username, "message": "has left the table"}
    # content.headers.add('Access-Control-Allow-Origin', '*')
    # content.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    # content.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    send(content, to=table)
    print(f"{username} left table {table}")

class Signup(Resource):
    def post(self):
        data = request.get_json()
        # print(data)
        try:
            user = User(
                username=data['username'],
                email=data['email']
            )
            user.password_hash = data['password']
            db.session.add(user)
            db.session.commit()
            session['user_id'] = user.id
            session['username'] = user.username
            return make_response(user.to_dict(), 201)
        except Exception as e:
            return make_response({'error': str(e)}, 400)
api.add_resource(Signup, '/signupdb')

class Login(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        if user:
            if user.authenticate(data['password']):
                session['user_id'] = user.id
                session['username'] = user.username
                return make_response(user.to_dict(), 200)
            else:
                abort(404, 'Incorrect username or password.')
        else:
            abort(404, 'Incorrect username or password.')
api.add_resource(Login, '/logindb')

class AuthorizedSession(Resource):
    def get(self):
        try:
            user = User.query.filter_by(id=session['user_id']).first()
            return make_response(user.to_dict(), 200)
        except:
            abort(401, "Not Authorized")
api.add_resource(AuthorizedSession, '/authorizeddb')

class Logout(Resource):
    def delete(self):
        session['user_id'] = None
        return make_response('', 204)
api.add_resource(Logout, '/logoutdb')

class Users(Resource):
    def patch(self, id):
        user = User.query.filter_by(id=id).first()
        data = request.get_json()
        if not user:
            raise NotFound
        for attr in data:
            setattr(user, attr, data[attr])
        db.session.add(user)
        db.session.commit()
        response = make_response(user.to_dict(), 200)
        return response

    def delete(self, id):
        user = User.query.filter_by(id=id).first()
        if not user:
            raise NotFound
        db.session.delete(user)
        db.session.commit()
        return make_response('', 204)
api.add_resource(Users, '/users/<int:id>')

if __name__ == '__main__':
    app.run(port=5555, debug=True)
    socketio.run(app, debug=True)