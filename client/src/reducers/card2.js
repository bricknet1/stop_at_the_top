const card2Reducer = (state = false, action) => {
  switch(action.type){
    case 'REVEALCARD2':
      return state=action.payload;
    case 'HIDEALLCARDS':
      return state=false;
    default:
      return state;
  }
}

export default card2Reducer;