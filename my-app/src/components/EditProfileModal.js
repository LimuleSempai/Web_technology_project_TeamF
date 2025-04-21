import React, { useState, useEffect } from 'react'; // Import React and useState/useEffect hooks
import axios from 'axios'; // Import Axios for HTTP requests
import './EditProfileModal.css'; // Import the component-specific CSS
// Functional component with props: onClose (close modal), onSuccess (callback on success)
const EditProfileModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ // State to track form input values
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({}); // State to store validation errors per field
  const [success, setSuccess] = useState(''); // State to store success message upon update

  useEffect(() => { // useEffect fetches the current user profile when the modal mounts
    const token = localStorage.getItem('token');
    if (!token) return;
    axios.get(`${process.env.REACT_APP_API_URI}auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { // If successful, update form state with name and email 
        setFormData(prev => ({ ...prev, name: res.data.name, email: res.data.email })); // Use previous state and override name/email from response
      })
      .catch(() => {
        setErrors({ general: 'Failed to load profile' }); // If request fails, set a general error
      });
  }, []);

  const handleChange = (e) => { // Called on every input change
    const { name, value } = e.target; // Destructure name/value from event
    setFormData(prev => ({ ...prev, [name]: value })); // Update form data
    validateField(name, value); // Validate the changed field
  };

  const validateField = (name, value) => { // Validates an individual input field (name, email, etc.)
    let fieldErrors = { ...errors }; // Clone existing errors into a mutable object
    // Name validation: must be alphanumeric
    if (name === 'name') {
      if (!/^[a-z0-9]+$/i.test(value)) {
        fieldErrors.name = 'Name must be alphanumeric'; // If invalid, set error message
      } else {
        fieldErrors.name = ''; // If valid, clear error message
      }
    }
    // Email validation: basic email regex
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      fieldErrors.email = emailRegex.test(value) ? '' : 'Invalid email'; // Set error message only if invalid format
    }
    // Password validation
    if (name === 'password') {
      let error = ''; // Reset error message
      if (value && value.length < 8) { // Check minimum length
        error = 'Password must be at least 8 characters';
      } else if (value && !/[a-z]/.test(value)) { // Require at least one lowercase letter
        error = 'Must contain at least one lowercase letter';
      } else if (value && !/[A-Z]/.test(value)) { // Require at least one uppercase letter
        error = 'Must contain at least one uppercase letter';
      } else if (value && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) { // Require at least one special character
        error = 'Must contain at least one special character';
      } else if (value && !/\d/.test(value)) { // Require at least one number
        error = 'Must contain at least one number';
      }
      fieldErrors.password = error; // Set the final password validation error
    }
    // Confirm password must match the password field
    if (name === 'confirmPassword') {
      fieldErrors.confirmPassword = value !== formData.password ? 'Passwords do not match' : '';
    }
    // Update the errors state with the field-specific errors
    setErrors(fieldErrors);
  };
  // Validates the full form before submission
  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData; // Destructure input fields
    let valid = true; // Flag to track if form is valid
    let newErrors = {}; // Start a fresh error object
    // Name is required and must pass prior validation
    if (!name || errors.name) {
      newErrors.name = 'Valid name is required';
      valid = false;
    }
    // Email is required and must pass prior validation
    if (!email || errors.email) {
      newErrors.email = 'Valid email required';
      valid = false;
    }
    // Validate password if user provided one
    if (password) {
      // Re-validate all password conditions
      if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
        valid = false;
      } else if (!/[a-z]/.test(password)) {
        newErrors.password = 'Password must include a lowercase letter';
        valid = false;
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password = 'Password must include an uppercase letter';
        valid = false;
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        newErrors.password = 'Password must include a special character';
        valid = false;
      } else if (!/\d/.test(password)) {
        newErrors.password = "Password must include a number";
        valid = false;
      }
      // Confirm password must match password
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        valid = false;
      }
    }
    
    setErrors(newErrors); // Update error messages for the form
    return valid; // Return whether the form is valid
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submit behavior
    if (!validateForm()) return; // Abort if form validation fails

    try {
      const { name, email, password } = formData; // Destructure fields again
      const updateData = { name, email }; // Build update payload with name and email
      if (password) updateData.password = password; // Include password if it's present
      // Send PUT request to backend with updated profile data
      await axios.put(`${process.env.REACT_APP_API_URI}auth/profile`, updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setSuccess('Profile updated!'); // Show a success message temporarily
      setTimeout(() => { // Wait 1 second and then call success and close modal
        onSuccess();
        onClose();
        window.location.reload(); // Refresh to reflect updates
      }, 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile'; // If update fails, show the backend error or a fallback
      setErrors({ general: errorMessage }); // Use error message from response or fallback text
    }    
  };

  return (
    <div className="modal-overlay"> {/*JSX: render modal overlay*/}
      <div className="modal-content"> {/* Modal content container*/}
        <h2>Edit Profile</h2> {/*Title*/}
        <form onSubmit={handleSubmit} className="edit-profile-form"> {/*Handle form submission*/}
          {errors.general && <div className="error">{errors.general}</div>} {/*Show general error message if exists*/}
          {success && <div className="success">{success}</div>} {/*Show success message if exists*/}

          <label>Name</label> {/*Name input field*/}
          <input
            className={errors.name ? 'invalid' : ''}
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <span className="error">{errors.name}</span>} {/*Conditionally show validation error under field*/}

          <label>Email</label> {/*Email input field*/}
          <input
            className={errors.email ? 'invalid' : ''}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error">{errors.email}</span>} {/*Conditionally show validation error*/}

          <label>New Password</label> {/*New password input field*/}
          <input
            className={errors.password ? 'invalid' : ''}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <span className="error">{errors.password}</span>} {/*Show password validation errors*/}

          <label>Confirm Password</label> {/*Confirm password input field*/}
          <input
            className={errors.confirmPassword ? 'invalid' : ''}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>} {/*Show confirm password validation errors*/}

          <div className="modal-actions"> {/*Buttons: submit and cancel (close modal)*/}
            <button type="submit">Update</button>
            <button type="button" className="cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal; // Export the component for use elsewhere
