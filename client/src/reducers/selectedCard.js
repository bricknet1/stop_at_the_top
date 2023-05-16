const selectedCardReducer = (state = false, action) => {
  switch(action.type){
    case 'SETSELECTEDCARD':
      return state=action.payload;
    default:
      return state;
  }
}

export default selectedCardReducer;