import React, {useState, useEffect, useRef} from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const SERVER_URL = "https://live-poll-battle-server.onrender.com"; 

function Home() {
  const [username, setUsername] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState([{text: '', votes: 0}, {text: '', votes: 0}])

  const navigate = useNavigate();

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SERVER_URL);

    socketRef.current.on('connect', () => {
      console.log('Connected to server:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from server');
    });
    
    if (!socketRef.current) return;
  
    socketRef.current.on("room-created", (userName,code)=>{
      navigate('/room', {
        state:{
          roomCode: code, userName
        },
      });
    });

    return () => {
      // Clean up listeners when component unmounts
      socketRef.current.off("join-success");
      socketRef.current.off("not-exist");
      socketRef.current.off("room-expired");
      socketRef.current.disconnect();
    };
  }, []);
  
  const optionChange =(index, e)=>{
    let newOptions = [...options];
    newOptions[index].text= e.target.value;
    newOptions = newOptions.filter((val, i) => val.text !== '' || i === index)
    if( newOptions[newOptions.length-1].text !== '' || newOptions.length === 1) newOptions.push({text:'', votes: 0});

    setOptions(newOptions);
  }
  
  function JoinRoom(){
    if(!username || !roomCode){
      alert("Please enter both username and room code");
      return;
    }
    
    navigate('/room',{
      state:{
        roomCode,
        username
      },
    });
  }
 
  function createRoom (){
    let newOptions = options.filter((val)=> val.text.trim() !== '');
    if (!username || !question || newOptions.length < 2) {
      alert("Please enter username, question, and at least 2 valid options.");
      return;
    }

    socketRef.current.emit("create-room", username, question, newOptions);
  }
  
  return (
    <div className="home-container">
      <a>Enter your username </a>
      <input placeholder='username' onChange={(e)=> setUsername(e.target.value)}/>
      <h3>Join a poll </h3>
      <input placeholder='Enter room code' type='number' onChange={(e)=> setRoomCode(e.target.value)}/>
      <button onClick= {JoinRoom}>Enter</button>
      <div>
        <h3>Create a new Poll</h3>
        <div>Question</div>
        <input placeholder='Ask question' value = {question} onChange={(e)=> setQuestion(e.target.value)}/>
        <div className='options'>
          <div>Answer Options</div>
          {options.map((value, index) =>(
            <div key = {index}>{index+1}
              <input placeholder='+Add' value = {value.text} onChange={(e) => optionChange(index, e)}/>
            </div>
          ))}
        </div>
        <button onClick={createRoom}>create</button>
      </div>
    </div>
  )
}

export default Home;
