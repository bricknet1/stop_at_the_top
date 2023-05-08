const card3Reducer = (state = false, action) => {
  switch(action.type){
    case 'REVEALCARD3':
      return state=action.payload;
    case 'HIDEALLCARDS':
      return state=false;
    default:
      return state;
  }
}

export default card3Reducer;