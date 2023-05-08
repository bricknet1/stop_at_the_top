function brandNewDeck(){
  const ranks = ['2','3','4','5','6','7','8','9','10','J','Q','K','A']
  const suits = ['Spades','Diamonds','Clubs','Hearts']

  let newDeck = []

  for(let suitCounter=0; suitCounter<4; suitCounter++){
    for(let rankCounter=0; rankCounter<13; rankCounter++){
      let card = ranks[rankCounter]+' of '+suits[suitCounter]
      newDeck.push(card)
    }
  }

  return newDeck;
}

export function newShuffledDeck(deck){
  let shuffledDeck = [...deck]
  for(let i=0; i<52; i++){
    const card = shuffledDeck[i];
    const randomPosition = Math.floor(Math.random()*52);
    shuffledDeck[i] = shuffledDeck[randomPosition];
    shuffledDeck[randomPosition] = card;
  }
  return shuffledDeck;
}

export const deck = brandNewDeck();
// newShuffledDeck(deck)