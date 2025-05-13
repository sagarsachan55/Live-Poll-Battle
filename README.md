
# Live Poll Room - Real-Time Voting Application

A real-time poll application where users can create or join rooms, ask questions, vote on options, and see live updates using **React** and **Socket.IO**.

---

## Features

- **Join or Create Poll Rooms** with a unique 8-digit room code
- **Create a Poll** with a question and multiple dynamic options
- **Real-Time Voting** using WebSockets (Socket.IO)
- **User Management**: Track participants in each room
- **Auto Room Expiry**: Poll room expires after 60 seconds
- **Socket.IO Integration** between client and server

---

## Setup Instructions

### Backend (Node.js + Express + Socket.IO)

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   node index.js
   ```

4. Server will run at:  
   ```
   http://localhost:3005
   ```

---

### Frontend (React)

1. Navigate to the client folder:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. App runs at:
   ```
   http://localhost:3000
   ```

---

## Room Management & Vote State Sharing

- When a user **creates a poll**, a unique `roomCode` is generated.
- The server stores room data in-memory:
  ```js
  rooms[roomCode] = {
    question: string,
    options: [{ text: string, votes: number }],
    users: [{ username: string, vote: number }]
  }
  ```
- On `join`, the user is added to the room's user list and receives the current poll state.
- When a vote is cast, the server updates the vote count and broadcasts updated poll data via `poll-update` to all clients in that room.
- After **60 seconds**, the room is automatically deleted using `setTimeout`, and all connected clients receive a `room-expired` event.

---

## Technologies Used

- **Frontend**: React, JavaScript, HTML, CSS
- **Backend**: Node.js, Express.js, Socket.IO
- **Real-time communication**: WebSockets via Socket.IO

---

## Author

Created by **Sagar Sachan** 
