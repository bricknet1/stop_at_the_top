import { combineReducers } from "redux";
import deckReducer from "./deck";
import card1Reducer from "./card1.js"
import card2Reducer from "./card2.js"
import card3Reducer from "./card3.js"
import card4Reducer from "./card4.js"
import card5Reducer from "./card5.js"
import card6Reducer from "./card6.js"

const allReducers = combineReducers({
  deck: deckReducer,
  card1: card1Reducer,
  card2: card2Reducer,
  card3: card3Reducer,
  card4: card4Reducer,
  card5: card5Reducer,
  card6: card6Reducer
});

export default allReducers;