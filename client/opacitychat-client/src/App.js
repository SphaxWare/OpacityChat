import React, { useEffect, useState } from 'react';
import './App.css';
import FormCard from './FormCard';
import UserList from './UserList';
import Profile from './Profile';
import Loading from './loading';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import { profileUser } from './api';
import UserProfile from './UserProfile';

const socket = io(process.env.REACT_APP_BACKEND_PROD);

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedin, setIsLoggedin] = useState(true);

  // Function to convert ArrayBuffer to Base64
  const arrayBufferToBase64 = (buffer) => {
    const bytes = new Uint8Array(buffer);
    const len = bytes.length;
    let binaryString = '';

    const chunkSize = 1024;
    for (let i = 0; i < len; i += chunkSize) {
      const end = Math.min(i + chunkSize, len);
      const chunk = String.fromCharCode.apply(null, bytes.subarray(i, end));
      binaryString += chunk;
    }

    return window.btoa(binaryString);
  };

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const user = await profileUser();
        socket.emit('userOnline', user._id);
        console.log(user)
        if (user) {
          if (user.profilePic && user.profilePic.data) {
            const base64String = arrayBufferToBase64(user.profilePic.data.data);
            user.profilePic = `data:${user.profilePic.contentType};base64,${base64String}`;
          }
          setCurrentUser(user);
        }
        setIsLoggedin(false)
      } catch (error) {
        console.error('Error fetching user:', error);
        setIsLoggedin(false)
      }
    }

    getCurrentUser();
  }, []);

  // when user close tab he get deconnected
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentUser) {
        socket.emit('userOffline', currentUser._id);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser])

  // when user leave app without closing tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentUser) {
        socket.emit('userOffline', currentUser._id);
        console.log('User is offline due to inactivity.', currentUser.username);
      } else {
        if (currentUser) {
          socket.emit('userOnline', currentUser._id);
        }
      }
    };

    const handleBeforeUnload = () => {
      socket.emit('userOffline', currentUser._id);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser]);

  return (
    <Router>
      <div className="App">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<FormCard />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/loading" element={<Loading />} />
            <Route path="/user-profile/:userId" element={<UserProfile />} />
          </Routes>
      </div>
    </Router>
  );
}

export default App;
