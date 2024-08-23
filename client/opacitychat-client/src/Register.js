import React, { useState } from 'react';
import { registerUser } from './api';
import { TbCameraPlus } from "react-icons/tb";

const Register = ({ toggleForm }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageClass, setMessageClass] = useState('');
  const [profilePic, setProfilePic] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let data = { username, email, password };
      if (profilePic) {
        data = { username, email, password, profilePic };
        console.log("there is a file in front end", profilePic)
      }
      const response = await registerUser(data);
      if (response) {
        setMessage('Registration successful! You can now log in.');
        setMessageClass('success')
        toggleForm()
      }
    } catch (error) {
      setMessage('Registration failed.');
      setMessageClass('fail')
    }
  };

  const handleFileChange = (e) => {
    setProfilePic(e.target.files[0]);
  };

  return (
    <div className="form register-form">
      <h1>Opacity Chat</h1>
      <h2>Create Your Account !</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <br />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <input
          className='register-pic'
          name="profilePic"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        <span className='register-pic-icon'
          onClick={() => document.querySelector('.register-pic').click()}
        >
          <TbCameraPlus />
        </span>
        <br />
        <button type="submit">Register</button>
      </form>
      <p className={`${messageClass}`}>{message}</p>
      <div className="toggle-link" onClick={toggleForm}>
        Already have an account? Login
      </div>
    </div>
  );
};

export default Register;