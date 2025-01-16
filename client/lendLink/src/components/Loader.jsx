import React, { useState, useEffect } from 'react';
import "../styles/Loader.css";

const Loader = () => {
  const [message, setMessage] = useState('Now Loading.');
  const messages = ['Now Loading.', 'Now Loading..', 'Now Loading...'];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setMessage(messages[i]);
      i = (i + 1) % messages.length;
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="main-div-loader">
      <div className="container-loader">
        <div className="loader"></div>
        <p id="message-1" className="p-loader">{message}</p>
      </div>
    </div>
  );
};

export default Loader;
