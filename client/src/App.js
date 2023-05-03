
import { Route, Link, Routes, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, createContext } from 'react';

// import { SocketListener } from './classes/classes.js';

import Game from './components/Game.js';
import Home from './components/Home.js';
import Login from './components/Login.js';
import Signup from './components/Signup.js';

function App() {

  const navigate = useNavigate();

  const [user, setUser] = useState({username:"temp", chips:0, id:0});
  const [messages, setMessages] = useState([])

  // const UserContext = createContext();
  // let listener
  // useEffect(()=>{
  //   listener = new SocketListener(messages, setMessages)
  // },[])

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
        setUser({username:"temp", chips:0, id:0})
        navigate('/login')
      }
    })
  }

  console.log(user);

  return (
    // <UserContext.Provider value={SocketListener}>
      <div className="app">
        <Routes>
          <Route exact path="/" element={user.id!==0?<Home user={user} navigate={navigate} setMessages={setMessages}/>:<Login setUser={setUser} />} />
          <Route exact path="/login" element={<Login setUser={setUser} />} />
          <Route exact path="/signup" element={<Signup setUser={setUser} />} />
          <Route path="/table/:tableID" element={<Game setMessages={setMessages} messages={messages}/>} />
        </Routes>
        User: {user?.username} -- Chips: {user?.chips} -- 
        {user && <button onClick={handleLogout}>Logout</button>}
      </div>
    // </UserContext.Provider>
  );
}

export default App;
