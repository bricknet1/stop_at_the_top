const userReducer = (state = {username:"temp", chips:0, id:0}, action) => {
  switch(action.type){
    case 'SETUSER':
      return state=action.payload;
    case 'LOGOUTUSER':
      return state={username:"temp", chips:0, id:0};
    default:
      return state;
  }
}

export default userReducer;