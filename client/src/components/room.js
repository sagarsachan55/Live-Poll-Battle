import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import '../App.css';

const SERVER_URL = "https://live-poll-battle-server.onrender.com" || "ws://localhost:3005"; 

function Room() {
  const location = useLocation();
  const navigate = useNavigate();
  const {roomCode, username} = location.state || {};
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [vote, setVote] = useState(0);

  const socketRef = useRef(null);

  useEffect(()=>{
    socketRef.current = io(SERVER_URL);

    socketRef.current.on('connect', () => {
      // console.log('Connected to server:', socketRef.current.id);
      socketRef.current.emit("join", roomCode, username);
    });

    socketRef.current.on("room-expired", () => {
      alert("This room has expired.");
      navigate('/');
    });

    socketRef.current.on("not-exist", ()=>{
      alert("room no longer exists");
      navigate('/');
    });

    socketRef.current.on("join", (roomCode, pollData)=>{
      console.log(roomCode, pollData);
      setQuestion(pollData.question);
      setOptions(pollData.options);
      setVote(pollData.users[username]+1)
      const total = pollData.options.reduce((sum, o) => sum + o.votes, 0);
      setTotalVotes(total);
    });

    socketRef.current.on("poll-update", (pollData)=>{
      console.log(pollData);
      setOptions(pollData.options);
      const total = pollData.options.reduce((sum, o) => sum + o.votes, 0);
      setTotalVotes(total);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const changeVote = (e, index)=>{
    if(vote === 0){
      setVote(index+1);
      setTotalVotes(totalVotes+1);
      let newOptions = options;
      newOptions[index].votes++;
      setOptions(newOptions);

      socketRef.current.emit("update-vote", roomCode, username, index);
    }
  }
  console.log(options);
  console.log(vote);
  return(
    <div className="room-container">
      <h2 className="room-code">Room Code: {roomCode}</h2>
      <p className="username">Username: {username}</p>
      <div className="question">{question}</div>
      <div className="options-list">
        {options.map((value, index)=>(
          <div 
              key = {index} 
              className= {`option ${vote === index+1 ? "selected" : ""}`}
              onClick={(e) => changeVote(e, index)}
            >
            {index+1}. {value.text}
          </div>
        ))}
      </div>

      <div className="results">
        {options.map((opt, index) => {
          const percent = totalVotes === 0 ? 0 : (opt.votes / totalVotes) * 100;
          return (
            <div key={index} className="result-bar-wrapper">
              <div className="result-label">
                {index + 1}.
                <span>{opt.votes} vote{opt.votes !== 1 ? "s" : ""}</span>
              </div>
              <div className="result-bar">
                <div
                  className="result-fill"
                  style={{ width: `${percent}%` }}
                >
                  {percent.toFixed(0)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      
    </div>
  );
}

export default Room;
