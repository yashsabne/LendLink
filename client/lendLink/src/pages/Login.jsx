import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setLogin } from '../redux/state'; 

import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); 

    try {
      const response = await fetch(`http://localhost:3001/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (response.ok) {
        const loggedIn = await response.json();
        dispatch(
          setLogin({
            user: loggedIn.user,
            token: loggedIn.token,
          })
        );
        setIsLoading(false); 
        navigate("/dashboard"); 
      } else {
        const errorData = await response.json()
        setIsLoading(false); 
        setError(errorData.message);  
     
      }
    } catch (err) {
      console.log("Login failed", err.message);
      setIsLoading(false); // Stop loading on error
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-title">Welcome Back!</h2>
        <p className="auth-subtitle">Log in to access your account</p>
        {error && <p style={{color:'red'}} >{error}</p> }
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="auth-input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>


          <div className="button-div">

          <button type="submit" className="auth-submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
          <Link to='/'>
                <button className="get-back-button">
                    ← Back to Home
                </button>
            </Link>

            </div>

        </form>


        <p className="auth-switch">
          Don’t have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
