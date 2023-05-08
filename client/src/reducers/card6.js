const card6Reducer = (state = false, action) => {
  switch(action.type){
    case 'REVEALCARD6':
      return state=action.payload;
    case 'HIDEALLCARDS':
      return state=false;
    default:
      return state;
  }
}

export default card6Reducer;