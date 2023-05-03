import { useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";
// import io from 'socket.io-client';
import { SocketListener } from '../classes/classes.js';

let listener
function Game ({messages, setMessages}){

  useEffect(()=>{
    if (!listener){listener = new SocketListener(setAllMessages)}
  },[])

  const{tableID} = useParams();

  const messageDisplay = <div>
    {messages.map((msg, index) => 
      <p key={index}>
        {msg['username']} said: {msg['message']}
      </p>
    )}
  </div>

  function handleSendMessage(){
    listener.sendMessage('test message')
  }

  const setAllMessages = (message) => {
    setMessages(previousMessages => [...previousMessages, message])
  }
  console.log(messages);

  return (
    <>
      <div className="play-area">
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
      <div className="below-play">
        Total messages: {messages.length}
        {messageDisplay}
      </div>
    </>
  );
}

export default Game