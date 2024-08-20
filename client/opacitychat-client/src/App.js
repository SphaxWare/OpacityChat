import React from 'react';
import './App.css';
import FormCard from './FormCard';
import UserList from './UserList';
import Profile from './Profile';
import Loading from './loading';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<FormCard />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/loading" element={<Loading />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
