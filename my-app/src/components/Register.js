import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      return "All fields are required";
    }
  
    if (!emailRegex.test(formData.email)) {
      return "Invalid email format";
    }
  
    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }
  
    if (!/[a-z]/.test(formData.password)) {
      return "Password must include a lowercase letter";
    }
  
    if (!/[A-Z]/.test(formData.password)) {
      return "Password must include an uppercase letter";
    }
  
    if (!specialCharRegex.test(formData.password)) {
      return "Password must include a special character";
    }
  
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
  
    return null;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
  
    const error = validate();
    if (error) {
      setMessage(error);
      return;
    }
  
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URI}api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      }, { withCredentials: true });
  
      setMessage(response.data.message || "Registered successfully");
    } catch (error) {
      const errMsg = error.response?.data?.message;
      if (errMsg?.includes("Username")) {
        setMessage("This name is already taken. Please choose another.");
      } else if (errMsg?.includes("Email")) {
        setMessage("This email is already registered.");
      } else {
        setMessage("Something went wrong.");
      }
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {message && <p className="message">{message}</p>}
      <form onSubmit={handleSubmit} className="register-form">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
