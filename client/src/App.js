import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './components/home';
import Room from './components/room';


function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path = '/' element = {<Home/>} />
          <Route path = '/room' element = {<Room/>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App;
