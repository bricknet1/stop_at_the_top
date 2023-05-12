const playersReducer = (state = [], action) => {
  switch(action.type){
    case 'ADDPLAYER':
      if(state.includes(action.payload)){
        return
      }else{
        return state = [...state, action.payload]
      };
    default:
      return state;
  }
}

export default playersReducer;