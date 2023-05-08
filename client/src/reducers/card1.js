const card1Reducer = (state = false, action) => {
  switch(action.type){
    case 'REVEALCARD1':
      return state=action.payload;
    case 'HIDEALLCARDS':
      return state=false;
    default:
      return state;
  }
}

export default card1Reducer;