#!/usr/bin/env python3

# import os
import os
from dotenv import load_dotenv
from pathlib import Path

# Load repo-root .env regardless of where the server is started from.
dotenv_path = Path(__file__).resolve().parent.parent / ".env"
if dotenv_path.exists():
    load_dotenv(dotenv_path)

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
        tables[table] = {"playercount":0, "messages": [], 'table':table, "deck": [], "players":[], "markers":{0:[], 1:[], 2:[], 3:[], 4:[], 5:[]}, "marker_passes": []}
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
    passes = tables[table].get("marker_passes", [])
    if username in passes:
        tables[table]["marker_passes"] = [u for u in passes if u != username]
    emit("markerplaced", tables[table]["markers"], to=table)
    emit("markerpasses", list(tables[table].get("marker_passes", [])), to=table)


def _username_on_any_marker(table_state, username):
    markers = table_state.get("markers", {})
    return any(username in markers.get(i, []) for i in range(6))


@socketio.on("markerpass")
def markerpass(data):
    table = session.get("table")
    if table not in tables:
        return
    username = (data or {}).get("username") or session.get("username")
    if not username:
        return
    if _username_on_any_marker(tables[table], username):
        return
    passes = tables[table].setdefault("marker_passes", [])
    if username not in passes:
        passes.append(username)
    emit("markerpasses", list(passes), to=table)

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
    emit("markerpasses", tables[table].get("marker_passes", []))

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
    tables[table]["marker_passes"] = []
    emit("markerplaced", tables[table]["markers"], to=table)
    emit("markerpasses", [], to=table)
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
    if table not in tables:
        return
    tables[table]["marker_passes"] = []
    emit("markerpasses", [], to=table)
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

def _get_current_user_from_session():
    """
    Ensures the caller is an authenticated user (session cookie).
    Reuses the same session model as /authorizeddb.
    """
    user_id = session.get('user_id')
    if not user_id:
        abort(401, "Not Authorized")
    user = User.query.filter_by(id=user_id).first()
    if not user:
        abort(401, "Not Authorized")
    return user

def _require_admin_token():
    """
    Restricts sensitive endpoints to a shared admin token.
    Provide either:
      - header `X-Admin-Token: <token>`, or
      - `Authorization: Bearer <token>`
    The expected value is read from env vars: ADMIN_API_TOKEN (preferred) or ADMIN_TOKEN.
    """
    expected = os.environ.get("ADMIN_API_TOKEN") or os.environ.get("ADMIN_TOKEN")
    if not expected:
        # Misconfiguration: fail closed.
        abort(500, "Admin token not configured on server.")

    token = request.headers.get("X-Admin-Token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.lower().startswith("bearer "):
            token = auth.split(" ", 1)[1].strip()

    if not token or token != expected:
        abort(403, "Forbidden")
    return True

class Logout(Resource):
    def delete(self):
        session['user_id'] = None
        return make_response('', 204)
api.add_resource(Logout, '/logoutdb')

class UsersList(Resource):
    def get(self):
        _require_admin_token()
        users = User.query.all()
        return make_response([user.to_dict() for user in users], 200)
api.add_resource(UsersList, '/users')

class TablesList(Resource):
    def get(self):
        _require_admin_token()
        payload = []
        for code, state in tables.items():
            payload.append({
                "table": code,
                "playercount": state.get("playercount", 0),
                "players": [
                    {
                        "username": p.get("username"),
                        "chips": p.get("chips"),
                        "bet": p.get("bet"),
                    }
                    for p in state.get("players", [])
                ],
            })
        return make_response({"tables": payload}, 200)

api.add_resource(TablesList, '/tables')

class Users(Resource):
    def get(self, id):
        _require_admin_token()
        user = User.query.filter_by(id=id).first()
        if not user:
            abort(404, "User not found")
        return make_response(user.to_dict(), 200)

    def patch(self, id):
        # Admins can modify any user; players can only modify their own record.
        current_user = None
        try:
            _require_admin_token()
        except Exception:
            current_user = _get_current_user_from_session()

        if current_user is not None and current_user.id != id:
            abort(403, "Forbidden")

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
        _require_admin_token()
        user = User.query.filter_by(id=id).first()
        if not user:
            raise NotFound
        db.session.delete(user)
        db.session.commit()
        return make_response('', 204)
api.add_resource(Users, '/users/<int:id>')

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5555, debug=True)