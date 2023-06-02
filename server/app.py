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

import eventlet
eventlet.monkey_patch()

from models import User
from config import app, db, api

socketio = SocketIO(app, async_mode='eventlet', cors_allowed_origins="*", manage_session=False)

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
        tables[table] = {"playercount":0, "messages": [], 'table':table, "deck": [], "players":[], "markers":{0:[], 1:[], 2:[], 3:[], 4:[], 5:[]}}
    elif table not in tables:
        return make_response({'error':"Room does not exist."}, 404)

    session['table'] = table
    # emit("newplayer", username, to=table)
    # print(session)
    # print(tables)

    response = make_response(tables[table], 200)
    return response

@socketio.on("message")
def message(data):
    table = session.get("table")
    # print(session)
    # print(table)
    # print(data)
    if table not in tables:
        return
    
    content = {
        "username": session.get("username"),
        "message": data
    }
    send(content, to=table)
    tables[table]["messages"].append(content)
    print(f"{session.get('username')} said: {data}")

@socketio.on("placemarker")
def placemarker(data):
    table = session.get("table")
    username = data["username"]
    index = data["index"]
    # print("made it this far")
    tables[table]["markers"][index].append(username)
    print(tables[table]["markers"][index])
    emit("markerplaced", tables[table]["markers"], to=table)

@socketio.on("placebet")
def placebet(data):
    table = session.get("table")
    username = data["username"]
    chips = data["chips"]
    bet = data["bet"]
    currentPlayers = tables[table]["players"]
    updatedPlayers = [
        {"username": player.get("username"), "chips": player.get("chips"), "bet": player.get("bet")}
        if player.get("username") != username
        else {"username": username, "chips": chips, "bet": bet}
        for player in currentPlayers
    ]
    print(updatedPlayers)
    tables[table]["players"] = updatedPlayers
    emit("setplayers", tables[table]["players"], to=table)

@socketio.on("connect")
def connect(auth):
    table = session.get("table")
    username = session.get("username")
    user = User.query.filter_by(username=username).first()
    if not table or not username:
        return
    if table not in tables:
        leave_room(table)
        return
    
    join_room(table)
    content = {"username": username, "message": "has joined the table"}
    send(content, to=table)
    
    if not any(obj["username"] == username for obj in tables[table]["players"]):
        tables[table]["playercount"] += 1
        tables[table]["players"].append({"username":username, "chips":user.chips, "bet":0})
    print(f"{tables[table]}")
    print(f"{username} joined table {table}")
    # emit("newplayer", username, to=table)
    emit("setplayers", tables[table]["players"], to=table)

@socketio.on("disconnect")
def disconnect():
    table = session.get("table")
    username = session.get("username")
    leave_room(table)

    if table in tables:
        currentPlayers = tables[table]["players"]
        updatedPlayers = [player for player in currentPlayers if player.get("username") != username]
        tables[table]["players"] = updatedPlayers
        emit("setplayers", tables[table]["players"], to=table)
        tables[table]["playercount"] -= 1
        if tables[table]["playercount"] <= 0:
            del tables[table]

    content = {"username": username, "message": "has left the table"}

    send(content, to=table)
    print(f"{username} left table {table}")



newDeck = ["2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "0S", "JS", "QS", "KS", "AS", "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "0D", "JD", "QD", "KD", "AD", "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "0C", "JC", "QC", "KC", "AC", "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "0H", "JH", "QH", "KH", "AH"]

@socketio.on("shuffle")
def shuffle():
    table = session.get("table")
    tables[table]["markers"] = {0:[], 1:[], 2:[], 3:[], 4:[], 5:[]}
    emit("markerplaced", tables[table]["markers"], to=table)
    random.shuffle(newDeck)
    tables[table]["deck"] = newDeck
    emit("shuffle", newDeck, to=table)

@socketio.on("payout")
def payout(data):
    table = session.get("table")
    currentPlayers = tables[table]["players"]
    for i in range(len(currentPlayers)):
        if data[i] == "win":
            currentPlayers[i]["chips"] = currentPlayers[i]["chips"]+(2*(currentPlayers[i]["bet"]))
        if data[i] == "superwin":
            currentPlayers[i]["chips"] = currentPlayers[i]["chips"]+(3*(currentPlayers[i]["bet"]))
        currentPlayers[i]["bet"] = 0
        user = User.query.filter_by(username=currentPlayers[i]["username"]).first()
        setattr(user, "chips", currentPlayers[i]["chips"])
        db.session.add(user)
        db.session.commit()
        emit("setuser", user.to_dict(), to=table)
    tables[table]["players"] = currentPlayers
    emit("setplayers", tables[table]["players"], to=table)

@socketio.on("reveal")
def reveal():
    table = session.get("table")
    emit("reveal", to=table)

class Signup(Resource):
    def post(self):
        data = request.get_json()
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
    # app.run(port=5555, debug=True)
    eventlet.wsgi.server(eventlet.listen(('', 5555)), app)
    socketio.run(app, debug=True)