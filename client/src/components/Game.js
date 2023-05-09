import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
// import io from 'socket.io-client';
import { SocketListener } from '../classes/classes.js';
// import {deck} from './deck.js'
import {useSelector, useDispatch} from 'react-redux';
import {shuffle, revealCard1, revealCard2, revealCard3, revealCard4, revealCard5, revealCard6, hideAllCards, setDeck} from '../actions';

let listener


function Game ({messages, setMessages}){
  
  const dispatch = useDispatch();

  useEffect(()=>{
    if (!listener){listener = new SocketListener(setAllMessages, setDeckState)}
  },[])

  const card1revealed = useSelector(state => state.card1)
  const card2revealed = useSelector(state => state.card2)
  const card3revealed = useSelector(state => state.card3)
  const card4revealed = useSelector(state => state.card4)
  const card5revealed = useSelector(state => state.card5)
  const card6revealed = useSelector(state => state.card6)
  const deck = useSelector(state => state.deck)


  const{tableID} = useParams();

  const messageDisplay = <div>
    {messages.map((msg, index) => 
      <p key={index}>
        {msg['username']}: {msg['message']}
      </p>
    )}
  </div>

  function handleSendMessage(){
    listener.sendMessage('test message')
  }

  const setAllMessages = (message) => {
    setMessages(previousMessages => [...previousMessages, message])
  }

  const setDeckState = (deck) => {
    dispatch(setDeck(deck))
  }

  const revealNextCard = () => {
    if(!card1revealed){
      dispatch(revealCard1(true))
      return
    }
    if(!card2revealed){
      dispatch(revealCard2(true))
      return
    }
    if(!card3revealed){
      dispatch(revealCard3(true))
      return
    }
    if(!card4revealed){
      dispatch(revealCard4(true))
      return
    }
    if(!card5revealed){
      dispatch(revealCard5(true))
      return
    }
    if(!card6revealed){
      dispatch(revealCard6(true))
      return
    }
  }

  const hideCards = ()=>{
    dispatch(hideAllCards())
    // dispatch(shuffle(deck))
    listener.shuffleDeck()
  }

  return (
    <>
      <div className="play-area">
        <div className="card" id="card1">{card1revealed?deck[0]:'card back'}</div>
        <div className="card" id="card2">{card2revealed?deck[1]:'card back'}</div>
        <div className="card" id="card3">{card3revealed?deck[2]:'card back'}</div>
        <div className="card" id="card4">{card4revealed?deck[3]:'card back'}</div>
        <div className="card" id="card5">{card5revealed?deck[4]:'card back'}</div>
        <div className="card" id="card6">{card6revealed?deck[5]:'card back'}</div>
        <h1 className='howyouwinthegame'>Stop at the Top!</h1>
        <p className="tableID">Table: {tableID}</p>
        <div className="player" id="player1"></div>
        <div className="player" id="player2"></div>
        <div className="player" id="player3"></div>
        <div className="player" id="player4"></div>
        <div className="player" id="player5"></div>
        <div className="player" id="player6"></div>
        <button onClick={handleSendMessage}>TEST MESSAGE</button>
        <button onClick={revealNextCard}>REVEAL NEXT CARD</button>
        <button onClick={hideCards}>HIDE ALL CARDS</button>
      </div>
      <div className="below-play">
        Total messages: {messages.length}
        {messageDisplay}
      </div>
    </>
  );
}

export default Game