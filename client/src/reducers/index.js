import { combineReducers } from "redux";
import deckReducer from "./deck";
import card1Reducer from "./card1";
import card2Reducer from "./card2";
import card3Reducer from "./card3";
import card4Reducer from "./card4";
import card5Reducer from "./card5";
import card6Reducer from "./card6";
import userReducer from "./user";
import playersReducer from "./players";
import selectedCardReducer from "./selectedCard";
import markersReducer from "./markers";
import betReducer from "./bet";

const allReducers = combineReducers({
  user: userReducer,
  deck: deckReducer,
  card1: card1Reducer,
  card2: card2Reducer,
  card3: card3Reducer,
  card4: card4Reducer,
  card5: card5Reducer,
  card6: card6Reducer,
  players: playersReducer,
  selectedCard: selectedCardReducer,
  markers: markersReducer,
  bet: betReducer
});

export default allReducers;