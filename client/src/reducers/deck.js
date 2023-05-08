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

const deckReducer = (state = brandNewDeck(), action) => {
  switch(action.type){
    case 'SHUFFLE':
      return state=action.payload;
    default:
      return state;
  }
}

export default deckReducer;