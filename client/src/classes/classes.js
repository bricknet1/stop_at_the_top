import io from 'socket.io-client';

export class SocketListener {

  socket = io('http://localhost:5555', {
    withCredentials: true
  });
  // const socket = new this.socket('localhost.......')

  // constructor(addMessage) {
  // }


  socket.on('message', (data) => {})

  sentMessage(msg){
    socket.emit({
      username: 'whatev',
      message: msg,
    })
  }
}





--------------


const listener = new SocketListener(function, anotherfunction, etc)



// then use usecontext to provide this from the highest level to any component that needs it




const socket = io('http://localhost:5555', {
    withCredentials: true
  });

  socket.on('connect', () => {
    console.log('Connected to server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from server');
  });
  
  socket.on('message', (message) => {
    // console.log('Received message:', message);
    setMessages([...messages, message['username']+' said '+message['message']])
    // console.log(messages);
  });

  function messageDisplay(){
    const content = []
    for (let i = 0; i < messages.length; i++){
      content.push(<p>{messages[i]}</p>)
    }
    return (content)
  }

  const sendMessage = (message) => {
    socket.emit('message', message);
    // console.log("sent message: "+message);
  };