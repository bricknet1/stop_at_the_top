import io from "socket.io-client";
// import { setMarkers } from '../actions';

export class SocketListener {
  constructor(
    setAllMessages,
    resetGameState,
    revealNextCard,
    addNewPlayer,
    updateAllPlayers,
    updateMarkers,
    updateMarkerPasses,
    updateUser
  ) {
    console.log("setting up socket");
    // Dev: use the page origin (e.g. http://localhost:3000) so Engine.IO hits the
    // CRA proxy and sends the same Flask session cookie as /table.
    // A bare ws://localhost:5555 connection often has no session, so connect()
    // on the server returns early and you never appear in players[].
    const SOCKET_URL =
      process.env.NODE_ENV === "production"
        ? "wss://stopatthetop.onrender.com"
        : process.env.REACT_APP_SOCKET_URL ||
          (typeof window !== "undefined" && window.location?.origin) ||
          "http://localhost:5555";
    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    socket.on("message", (message) => {
      // console.log('Received message:', message);
      setAllMessages(message);
      // console.log(messages);
    });

    socket.on("shuffle", (deck) => {
      console.log("setting deck state");
      resetGameState(deck);
    });

    socket.on("reveal", revealNextCard.bind(this));

    socket.on("newplayer", (newPlayer) => {
      console.log("adding new player");
      addNewPlayer(newPlayer);
    });

    socket.on("setplayers", (players) => {
      console.log("setting all players");
      updateAllPlayers(players);
    });

    socket.on("setuser", (user) => {
      updateUser(user);
    });

    socket.on("markerplaced", (data) => {
      updateMarkers(data);
    });

    socket.on("markerpasses", (passes) => {
      updateMarkerPasses(Array.isArray(passes) ? passes : []);
    });

    this.socket = socket;
  }

  sendMessage(message) {
    this.socket.emit("message", message);
    // console.log("sent message: "+message);
  }

  shuffleDeck() {
    this.socket.emit("shuffle");
  }

  revealNext() {
    this.socket.emit("reveal");
  }

  placeMarker(data) {
    this.socket.emit("placemarker", data);
  }

  markerPass(data) {
    this.socket.emit("markerpass", data);
  }

  placeBet(data) {
    this.socket.emit("placebet", data);
  }

  payout(data) {
    this.socket.emit("payout", data);
  }

  // socket.on('message', (data) => {})

  // sentMessage(msg){
  //   socket.emit({
  //     username: 'whatev',
  //     message: msg,
  //   })
  // }
}

// --------------

// const listener = new SocketListener(function, anotherfunction, etc)

// then use usecontext to provide this from the highest level to any component that needs it
