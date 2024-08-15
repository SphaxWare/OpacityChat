import React, { useState } from 'react';
import { registerUser } from './api';

const Register = ({ toggleForm }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageClass, setMessageClass] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { username, email, password };
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

  return (
    <div className="form register-form">
      <h1>Opacity Chat</h1>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
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