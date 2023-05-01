
import { Route, Link, Routes, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Game from './components/Game.js';
import Home from './components/Home.js';
import Login from './components/Login.js';
import Signup from './components/Signup.js';

function App() {

  const navigate = useNavigate();

  const [user, setUser] = useState({username:"temp", chips:0, id:0});

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
            setUser(data)
          }
        })
      } else {
        setUser({username:"temp", chips:0, id:0})
      }
    })
  }

  function handleLogout(){
    fetch('/logoutdb', {
      method: "DELETE"
    })
    .then(res => {
      if(res.ok){
        setUser(null)
        navigate('/login')
      }
    })
  }

  console.log(user);

  return (
    <div className="app">
      <div className="play-area">
        <Routes>
          <Route exact path="/" element={<Home user={user} navigate={navigate}/>} />
          <Route exact path="/login" element={<Login setUser={setUser} />} />
          <Route exact path="/signup" element={<Signup setUser={setUser} />} />
          <Route path="/table/:tableID" element={<Game />} />
        </Routes>
      </div>
      User: {user?.username} -- Chips: {user?.chips} -- 
      {user && <button onClick={handleLogout}>Logout</button>}
    </div>
  );
}

export default App;
