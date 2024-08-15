import React, { useState } from 'react';
import './FormCard.css';
import Login from './Login';
import Register from './Register';

const FormCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  const toggleForm = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="container">
      <div className={`card ${isFlipped ? 'flip' : ''}`} id="card">
        <Login toggleForm={toggleForm} />
        <Register toggleForm={toggleForm} />
      </div>
    </div>
  );
};

export default FormCard;