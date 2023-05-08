const card4Reducer = (state = false, action) => {
  switch(action.type){
    case 'REVEALCARD4':
      return state=action.payload;
    case 'HIDEALLCARDS':
      return state=false;
    default:
      return state;
  }
}

export default card4Reducer;