// Created by LimuleSempai : 08/04/25
// Modified 6 times by LimuleSempai : last 10/05/25
// Modified 2 times by Warnex04 : last 19/04/25

// Register page with client side validation

import React, { useState } from 'react'; // Import React and the useState hook for local component state
import axios from 'axios'; // Import axios for HTTP requests to the backend
import './Register.css'; // Import styles specific to the register form

function Register() { // Define the Register function
  const [formData, setFormData] = useState({ // Define state for form inputs (name, email, password, confirmPassword)
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({}); // State to store field-specific error messages
  const [message, setMessage] = useState(''); // State to store general form success or failure message

  const validateField = (name, value) => { // Function to validate individual fields as the user types
    const newErrors = { ...errors }; // Copy existing errors to modify them

    if (name === 'name') {
      if (!/^[a-z0-9]+$/i.test(value)) { // Validate that name is alphanumeric
        newErrors.name = 'Name must be alphanumeric'; // If invalid, set error message
      } else {
        newErrors.name = ''; // If valid, clear error
      }
    }

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Email validation using regex pattern
      newErrors.email = emailRegex.test(value) ? '' : 'Invalid email'; // Set error message if email format is invalid
    }

    if (name === 'password') { // Password validation
      if (value.length < 8) { // Minimum 8 characters
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/[a-z]/.test(value)) { // Must contain lowercase letter
        newErrors.password = 'Password must include a lowercase letter';
      } else if (!/[A-Z]/.test(value)) { // Must contain uppercase letter
        newErrors.password = 'Password must include an uppercase letter';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) { // Must contain special character
        newErrors.password = 'Password must include a special character';
      } else if (!/\d/.test(value)) { // Must contain number
        newErrors.password = 'Password must include a number';
      } else {
        newErrors.password = ''; // If all pass, clear error
      }
    }
    // Confirm password must match password
    if (name === 'confirmPassword') {
      newErrors.confirmPassword =
        value !== formData.password ? 'Passwords do not match' : '';
    }

    setErrors(newErrors); // Update error state with new field errors
  };

  const handleChange = (e) => { // Triggered when any input changes
    const { name, value } = e.target; // Get the changed input's name and value

    setFormData((prev) => ({ // Update form state with the new value
      ...prev,
      [name]: value
    }));

    validateField(name, value); // Run field validation on the updated input
  };
  // Function to validate the entire form before submission
  const validateForm = () => {
    const requiredFields = ['name', 'email', 'password', 'confirmPassword']; // Define required fields
    let formIsValid = true; // Track overall form validity
    const newErrors = {}; // Start with a fresh error object

    requiredFields.forEach((field) => { // Validate each required field and check for existing errors
      validateField(field, formData[field]);
      if (!formData[field] || errors[field]) { 
        formIsValid = false; // If field is missing or has an error, invalidate the form
      }
    });

    setErrors(newErrors); // Update the full errors state
    return formIsValid; // Return final validity result
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form refresh
    setMessage(''); // Reset the feedback message

    if (!validateForm()) return; // Stop submission if validation fails

    try { // Attempt to register user via POST request to backend
      const res = await axios.post(`${process.env.REACT_APP_API_URI}auth/register`, {
        // Send form data, include credentials for session
        name: formData.name,
        email: formData.email,
        password: formData.password
      }, { withCredentials: true });

      setMessage(res.data.message || 'Registered successfully!'); // Set success message from backend response
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed'; // Handle backend or network error and display appropriate message
      setMessage(errMsg);
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2> {/* Title */}
      {message && <div className="message">{message}</div>} {/* Show message after form submission (success or error) */}
      <form onSubmit={handleSubmit} className="register-form"> {/* Begin registration form */}
        <label>Name</label> {/* Name input */}
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'invalid' : ''} 
          required
        />
        {errors.name && <span className="error">{errors.name}</span>} {/* Show name error if exists */}

        <label>Email</label> {/* Email input */}
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'invalid' : ''}
          required
        />
        {errors.email && <span className="error">{errors.email}</span>} {/* Show email error */}

        <label>Password</label> {/* Password input */}
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? 'invalid' : ''}
          required
        />
        {errors.password && <span className="error">{errors.password}</span>} {/* Show password error */}

        <label>Confirm Password</label> {/* Confirm password input */}
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={errors.confirmPassword ? 'invalid' : ''}
          required
        />
        {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>} {/* Show confirm password error */}

        <button type="submit">Register</button> {/* Submit button */}
      </form> {/* End of form */}
    </div>
  );
}

export default Register; // Export the Register component for use in routing
