import { MIN_BET } from '../actions'

const betReducer = (state = MIN_BET, action) => {
  switch(action.type){
    case 'UPDATEBET': {
      const next = state + action.payload
      return next < MIN_BET ? MIN_BET : next
    }
    case 'RESETBET':
      return MIN_BET
    default:
      return state;
  }
}

export default betReducer;