const betReducer = (state = 0, action) => {
  switch(action.type){
    case 'UPDATEBET':
      return state+action.payload;
    case 'RESETBET':
      return state=0;
    default:
      return state;
  }
}

export default betReducer;