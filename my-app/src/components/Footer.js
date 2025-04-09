// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Team F - Griffith University</p>
      <Link to="/about" className="footer-link">About Us</Link>
    </footer>
  );
};

export default Footer;
