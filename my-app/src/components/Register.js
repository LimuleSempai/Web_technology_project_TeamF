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

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    if (name === 'name') {
      if (!/^[a-z0-9]+$/i.test(value)) {
        newErrors.name = 'Name must be alphanumeric';
      }
    }

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      newErrors.email = emailRegex.test(value) ? '' : 'Invalid email';
    }

    if (name === 'password') {
      if (value.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[a-z]/.test(value)) {
        newErrors.password = 'Password must include a lowercase letter';
      } else if (!/[A-Z]/.test(value)) {
        newErrors.password = 'Password must include an uppercase letter';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        newErrors.password = 'Password must include a special character';
      } else if (!/\d/.test(value)) {
        newErrors.password = 'Password must include a number';
      } else {
        newErrors.password = '';
      }
    }

    if (name === 'confirmPassword') {
      newErrors.confirmPassword =
        value !== formData.password ? 'Passwords do not match' : '';
    }

    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    validateField(name, value);
  };

  const validateForm = () => {
    const requiredFields = ['name', 'email', 'password', 'confirmPassword'];
    let formIsValid = true;
    const newErrors = {};

    requiredFields.forEach((field) => {
      validateField(field, formData[field]);
      if (!formData[field] || errors[field]) {
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    return formIsValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!validateForm()) return;

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URI}api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password
      }, { withCredentials: true });

      setMessage(res.data.message || 'Registered successfully!');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed';
      setMessage(errMsg);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      {message && <div className="message">{message}</div>}
      <form onSubmit={handleSubmit} className="register-form">
        <label>Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'invalid' : ''}
          required
        />
        {errors.name && <span className="error">{errors.name}</span>}

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'invalid' : ''}
          required
        />
        {errors.email && <span className="error">{errors.email}</span>}

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? 'invalid' : ''}
          required
        />
        {errors.password && <span className="error">{errors.password}</span>}

        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={errors.confirmPassword ? 'invalid' : ''}
          required
        />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
