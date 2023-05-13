import io from 'socket.io-client';
import { setAllPlayers } from '../actions';

export class SocketListener {
  
  constructor(setAllMessages, setDeckState, revealNextCard, addNewPlayer, updateAllPlayers) {
    console.log('setting up socket');
    const socket = io('http://localhost:5555', {
      withCredentials: true
    });
    // const socket = new this.socket('localhost.......')

    socket.on('connect', () => {
      console.log('Connected to server');
    });
  
    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
    
    socket.on('message', (message) => {
      // console.log('Received message:', message);
      setAllMessages(message)
      // console.log(messages);
    });

    socket.on('shuffle', (deck) => {
      console.log("setting deck state");
      setDeckState(deck)
    });

    socket.on('reveal', revealNextCard.bind(this))

    socket.on('newplayer', (newPlayer) => {
      console.log('adding new player');
      addNewPlayer(newPlayer)
    })

    socket.on('setplayers', (players) => {
      console.log('setting all players');
      updateAllPlayers(players)
    })
  
    this.socket = socket;
  }
  
  sendMessage(message){
    this.socket.emit('message', message);
    // console.log("sent message: "+message);
  };

  shuffleDeck(){
    this.socket.emit('shuffle');
  }

  revealNext(){
    this.socket.emit('reveal')
  }

  // socket.on('message', (data) => {})

  // sentMessage(msg){
  //   socket.emit({
  //     username: 'whatev',
  //     message: msg,
  //   })
  // }


}





// --------------


// const listener = new SocketListener(function, anotherfunction, etc)



// then use usecontext to provide this from the highest level to any component that needs it


