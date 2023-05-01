
import {BrowserRouter as Router, Route, Link, Routes} from 'react-router-dom';

import Home from './components/Home.js';
import Game from './components/Game.js';

function App() {
  return (
    <div className="app">
      <div className="play-area">
        <Router>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/table/:tableID" element={<Game />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}

export default App;
