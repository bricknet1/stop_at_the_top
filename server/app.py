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
from flask_socketio import join_room, leave_room, send, SocketIO, emit
import random
from string import ascii_uppercase

from config import app, api

socketio = SocketIO(app, cors_allowed_origins="*", manage_session=False)

tables = {}

MIN_BET = 10
STARTING_CHIPS = 1000
MAX_USERNAME_LENGTH = 10
MAX_PLAYERS = 6


def _all_seated_players_met_min_bet(players):
    """Seated players are those with a username; game requires each to have bet >= MIN_BET."""
    seated = [
        p
        for p in (players or [])
        if p.get("username") and not p.get("awaitingNextRound")
    ]
    if not seated:
        return False
    return all((p.get("bet") or 0) >= MIN_BET for p in seated)


def _player_record_for_clients(player, *, chips=None, bet=None):
    """Stable wire shape for table state; preserves awaitingNextRound when set."""
    row = dict(player)
    if chips is not None:
        row["chips"] = chips
    if bet is not None:
        row["bet"] = bet
    out = {
        "username": row.get("username"),
        "chips": row.get("chips"),
        "bet": row.get("bet"),
    }
    if row.get("awaitingNextRound"):
        out["awaitingNextRound"] = True
    return out


def _broadcast_dealer_markers_shout(table):
    """Table chat line when it is time to place markers (or pass)."""
    if table not in tables:
        return
    content = {
        "username": "Dealer",
        "message": "Maaaaaaarkers! Maaaaaaarkers!",
    }
    send(content, to=table)
    tables[table]["messages"].append(content)


def _normalize_username(raw):
    if raw is None:
        return None
    username = str(raw).strip()
    if not username or len(username) > MAX_USERNAME_LENGTH:
        return None
    return username


def _player_payload(player):
    return {
        "username": player.get("username"),
        "chips": player.get("chips"),
    }


def _username_taken_at_table(table_state, username):
    return any(
        p.get("username") == username for p in table_state.get("players", [])
    )


def _username_in_use_at_table(table_state, username):
    if _username_taken_at_table(table_state, username):
        return True
    return username in table_state.get("pending_usernames", [])


def _reserve_table_username(table_state, username):
    pending = table_state.setdefault("pending_usernames", [])
    if username not in pending:
        pending.append(username)


def _release_table_username(table_state, username):
    pending = table_state.get("pending_usernames", [])
    if username in pending:
        pending.remove(username)


def _table_occupancy(table_state):
    """Seated players plus reservations awaiting socket connect."""
    players = table_state.get("players", [])
    seated = {p.get("username") for p in players if p.get("username")}
    pending = table_state.get("pending_usernames", [])
    pending_only = sum(1 for u in pending if u not in seated)
    return len(seated) + pending_only


def _can_accept_new_player(table_state, username):
    if _username_taken_at_table(table_state, username):
        return True
    if username in table_state.get("pending_usernames", []):
        return True
    return _table_occupancy(table_state) < MAX_PLAYERS


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
    data = request.get_json() or {}

    username = _normalize_username(data.get("username"))
    if not username:
        return make_response(
            {'error': f"Enter a username (1–{MAX_USERNAME_LENGTH} characters)."},
            400,
        )

    table = data.get("table", "")
    join = data.get("join")
    create = data.get("create")

    if join != False and not table:
        return make_response({'error':"Enter a room code."}, 404)

    if create != False:
        table = generate_unique_code(4)
        tables[table] = {
            "playercount": 0,
            "messages": [],
            "table": table,
            "deck": [],
            "players": [],
            "markers": {0: [], 1: [], 2: [], 3: [], 4: [], 5: []},
            "marker_passes": [],
            "pending_usernames": [],
        }
    elif table not in tables:
        return make_response({'error':"Room does not exist."}, 404)
    elif _username_in_use_at_table(tables[table], username):
        reconnecting = (
            session.get("username") == username and session.get("table") == table
        )
        if not reconnecting:
            return make_response(
                {'error': "That username is already at this table."}, 400
            )
    elif not _can_accept_new_player(tables[table], username):
        return make_response(
            {'error': "This table is full (6 players maximum)."},
            400,
        )

    session.pop('user_id', None)
    old_username = session.get("username")
    old_table = session.get("table")
    if old_table in tables and old_username:
        _release_table_username(tables[old_table], old_username)
    session['username'] = username
    session['table'] = table
    _reserve_table_username(tables[table], username)
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
    if table not in tables:
        return
    username = data["username"]
    chips = data["chips"]
    bet = data["bet"]
    if bet < MIN_BET:
        return
    currentPlayers = tables[table]["players"]
    all_in_before = _all_seated_players_met_min_bet(currentPlayers)
    updatedPlayers = [
        _player_record_for_clients(
            player,
            chips=chips if player.get("username") == username else None,
            bet=bet if player.get("username") == username else None,
        )
        for player in currentPlayers
    ]
    print(updatedPlayers)
    tables[table]["players"] = updatedPlayers
    emit("setplayers", tables[table]["players"], to=table)
    if (not all_in_before) and _all_seated_players_met_min_bet(updatedPlayers):
        _broadcast_dealer_markers_shout(table)

@socketio.on("connect")
def connect(auth):
    table = session.get("table")
    username = session.get("username")
    if not table or not username:
        return
    if table not in tables:
        leave_room(table)
        return

    seated = tables[table]["players"]
    is_new_player = not any(
        obj.get("username") == username for obj in seated
    )
    if is_new_player and len(seated) >= MAX_PLAYERS:
        _release_table_username(tables[table], username)
        emit(
            "joinrejected",
            {"error": "This table is full (6 players maximum)."},
            to=request.sid,
        )
        return

    join_room(table)
    content = {"username": username, "message": "has joined the table"}
    send(content, to=table)
    
    if is_new_player:
        tables[table]["playercount"] += 1
        existing = tables[table]["players"]
        # Anyone already committed MIN_BET means a hand is in progress; this seat
        # waits for the next shuffle (client sync) and must not block host actions.
        round_in_progress = any((p.get("bet") or 0) >= MIN_BET for p in existing)
        tables[table]["players"].append(
            _player_record_for_clients(
                {
                    "username": username,
                    "chips": STARTING_CHIPS,
                    "bet": 0,
                    "awaitingNextRound": bool(round_in_progress),
                }
            )
        )
        _release_table_username(tables[table], username)
        emit("setuser", _player_payload(tables[table]["players"][-1]), to=request.sid)
    else:
        for player in tables[table]["players"]:
            if player.get("username") == username:
                emit("setuser", _player_payload(player), to=request.sid)
                break
    print(f"{tables[table]}")
    print(f"{username} joined table {table}")
    emit("setplayers", tables[table]["players"], to=table)
    emit("markerpasses", tables[table].get("marker_passes", []))

@socketio.on("disconnect")
def disconnect():
    table = session.get("table")
    username = session.get("username")
    leave_room(table)

    if table in tables:
        _release_table_username(tables[table], username)
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
    for p in tables[table].get("players") or []:
        p["awaitingNextRound"] = False
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
        emit("setuser", _player_payload(currentPlayers[i]), to=table)
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

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5555, debug=True)