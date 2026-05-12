import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
// import io from 'socket.io-client';
import { SocketListener } from '../classes/classes.js';
// import {deck} from './deck.js'
import {useSelector, useDispatch} from 'react-redux';
import {revealCard1, revealCard2, revealCard3, revealCard4, revealCard5, revealCard6, hideAllCards, setDeck, addPlayer, setAllPlayers, setSelectedCard, setMarkers, setMarkerPasses, updateBet, resetBet, setUser, setWinningCard, MIN_BET} from '../actions';

let listener


function Game ({messages, setMessages}){
  
  const dispatch = useDispatch();

  const cardRef = useRef([]);

  const [betPlaced, setBetPlaced] = useState(false);
  /** Amount committed to the server when Place Bet succeeds; drives "Current Bet:" after placement. */
  const [officialBet, setOfficialBet] = useState(0);
  const [markerPassed, setMarkerPassed] = useState(false);
  const [messageDraft, setMessageDraft] = useState('');

  useEffect(()=>{
    if (!listener){listener = new SocketListener(setAllMessages, resetGameState, revealNextCard, addNewPlayer, updateAllPlayers, updateMarkers, updateMarkerPasses, updateUser)}
    // eslint-disable-next-line
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
  const markerPasses = useSelector(state => state.markerPasses)
  const bet = useSelector(state => state.bet)
  const winningCard = useSelector(state => state.winningCard)

  // Placeholder deck uses "111" for the first slot; real cards never do. Catches
  // fresh tables and late joiners who never received shuffle/reveal state.
  const firstCardIsPlaceholder = deck[0] === '111'

  const cardImage = "https://deckofcardsapi.com/static/img/";

  const{tableID} = useParams();

  const messageDisplay = <div className="messages">
    {messages.slice(0).reverse().map((msg, index) => 
      <p className="message" key={index}>
        {msg['username']}: {msg['message']}
      </p>
    )}
  </div>

  // function handleSendMessage () {
  //   listener.sendMessage('test message')
  // }

  function handleSendRoomMessage () {
    const text = messageDraft.trim()
    if (!text) return
    listener.sendMessage(text)
    setMessageDraft('')
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
    setOfficialBet(0)
    setMarkerPassed(false)
    dispatch(setMarkerPasses([]))
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
    setMarkerPassed(false)
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

  const revealedForMarker = [
    card1revealed,
    card2revealed,
    card3revealed,
    card4revealed,
    card5revealed,
    card6revealed
  ]
  const nextUnrevealedIndex = revealedForMarker.findIndex((x) => x === false)
  const markerTargetIndex =
    nextUnrevealedIndex === -1
      ? 5
      : nextUnrevealedIndex === 0
        ? 5
        : nextUnrevealedIndex - 1

  const markerOrdinalLabels = [
    'First',
    'Second',
    'Third',
    'Fourth'
  ]

  const markerButtonLabel = () => {
    if (!betPlaced) return '← Place Your Bet First'
    if (selectedCard !== false || card6revealed) return 'Marker Placed'
    if (markerTargetIndex === 4) {
      return (
        <>
          Last Chance to
          <br />
          Place Marker!
        </>
      )
    }
    if (markerTargetIndex === 5) {
      return (
        <>
          Place marker on
          <br />
          Super Card!
        </>
      )
    }
    return (
      <>
        Place marker on
        <br />
        {markerOrdinalLabels[markerTargetIndex]} Card
      </>
    )
  }

  const canPlaceMarker =
    betPlaced && selectedCard === false && card6revealed === false

  const showPassButton =
    betPlaced &&
    selectedCard === false &&
    !card6revealed &&
    !markerPassed &&
    markerTargetIndex !== 4

  const handlePassMarker = () => {
    if (firstCardIsPlaceholder || !showPassButton) return
    setMarkerPassed(true)
    listener.markerPass({ username: user.username })
  }

  const playMarker = () => {
    if (firstCardIsPlaceholder) return
    if (!betPlaced) return
    console.log('the current card is index ' + markerTargetIndex)
    if (selectedCard === false && card6revealed === false) {
      dispatch(setSelectedCard(markerTargetIndex))
      listener.placeMarker({ username: user.username, index: markerTargetIndex })
    }
  }

  const updateMarkers = (data) => {
    dispatch(setMarkers(data))
  }

  const updateMarkerPasses = (passes) => {
    dispatch(setMarkerPasses(Array.isArray(passes) ? passes : []))
  }

  /** Seat index 0–5 matches player order; drives seat + marker color. */
  const seatIndexForUsername = (username) => {
    if (!username) return 0
    const idx = players.findIndex((p) => p && p.username === username)
    return idx === -1 ? 0 : idx
  }

  const markersDiv = (cardIndex) => {
    return markers[cardIndex].map((username, i) => {
      const seat = seatIndexForUsername(username)
      return (
        <div
          className={`marker marker-pos-${i} marker-seat-${seat}`}
          key={`${cardIndex}-${username}`}
        >
          {username[0]}
        </div>
      )
    })
  }

  const bet10 = () => {
    if (firstCardIsPlaceholder) return
    if (betPlaced === false) dispatch(updateBet(10))
  }

  const bet100 = () => {
    if (firstCardIsPlaceholder) return
    if (betPlaced === false) dispatch(updateBet(100))
  }

  const betMinus10 = () => {
    if (firstCardIsPlaceholder) return
    if (betPlaced === false) dispatch(updateBet(-10))
  }

  const betMinus100 = () => {
    if (firstCardIsPlaceholder) return
    if (betPlaced === false) dispatch(updateBet(-100))
  }

  const playBet = () => {
    if (firstCardIsPlaceholder) return
    if (betPlaced) return
    if (bet < MIN_BET) return
    const stake = bet
    const values = { chips: user.chips - stake }
    fetch(`/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(values)
    })
      .then((res) => {
        if (res.ok) {
          res.json().then((data) => {
            dispatch(setUser(data))
            setOfficialBet(stake)
            setBetPlaced(true)
            listener.placeBet({
              username: user.username,
              chips: user.chips - stake,
              bet: stake
            })
          })
        }
      })
  }

  // const wintest = () => {
  //   listener.payout(["win", "win", "win", "win", "win", "win"])
  // }

  // const losetest = () => {
  //   listener.payout(["lose", "lose", "lose", "lose", "lose", "lose"])
  // }

  const outcometest = () => {
    console.log("outcomes");
    let outcomesBool = []
    // console.log(markers[winningCard].includes(players[0]['username']));
    // players.forEach(player => {console.log(markers[winningCard].includes(player['username']))})
    players.forEach(player => {outcomesBool.push(markers[winningCard].includes(player['username']))})
    console.log(outcomesBool);
    const outcomes = outcomesBool.map(bool => bool ? (winningCard !== 5 ? "win" : "superwin") : "lose")
    console.log(outcomes);
    listener.payout(outcomes)
  }

  const updateUser = (updatedUser) => {
    if (updatedUser.username === user.username){dispatch(setUser(updatedUser))}
  }

  const isPlayer1 =
    Boolean(user?.username) &&
    Boolean(players[0]?.username) &&
    players[0].username === user.username

  const usernameOnAnyMarker = (username) => {
    if (!username) return false
    for (let i = 0; i < 6; i++) {
      if (markers[i].includes(username)) return true
    }
    return false
  }

  const bettors = players.filter((p) => p && p.bet > 0)
  const bettorsStillNeedMarker = bettors.filter(
    (p) => !usernameOnAnyMarker(p.username)
  )
  const allMarkerDecisionsIn =
    bettors.length > 0 &&
    (bettorsStillNeedMarker.length === 0 ||
      bettorsStillNeedMarker.every((p) => markerPasses.includes(p.username)))

  const showP1RevealOverlay =
    isPlayer1 &&
    allMarkerDecisionsIn &&
    !firstCardIsPlaceholder &&
    !card6revealed

  const showP1StartNextGame =
    isPlayer1 && card6revealed && !firstCardIsPlaceholder

  const showAwaitingSyncedGame =
    firstCardIsPlaceholder && players.length > 0 && Boolean(user?.username)

  const playerFrameClassName = (seatIndex) => {
    const parts = ['player-frame']
    if (
      user?.username &&
      players[seatIndex]?.username === user.username
    ) {
      parts.push('player-frame--current')
    }
    return parts.join(' ')
  }

  const playerPanelClassName = (seatIndex) => {
    const parts = ['player', `player-seat-${seatIndex}`]
    if (
      user?.username &&
      players[seatIndex]?.username === user.username
    ) {
      parts.push('player--current')
    }
    return parts.join(' ')
  }

  return (
    <>
      <div className="play-area">
        {showAwaitingSyncedGame ? (
          <div className="sync-gate-card-area" role="status">
            {isPlayer1 ? (
              <>
                <p className="sync-gate-message">
                  Start the round when everyone is ready. This loads a shuffled deck
                  for all players at the table.
                </p>
                <button type="button" className="sync-gate-button" onClick={emitShuffle}>
                  Begin game
                </button>
              </>
            ) : (
              <p className="sync-gate-message">
                There is a game underway on this table, or the host has not started the
                next round yet. Please stand by; you will sync automatically when the
                deck is shuffled for the next game.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="card" id="card1">
              <img className="playingCard" src={card1revealed?cardImage+deck[0]+'.png':cardImage+'back.png'} alt={card1revealed?deck[0]:"Back of card"} />
              <div className="markers">
                {markersDiv(0)}
              </div>
            </div>
            <div className="card" id="card2">
              <img className="playingCard" src={card2revealed?cardImage+deck[1]+'.png':cardImage+'back.png'} alt={card2revealed?deck[1]:"Back of card"} />
              <div className="markers">
                {markersDiv(1)}
              </div>
            </div>
            <div className="card" id="card3">
              <img className="playingCard" src={card3revealed?cardImage+deck[2]+'.png':cardImage+'back.png'} alt={card3revealed?deck[2]:"Back of card"} />
              <div className="markers">
                {markersDiv(2)}
              </div>
            </div>
            <div className="card" id="card4">
              <img className="playingCard" src={card4revealed?cardImage+deck[3]+'.png':cardImage+'back.png'} alt={card4revealed?deck[3]:"Back of card"} />
              <div className="markers">
                {markersDiv(3)}
              </div>
            </div>
            <div className="card" id="card5">
              <img className="playingCard" src={card5revealed?cardImage+deck[4]+'.png':cardImage+'back.png'} alt={card5revealed?deck[4]:"Back of card"} />
              <div className="markers">
                {markersDiv(4)}
              </div>
            </div>
            <div className="card" id="card6">
              <img className="playingCard" src={card6revealed?cardImage+deck[5]+'.png':cardImage+'back.png'} alt={card6revealed?deck[5]:"Back of card"} />
              <div className="markers" >
                {markersDiv(5)}
              </div>
            </div>
            <h3 className='superCard'>Super Card!</h3>
          </>
        )}
        <h1 className='howyouwinthegame'>Stop at the Top!</h1>
        {!firstCardIsPlaceholder && (
          <div className="bet-controls" aria-label="Betting controls">
            <div className="bet-controls-row">
              <button type="button" onClick={bet10} disabled={betPlaced}>+10</button>
              <button type="button" onClick={betMinus10} disabled={betPlaced || bet <= MIN_BET}>-10</button>
            </div>
            <div className="bet-controls-row">
              <button type="button" onClick={bet100} disabled={betPlaced}>+100</button>
              <button type="button" onClick={betMinus100} disabled={betPlaced || bet <= MIN_BET}>-100</button>
            </div>
            {!betPlaced && (
              <p className="bet-controls-staging" aria-live="polite">
                <span className="bet-controls-staging-label">Your stake</span>
                <span className="bet-controls-staging-value">{bet}</span>
              </p>
            )}
            <button
              type="button"
              className={`bet-controls-place${betPlaced ? ' bet-controls-place--placed' : ''}`}
              onClick={playBet}
              disabled={betPlaced || bet < MIN_BET}
            >
              {betPlaced ? 'BET PLACED' : 'Place Bet'}
            </button>
          </div>
        )}
        {!firstCardIsPlaceholder && (
          <div className="marker-controls" aria-label="Marker controls">
            {markerPassed ? (
              <button
                type="button"
                className="marker-controls-place marker-controls-place--done"
                disabled
              >
                Passed
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className={`marker-controls-place${
                    !betPlaced
                      ? ' marker-controls-place--inactive'
                      : canPlaceMarker
                        ? ''
                        : ' marker-controls-place--done'
                  }`}
                  onClick={playMarker}
                  disabled={!canPlaceMarker}
                >
                  {markerButtonLabel()}
                </button>
                {showPassButton && (
                  <button
                    type="button"
                    className="marker-controls-pass"
                    onClick={handlePassMarker}
                  >
                    Pass
                  </button>
                )}
              </>
            )}
            {showP1RevealOverlay && (
              <div className="marker-controls-p1-reveal-host">
                <p className="marker-controls-p1-reveal-host__message" aria-live="polite">
                  All players have decided
                </p>
                <button
                  type="button"
                  className="marker-controls-p1-reveal-btn"
                  onClick={emitReveal}
                >
                  Reveal Next Card
                </button>
              </div>
            )}
            {showP1StartNextGame && (
              <div className="marker-controls-p1-reveal-host" aria-label="Start next round">
                <button
                  type="button"
                  className="marker-controls-p1-reveal-btn"
                  onClick={emitShuffle}
                >
                  Start Next Game
                </button>
              </div>
            )}
          </div>
        )}
        <p className="tableID">Table: {tableID}</p>
        <p className="bet">Current Bet: {betPlaced ? officialBet : '—'}</p>
        <div className={playerFrameClassName(0)} id="player1">
          <div className={playerPanelClassName(0)}><br/><br/>{players[0]?.username}<br/>Chips: {players[0]?.chips}<br/>Bet: {players[0]?.bet}</div>
        </div>
        <div className={playerFrameClassName(1)} id="player2">
          <div className={playerPanelClassName(1)}><br/><br/>{players[1]?.username}<br/>Chips: {players[1]?.chips}<br/>Bet: {players[1]?.bet}</div>
        </div>
        <div className={playerFrameClassName(2)} id="player3">
          <div className={playerPanelClassName(2)}><br/><br/>{players[2]?.username}<br/>Chips: {players[2]?.chips}<br/>Bet: {players[2]?.bet}</div>
        </div>
        <div className={playerFrameClassName(3)} id="player4">
          <div className={playerPanelClassName(3)}><br/><br/>{players[3]?.username}<br/>Chips: {players[3]?.chips}<br/>Bet: {players[3]?.bet}</div>
        </div>
        <div className={playerFrameClassName(4)} id="player5">
          <div className={playerPanelClassName(4)}><br/><br/>{players[4]?.username}<br/>Chips: {players[4]?.chips}<br/>Bet: {players[4]?.bet}</div>
        </div>
        <div className={playerFrameClassName(5)} id="player6">
          <div className={playerPanelClassName(5)}><br/><br/>{players[5]?.username}<br/>Chips: {players[5]?.chips}<br/>Bet: {players[5]?.bet}</div>
        </div>
        {/* <button onClick={handleSendMessage}>MESSAGE</button> */}
        {/* <button type="button" onClick={emitReveal}>REVEAL CARD</button> */}
        {/* <button onClick={emitShuffle}>RESET GAME</button> */}
        {/* <button onClick={wintest}>All Win</button> */}
        {/* <button onClick={losetest}>All Lose</button> */}
        <button onClick={outcometest}>Outcome</button>
      </div>
      <div className="below-play">
        Total players: {players.length}<br/>
        Total messages: {messages.length}
        {messageDisplay}
        <div className="message-composer">
          <input
            type="text"
            className="message-composer-input"
            value={messageDraft}
            onChange={(e) => setMessageDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSendRoomMessage()
              }
            }}
            placeholder="Type a message to the room…"
            aria-label="Message to the room"
            maxLength={500}
            autoComplete="off"
          />
          <button type="button" className="message-composer-send" onClick={handleSendRoomMessage}>
            Send
          </button>
        </div>
      </div>
    </>
  );
}

export default Game