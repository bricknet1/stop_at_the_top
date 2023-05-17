const markersReducer = (state = {0:[], 1:[], 2:[], 3:[], 4:[], 5:[]}, action) => {
  switch(action.type){
    case 'SETMARKERS':
      return state=action.payload;
    default:
      return state;
  }
}

export default markersReducer;