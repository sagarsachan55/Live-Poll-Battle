const express = require("express");
const {createServer} = require('node:http');
const {join} = require('node:path');
const {Server} = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", 
    methods: ["GET", "POST"]
  },
  connectionStateRecovery: {}
});

app.use(express.static(join(__dirname, '../client')));

const rooms = {};
function generateRoomCode() {
  return Math.floor(100000 + Math.random()*900000);
};

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on("join", (roomCode, username)=>{
    // console.log(roomCode, username);
    socket.join(roomCode);
    // let newPollData = rooms[roomCode];
    if(rooms[roomCode]){
      if(!(username in rooms[roomCode].users)) rooms[roomCode].users[username] = -1;
      socket.emit("join", roomCode, rooms[roomCode]);
      // socket.to(roomCode).emit("poll-update", rooms[roomCode]);
    }
    else{
      socket.emit("not-exist");
      socket.leave(roomCode);
    }
  });

  socket.on("update-vote", (roomCode, username, vote)=>{
    rooms[roomCode].users[username] = vote;
    rooms[roomCode].options[vote].votes++;
    socket.to(roomCode).emit("poll-update", rooms[roomCode]);
  });

  socket.on("create-room", (username, question, options)=>{

    // console.log(username, question, options);
    let roomCode = generateRoomCode();
    while (rooms[roomCode]) {
      roomCode = generateRoomCode();
    }

    rooms[roomCode] = {
      question,
      options,
      users : {}
    };

    socket.join(roomCode);
    socket.emit("room-created", roomCode);
    // console.log(roomCode);
    setTimeout(() => {
      delete rooms[roomCode];
      io.to(roomCode).emit("room-expired");
    }, 60000);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(3005, () => {
  console.log("WebSocket server running on ws://localhost:3005");
});
