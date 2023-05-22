import { useParams } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
// import io from 'socket.io-client';
import { SocketListener } from '../classes/classes.js';
// import {deck} from './deck.js'
import {useSelector, useDispatch} from 'react-redux';
import {shuffle, revealCard1, revealCard2, revealCard3, revealCard4, revealCard5, revealCard6, hideAllCards, setDeck, addPlayer, setAllPlayers, setSelectedCard, setMarkers, updateBet, resetBet, setUser, setWinningCard, resetWinningCard} from '../actions';

let listener


function Game ({messages, setMessages}){
  
  const dispatch = useDispatch();

  const cardRef = useRef([]);

  const [betPlaced, setBetPlaced] = useState(false);

  useEffect(()=>{
    if (!listener){listener = new SocketListener(setAllMessages, resetGameState, revealNextCard, addNewPlayer, updateAllPlayers, updateMarkers, updateUser)}
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
  const bet = useSelector(state => state.bet)
  const winningCard = useSelector(state => state.winningCard)

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
  
  const cardRanks = ['A', 'K', 'Q', 'J', '0', '9', '8', '7', '6', '5', '4', '3', '2']

  const resetGameState = (deck) => {
    cardRef.current = []
    dispatch(hideAllCards())
    dispatch(setDeck(deck))
    dispatch(setSelectedCard(false))
    dispatch(resetBet())
    setBetPlaced(false)
    determineWinningCard(deck)
  }  

  const determineWinningCard = (deck) => {
    const indexArray = [
      cardRanks.indexOf(deck[0][0]), cardRanks.indexOf(deck[1][0]), cardRanks.indexOf(deck[2][0]), cardRanks.indexOf(deck[3][0]), cardRanks.indexOf(deck[4][0]), cardRanks.indexOf(deck[5][0])
    ]
    // console.log(indexArray);
    const bestRank = Math.min(...indexArray)
    // console.log(bestRank);
    const winningIndex = indexArray.lastIndexOf(bestRank);
    // console.log(winningIndex);
    dispatch(setWinningCard(winningIndex))
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
      // dispatch(setWinningCard(0))
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

  const emitShuffle = ()=>{
    listener.shuffleDeck()
    // dispatch(setSelectedCard(false))
    // dispatch(resetBet())
    // setBetPlaced(false)
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
          {username[0]}
        </div>
      )
    })
  }

  const bet10 = () => {
    if(betPlaced===false){dispatch(updateBet(10))}
  }

  const bet100 = () => {
    if(betPlaced===false){dispatch(updateBet(100))}
  }

  const playBet = () => {
    const values = {'chips':user['chips']-bet}
    if(betPlaced===false){fetch(`/users/${user['id']}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    })
    .then(res => {
      if (res.ok) {
        res.json().then(data => {
          dispatch(setUser(data));
          setBetPlaced(true);
          listener.placeBet({"username":user.username, "chips":user['chips']-bet, "bet":bet})
        })
      }
    })}
  }

  const wintest = () => {
    listener.payout(["win", "win", "win", "win", "win", "win"])
  }

  const losetest = () => {
    listener.payout(["lose", "lose", "lose", "lose", "lose", "lose"])
  }

  const outcometest = () => {
    console.log("outcomes");
    // listener.payout([])
  }

  const updateUser = (updatedUser) => {
    if (updatedUser.username === user.username){dispatch(setUser(updatedUser))}
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
        <p className="bet">Current Bet: {bet}</p>
        <div className="player" id="player1">{players[0]?.username}<br/>Chips: {players[0]?.chips}<br/>Bet: {players[0]?.bet}</div>
        <div className="player" id="player2">{players[1]?.username}<br/>Chips: {players[1]?.chips}<br/>Bet: {players[1]?.bet}</div>
        <div className="player" id="player3">{players[2]?.username}<br/>Chips: {players[2]?.chips}<br/>Bet: {players[2]?.bet}</div>
        <div className="player" id="player4">{players[3]?.username}<br/>Chips: {players[3]?.chips}<br/>Bet: {players[3]?.bet}</div>
        <div className="player" id="player5">{players[4]?.username}<br/>Chips: {players[4]?.chips}<br/>Bet: {players[4]?.bet}</div>
        <div className="player" id="player6">{players[5]?.username}<br/>Chips: {players[5]?.chips}<br/>Bet: {players[5]?.bet}</div>
        <button onClick={handleSendMessage}>MESSAGE</button>
        <button onClick={emitReveal}>REVEAL CARD</button>
        <button onClick={emitShuffle}>RESET GAME</button>
        <button onClick={playMarker}>PLACE MARKER</button>
        <button onClick={bet10}>Add 10</button>
        <button onClick={bet100}>Add 100</button>
        <button onClick={playBet}>Place Bet</button>
        <button onClick={wintest}>Win</button>
        <button onClick={losetest}>Lose</button>
        <button onClick={outcometest}>Outcome</button>
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