import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    age: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [currentStep, setCurrentStep] = useState(0); // 0: Form, 1: OTP Verification
  const [isLoading, setIsLoading] = useState(false);
  const [message, setmessage] = useState('');
  const navigate = useNavigate();

  const backendUrl = "http://localhost:3001";

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/auth/send-otp-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const result = await response.json();

      if (response.ok) {
        setmessage(`OTP sent to your email address ${formData.email} .`);
        setCurrentStep(1); // Move to OTP Verification step
      } else {
        setmessage(`Failed to send OTP: ${result.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error sending OTP:", err.message);
      setmessage("An error occurred while sending OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${backendUrl}/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email, otp }),
      });

      const result = await response.json();

      if (result.success) {
        setmessage("OTP verified! Proceeding with registration...");
        await handleRegister();
      } else {
        setmessage("Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err.message);
      setmessage("An error occurred during OTP verification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Ensure `formData` is sent as JSON
      });

      const result = await response.json();

      if (response.ok) {
        setmessage("Registration successful! Redirecting to login.");
        navigate("/login");
      } else {
        setmessage(`Registration failed: ${result.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error during registration:", err.message);
      setmessage("An error occurred while registering. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        
        <h2 className="auth-title">
          {currentStep === 0 ? "Create an Account" : "Verify Your Email"}
        </h2>
  
        {message &&   <p style={{fontWeight:'bold'}} >{message}</p>}

        {currentStep === 0 ? (
          <form className="auth-form auth-form--two-column" onSubmit={handleSendOtp}>
            {["name", "email", "phone", "address", "age", "password"].map((field) => (
              <div key={field} className="auth-input-group">
                <label htmlFor={field}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === "password" ? "password" : "text"}
                  id={field}
                  placeholder={`Enter ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                  value={formData[field]}
                  onChange={handleInputChange}
                  required
                />
              </div>
            ))}

<div className="button-div" >

            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? "Proceeding..." : "Continue"}
            </button>

            <Link to='/'>
                <button className="get-back-button">
                    ← Back to Home
                </button>
            </Link>

            </div>
            
            
         
          </form>
          
          
        ) : (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <div className="auth-input-group">
              <label htmlFor="otp">OTP</label>
              <input
                type="text"
                id="otp"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-submit" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
