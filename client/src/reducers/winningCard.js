const winningCardReducer = (state = false, action) => {
  switch(action.type){
    case 'SETWINNINGCARD':
      return state=action.payload;
    case 'RESETWINNINGCARD':
      return state=false;
    default:
      return state;
  }
}

export default winningCardReducer;