import { useParams } from "react-router-dom"

function Game (){

  const{tableID} = useParams();

  return (
    <div>
      <div className="card" id="card1"></div>
      <div className="card" id="card2"></div>
      <div className="card" id="card3"></div>
      <div className="card" id="card4"></div>
      <div className="card" id="card5"></div>
      <div className="card" id="card6"></div>
      <h1 className='howyouwinthegame'>Stop at the Top!</h1>
      <p className="tableID">Table: {tableID}</p>
      <div className="player" id="player1"></div>
      <div className="player" id="player2"></div>
      <div className="player" id="player3"></div>
      <div className="player" id="player4"></div>
      <div className="player" id="player5"></div>
      <div className="player" id="player6"></div>
    </div>
  );
}

export default Game