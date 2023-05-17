import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
// import io from 'socket.io-client';
import { SocketListener } from '../classes/classes.js';
// import {deck} from './deck.js'
import {useSelector, useDispatch} from 'react-redux';
import {shuffle, revealCard1, revealCard2, revealCard3, revealCard4, revealCard5, revealCard6, hideAllCards, setDeck, addPlayer, setAllPlayers, setSelectedCard, setMarkers} from '../actions';

let listener


function Game ({messages, setMessages}){
  
  const dispatch = useDispatch();

  const cardRef = useRef([]);

  useEffect(()=>{
    if (!listener){listener = new SocketListener(setAllMessages, setDeckState, revealNextCard, addNewPlayer, updateAllPlayers, updateMarkers)}
  },[])

  const card1revealed = useSelector(state => state.card1)
  const card2revealed = useSelector(state => state.card2)
  const card3revealed = useSelector(state => state.card3)
  const card4revealed = useSelector(state => state.card4)
  const card5revealed = useSelector(state => state.card5)
  const card6revealed = useSelector(state => state.card6)
  const deck = useSelector(state => state.deck)
  const players = useSelector(state => state.players)
  const selectedCard = useSelector(state => state.selectedCard)
  const user = useSelector(state => state.user)
  const markers = useSelector(state => state.markers)

  // console.log(players);

  const cardImage = "https://deckofcardsapi.com/static/img/";

  const{tableID} = useParams();

  const messageDisplay = <div className="messages">
    {messages.slice(0).reverse().map((msg, index) => 
      <p className="message" key={index}>
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

  const addNewPlayer = (newPlayer) => {
    dispatch(addPlayer(newPlayer))
  }

  const updateAllPlayers = (players) => {
    dispatch(setAllPlayers(players))
  }

  const setDeckState = (deck) => {
    cardRef.current = []
    dispatch(hideAllCards())
    dispatch(setDeck(deck))
  }  

  const revealNextCard = () => {
    if(cardRef.current[4]===true){
      dispatch(revealCard6(true))
      cardRef.current.push(true)
      return
    }
    if(cardRef.current[3]===true){
      dispatch(revealCard5(true))
      cardRef.current.push(true)
      return
    }
    if(cardRef.current[2]===true){
      dispatch(revealCard4(true))
      cardRef.current.push(true)
      return
    }
    if(cardRef.current[1]===true){
      dispatch(revealCard3(true))
      cardRef.current.push(true)
      return
    }
    if(cardRef.current[0]===true){
      dispatch(revealCard2(true))
      cardRef.current.push(true)
      return
    }
    else {
      dispatch(revealCard1(true))
      cardRef.current.push(true)
      return
    }
  }

  const emitReveal = ()=>{
    listener.revealNext()
  }

  // const hideCards = ()=>{
  //   dispatch(hideAllCards())
  //   // dispatch(shuffle(deck))
  //   listener.shuffleDeck()
  // }

  const emitHide = ()=>{
    listener.shuffleDeck()
    dispatch(setSelectedCard(false))
  }

  const playMarker = () => {
    const revealedCards = [card1revealed, card2revealed, card3revealed, card4revealed, card5revealed, card6revealed]
    const currentCard = ((revealedCards.findIndex(x => x===false))-1)<0?5:(revealedCards.findIndex(x => x===false))-1
    console.log('the current card is index '+currentCard);
    if (selectedCard===false && card6revealed===false){
      dispatch(setSelectedCard(currentCard))
      listener.placeMarker({"username":user.username, "index":currentCard})
    }
  }

  const updateMarkers = (data) => {
    dispatch(setMarkers(data))
  }

  const markersDiv = (cardIndex) => {
    return markers[cardIndex].map((username, i) => {
      return (
        <div className={`marker${i}`} key={i}>
          {username}
        </div>
      )
    })
  }

  return (
    <>
      <div className="play-area">
        <div className="card" id="card1">
          <img className="playingCard" src={card1revealed?cardImage+deck[0]+'.png':cardImage+'back.png'} alt={card1revealed?deck[0]:"Back of card"} />
          <div className="markers">
            {markersDiv(0)}
            {/* {selectedCard===0?user.username:''} */}
          </div>
        </div>
        <div className="card" id="card2">
          <img className="playingCard" src={card2revealed?cardImage+deck[1]+'.png':cardImage+'back.png'} alt={card2revealed?deck[1]:"Back of card"} />
          <div className="markers">
            {markersDiv(1)}
            {/* {selectedCard===1?user.username:''} */}
          </div>
        </div>
        <div className="card" id="card3">
          <img className="playingCard" src={card3revealed?cardImage+deck[2]+'.png':cardImage+'back.png'} alt={card3revealed?deck[2]:"Back of card"} />
          <div className="markers">
            {markersDiv(2)}
            {/* {selectedCard===2?user.username:''} */}
          </div>
        </div>
        <div className="card" id="card4">
          <img className="playingCard" src={card4revealed?cardImage+deck[3]+'.png':cardImage+'back.png'} alt={card4revealed?deck[3]:"Back of card"} />
          <div className="markers">
            {markersDiv(3)}
            {/* {selectedCard===3?user.username:''} */}
          </div>
        </div>
        <div className="card" id="card5">
          <img className="playingCard" src={card5revealed?cardImage+deck[4]+'.png':cardImage+'back.png'} alt={card5revealed?deck[4]:"Back of card"} />
          <div className="markers">
            {markersDiv(4)}
            {/* {selectedCard===4?user.username:''} */}
          </div>
        </div>
        <div className="card" id="card6">
          <img className="playingCard" src={card6revealed?cardImage+deck[5]+'.png':cardImage+'back.png'} alt={card6revealed?deck[5]:"Back of card"} />
          <div className="markers" >
            {markersDiv(5)}
            {/* {selectedCard===5?user.username:''} */}
          </div>
        </div>
        <h3 className='superCard'>Super Card!</h3>
        <h1 className='howyouwinthegame'>Stop at the Top!</h1>
        <p className="tableID">Table: {tableID}</p>
        <div className="player" id="player1">{players[0]}</div>
        <div className="player" id="player2">{players[1]}</div>
        <div className="player" id="player3">{players[2]}</div>
        <div className="player" id="player4">{players[3]}</div>
        <div className="player" id="player5">{players[4]}</div>
        <div className="player" id="player6">{players[5]}</div>
        <button onClick={handleSendMessage}>TEST MESSAGE</button>
        <button onClick={emitReveal}>REVEAL NEXT CARD</button>
        <button onClick={emitHide}>HIDE ALL CARDS</button>
        <button onClick={playMarker}>Put marker on active card</button>
      </div>
      <div className="below-play">
        Total players: {players.length}<br/>
        Total messages: {messages.length}
        {messageDisplay}
      </div>
    </>
  );
}

export default Game