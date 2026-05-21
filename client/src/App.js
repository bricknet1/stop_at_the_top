
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {useSelector} from 'react-redux';

import Game from './components/Game.js';
import Home from './components/Home.js';

function App() {

  const navigate = useNavigate();

  const user = useSelector(state => state.user)
  const [messages, setMessages] = useState([])

  const atTable = Boolean(user.username);

  return (
      <div className="app">
        <header className="app-user-bar">
          {atTable ? (
            <span className="app-user-bar-meta">
              {user.username} ♠️♦️ Chips: {user.chips} ♣️♥️
            </span>
          ) : (
            <span className="app-user-bar-meta app-user-bar-placeholder" aria-label="Enter a username at the table lobby">
              ♠️♦️♣️♥️
            </span>
          )}
        </header>
        <div className="app-main">
          <Routes>
            <Route exact path="/" element={<Home navigate={navigate} setMessages={setMessages}/>} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />
            <Route path="/table/:tableID" element={<Game setMessages={setMessages} messages={messages}/>} />
          </Routes>
        </div>
        <footer className="app-footer">
          <div className="app-footer-credits">
            <span>Original Game Design by Josiah Jenkins</span>
            <span className="app-footer-sep" aria-hidden="true">
              ♠️♦️♣️♥️
            </span>
            <span>
              App by{' '}
              <a
                href={'https://www.linkedin.com/in/nickjohnson-losangeles/'}
                target="_blank"
                rel="noopener noreferrer"
              >
                Nick Johnson
              </a>
            </span>
          </div>
        </footer>
      </div>
  );
}

export default App;
