const emptyUser = { username: "", chips: 0 };

const userReducer = (state = emptyUser, action) => {
  switch (action.type) {
    case "SETUSER":
      return action.payload;
    case "LOGOUTUSER":
      return emptyUser;
    default:
      return state;
  }
};

export default userReducer;
