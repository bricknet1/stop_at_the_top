import { useParams } from "react-router-dom";
import io from 'socket.io-client';

function Game (){

  const{tableID} = useParams();

  const socket = io('http://localhost:5555');

  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });

  socket.on('message', (message) => {
    console.log('Received message:', message);
  });

  const sendMessage = (message) => {
    socket.emit('message', message);
    console.log("sent message: "+message);
  };

  function handleSendMessage(){
    sendMessage('test message')
  }

  return (
    <div>
      <div className="card" id="card1"></div>
      <div className="card" id="card2"></div>
      <div className="card" id="card3"></div>
      <div className="card" id="card4"></div>
      <div className="card" id="card5"></div>
      <div className="card" id="card6"></div>
      <h1 className='howyouwinthegame'>Stop at the Top!</h1>
      <p className="tableID">Table: {tableID}</p>
      <div className="player" id="player1"></div>
      <div className="player" id="player2"></div>
      <div className="player" id="player3"></div>
      <div className="player" id="player4"></div>
      <div className="player" id="player5"></div>
      <div className="player" id="player6"></div>
      <button onClick={handleSendMessage}>TEST</button>
    </div>
  );
}

export default Game