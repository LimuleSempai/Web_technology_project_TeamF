// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Header.css';

const Header = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URI}api/auth/profile`, { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    axios.post(`${process.env.REACT_APP_API_URI}api/auth/logout`, {}, { withCredentials: true })
      .then(() => {
        setUser(null);
        navigate('/');
      });
  };

  return (
    <header className="header">
      <div className="logo" onClick={() => navigate('/')}>🚍 Public Transport for Ireland</div>
      <div className="profile-section">
        <div onClick={() => setMenuOpen(!menuOpen)} className="profile-btn">
          {user ? user.name : 'Login'}
        </div>

        {menuOpen && (
          <div className="dropdown-menu">
            {!user ? (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            ) : (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
                <button onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
