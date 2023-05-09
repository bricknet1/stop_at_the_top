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

socketio = SocketIO(app, cors_allowed_origins="*", manage_session=False)

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

    table = data["table"]
    join = data["join"]
    create = data["create"]

    if join != False and not table:
        return make_response({'error':"Enter a room code."}, 404)

    if create != False:
        table = generate_unique_code(4)
        tables[table] = {"players":0, "messages": [], 'table':table, "deck": []}
    elif table not in tables:
        return make_response({'error':"Room does not exist."}, 404)

    session['table'] = table
    print(session)
    print(tables)

    response = make_response(tables[table], 200)
    return response

@socketio.on("message")
def message(data):
    table = session.get("table")
    print(session)
    print(table)
    print(data)
    if table not in tables:
        return
    
    content = {
        "username": session.get("username"),
        "message": data
    }
    send(content, to=table)
    tables[table]["messages"].append(content)
    print(f"{session.get('username')} said: {data}")

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

    send(content, to=table)
    tables[table]["players"] += 1
    print(f"{username} joined table {table}")

@socketio.on("disconnect")
def disconnect():
    table = session.get("table")
    username = session.get("username")
    leave_room(table)

    if table in tables:
        tables[table]["players"] -= 1
        if tables[table]["players"] <= 0:
            del tables[table]

    content = {"username": username, "message": "has left the table"}

    send(content, to=table)
    print(f"{username} left table {table}")

newDeck = ["2 of Spades", "3 of Spades", "4 of Spades", "5 of Spades", "6 of Spades", "7 of Spades", "8 of Spades", "9 of Spades", "10 of Spades", "J of Spades", "Q of Spades", "K of Spades", "A of Spades", "2 of Diamonds", "3 of Diamonds", "4 of Diamonds", "5 of Diamonds", "6 of Diamonds", "7 of Diamonds", "8 of Diamonds", "9 of Diamonds", "10 of Diamonds", "J of Diamonds", "Q of Diamonds", "K of Diamonds", "A of Diamonds", "2 of Clubs", "3 of Clubs", "4 of Clubs", "5 of Clubs", "6 of Clubs", "7 of Clubs", "8 of Clubs", "9 of Clubs", "10 of Clubs", "J of Clubs", "Q of Clubs", "K of Clubs", "A of Clubs", "2 of Hearts", "3 of Hearts", "4 of Hearts", "5 of Hearts", "6 of Hearts", "7 of Hearts", "8 of Hearts", "9 of Hearts", "10 of Hearts", "J of Hearts", "Q of Hearts", "K of Hearts", "A of Hearts"]

@socketio.on("shuffle")
def shuffle():
    table = session.get("table")
    random.shuffle(newDeck)
    tables[table]["deck"] = newDeck
    emit("shuffle", newDeck, to=table)

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