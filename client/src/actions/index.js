export const setUser = (user) => {
  return {
    type: 'SETUSER',
    payload: user
  }
}

export const shuffle = (deck) => {
  let shuffledDeck = [...deck]
  for(let i=0; i<52; i++){
    const card = shuffledDeck[i];
    const randomPosition = Math.floor(Math.random()*52);
    shuffledDeck[i] = shuffledDeck[randomPosition];
    shuffledDeck[randomPosition] = card;
  }
  return {
    type: 'SHUFFLE',
    payload: shuffledDeck
  }
}

export const setDeck = (deck) => {
  return {
    type: 'SETDECK',
    payload: deck
  }
}

export const revealCard1 = (update)=>{
  return {
    type: 'REVEALCARD1',
    payload: update
  }
}

export const revealCard2 = (update)=>{
  return {
    type: 'REVEALCARD2',
    payload: update
  }
}

export const revealCard3 = (update)=>{
  return {
    type: 'REVEALCARD3',
    payload: update
  }
}

export const revealCard4 = (update)=>{
  return {
    type: 'REVEALCARD4',
    payload: update
  }
}

export const revealCard5 = (update)=>{
  return {
    type: 'REVEALCARD5',
    payload: update
  }
}

export const revealCard6 = (update)=>{
  return {
    type: 'REVEALCARD6',
    payload: update
  }
}

export const hideAllCards = ()=>{
  return {
    type: 'HIDEALLCARDS',
    payload: false
  }
}

export const addPlayer = (player) => {
  return {
    type: 'ADDPLAYER',
    payload: player
  }
}

export const setAllPlayers = (players) => {
  return {
    type: 'SETALLPLAYERS',
    payload: players
  }
}

export const setSelectedCard = (index) => {
  return {
    type: 'SETSELECTEDCARD',
    payload: index
  }
}