const card5Reducer = (state = false, action) => {
  switch(action.type){
    case 'REVEALCARD5':
      return state=action.payload;
    case 'HIDEALLCARDS':
      return state=false;
    default:
      return state;
  }
}

export default card5Reducer;