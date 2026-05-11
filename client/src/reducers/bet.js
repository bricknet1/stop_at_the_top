const betReducer = (state = 0, action) => {
  switch(action.type){
    case 'UPDATEBET': {
      const next = state + action.payload
      return next < 0 ? 0 : next
    }
    case 'RESETBET':
      return state=0;
    default:
      return state;
  }
}

export default betReducer;