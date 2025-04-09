import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditProfileModal.css';

const EditProfileModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URI}/api/auth/profile`, { withCredentials: true })
      .then(res => {
        setFormData(prev => ({ ...prev, name: res.data.name, email: res.data.email }));
      })
      .catch(() => {
        setErrors({ general: 'Failed to load profile' });
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let fieldErrors = { ...errors };

    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      fieldErrors.email = emailRegex.test(value) ? '' : 'Invalid email';
    }

    if (name === 'password') {
      let error = '';
      if (value && value.length < 8) {
        error = 'Password must be at least 8 characters';
      } else if (value && !/[a-z]/.test(value)) {
        error = 'Must contain at least one lowercase letter';
      } else if (value && !/[A-Z]/.test(value)) {
        error = 'Must contain at least one uppercase letter';
      } else if (value && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        error = 'Must contain at least one special character';
      }
      fieldErrors.password = error;
    }

    if (name === 'confirmPassword') {
      fieldErrors.confirmPassword = value !== formData.password ? 'Passwords do not match' : '';
    }

    setErrors(fieldErrors);
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;
    let valid = true;
    let newErrors = {};

    if (!name) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    if (!email || errors.email) {
      newErrors.email = 'Valid email required';
      valid = false;
    }

    if (password) {
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
      }
    
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        valid = false;
      }
    }
    

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const { name, email, password } = formData;
      const updateData = { name, email };
      if (password) updateData.password = password;

      await axios.put(`${process.env.REACT_APP_API_URI}/api/auth/profile`, updateData, {
        withCredentials: true,
      });

      setSuccess('Profile updated!');
      setTimeout(() => {
        onSuccess();
        onClose();
        window.location.reload(); // Refresh to reflect updates
      }, 1000);
    } catch (err) {
      setErrors({ general: 'Failed to update profile' });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Profile</h2>
        <form onSubmit={handleSubmit} className="edit-profile-form">
          {errors.general && <div className="error">{errors.general}</div>}
          {success && <div className="success">{success}</div>}

          <label>Name</label>
          <input
            className={errors.name ? 'invalid' : ''}
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <span className="error">{errors.name}</span>}

          <label>Email</label>
          <input
            className={errors.email ? 'invalid' : ''}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error">{errors.email}</span>}

          <label>New Password</label>
          <input
            className={errors.password ? 'invalid' : ''}
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <span className="error">{errors.password}</span>}

          <label>Confirm Password</label>
          <input
            className={errors.confirmPassword ? 'invalid' : ''}
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}

          <div className="modal-actions">
            <button type="submit">Update</button>
            <button type="button" className="cancel" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
