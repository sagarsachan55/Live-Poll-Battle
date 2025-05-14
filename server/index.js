const express = require("express");
const {createServer} = require('node:http');
const {join} = require('node:path');
const {Server} = require('socket.io');

const app = express();
const server = createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  "https://live-poll-battle-one.vercel.app"
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins, 
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

  socket.on("join", (roomCode, username)=>{
    socket.join(roomCode);
    if(rooms[roomCode]){
      if(!(username in rooms[roomCode].users)) rooms[roomCode].users[username] = -1;
      socket.emit("join", roomCode, rooms[roomCode]);
    }
    else{
      socket.emit("not-exist");
      socket.leave(roomCode);
    }
  });

  socket.on("update-vote", (roomCode, username, vote)=>{
    socket.join(roomCode);
    rooms[roomCode].users[username] = vote;
    rooms[roomCode].options[vote].votes++;
    socket.in(roomCode).emit("poll-update", rooms[roomCode]);
  });

  socket.on("create-room", (username, question, options)=>{

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
    socket.emit("room-created", username, roomCode);
    setTimeout(() => {
      delete rooms[roomCode];
      io.to(roomCode).emit("room-expired");
    }, 60000);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3005; 
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
