import React, { useState, useEffect } from 'react';
import { loginUser } from './api';
import { useNavigate } from 'react-router-dom';

const Login = ({ toggleForm }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageClass, setMessageClass] = useState('');
  const navigate = useNavigate();

    // Check if the user is already authenticated
    useEffect(() => {
      const isAuthenticated = localStorage.getItem('jwtToken');
      if (isAuthenticated) {
        navigate('/users');
      }
    }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { email, password };
      const response = await loginUser(data);
      if (response) {
        setMessage('Login successful !');
        setMessageClass('success')
        // logic to redirect the user to the user list page
        setTimeout(() => {
          navigate('/users')
        }, 250)

        }
    } catch (error) {
      setMessage('Login failed.');
      setMessageClass('fail')
    }
  };

  return (
    <div className="form login-form">
      <h1>Opacity Chat</h1>
      <h2>Log in to your account</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Login</button>
      </form>
      <p className={`${messageClass}`}>{message}</p>
      <div className="toggle-link" onClick={toggleForm}>
        Don't have an account? Sign up
      </div>
    </div>
  );
};

export default Login;