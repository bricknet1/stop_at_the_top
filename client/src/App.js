
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import {useSelector, useDispatch} from 'react-redux';

// import { SocketListener } from './classes/classes.js';

import {setUser} from './actions';

import Game from './components/Game.js';
import Home from './components/Home.js';
import Login from './components/Login.js';
import Signup from './components/Signup.js';

/** Public LinkedIn profile URL for the footer “App by Nick Johnson” link. */
const APP_AUTHOR_LINKEDIN_URL = 'https://www.linkedin.com/in/nick-johnson/';

function App() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(state => state.user)
  // const [user, setUser] = useState({username:"temp", chips:0, id:0});
  const [messages, setMessages] = useState([])

  // const UserContext = createContext();
  // let listener
  // useEffect(()=>{
  //   listener = new SocketListener(messages, setMessages)
  // },[])

  // eslint-disable-next-line
  const userFetch = useCallback(fetchUser, [navigate]);

  useEffect(() => {
    fetchUser()
    // eslint-disable-next-line
  },[userFetch])

  function fetchUser (){
    fetch('/authorizeddb')
    .then(res => {
      if(res.ok){
        res.json()
        .then(data => {
          if(data===user){console.log("user matches data")}else{
            dispatch(setUser(data))
          }
        })
      } else {
        dispatch(setUser({username:"temp", chips:0, id:0}))
      }
    })
  }

  function handleLogout(){
    fetch('/logoutdb', {
      method: "DELETE"
    })
    .then(res => {
      if(res.ok){
        dispatch(setUser({username:"temp", chips:0, id:0}))
        navigate('/login')
      }
    })
  }

  console.log(user);

  return (
    // <UserContext.Provider value={SocketListener}>
      <div className="app">
        <header className="app-user-bar">
          <span className="app-user-bar-meta">
            User: {user.username} ♠️♦️ Chips: {user.chips} ♣️♥️
          </span>
          {user && <button type="button" onClick={handleLogout}>Logout</button>}
        </header>
        <div className="app-main">
          <Routes>
            <Route exact path="/" element={user.id!==0?<Home user={user} navigate={navigate} setMessages={setMessages}/>:<Login />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/signup" element={<Signup />} />
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
    // </UserContext.Provider>
  );
}

export default App;
