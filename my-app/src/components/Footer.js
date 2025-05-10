// Created by LimuleSempai : 08/04/25
// Modified 9 times by LimuleSempai : last 10/05/25

// Define the footer

// Import React to define a functional component
import React from 'react';

// Import Link from react-router-dom to navigate without refreshing the page
import { Link } from 'react-router-dom';

// Import the CSS specific to the Footer component
import './Footer.css';

// Define and export the Footer component
const Footer = () => {
  return (
    // JSX for the footer element with a class for styling
    <footer className="footer">
      {/* Display the current year and team information */}
      <p>&copy; {new Date().getFullYear()} Team F - <a className="Glink" href="https://www.griffith.ie/" target="_blank" rel="noreferrer">Griffith College</a></p>

      {/* Link to the About Us page */}
      <Link to="/about" className="footer-link">About Us</Link>
    </footer>
  );
};

export default Footer;
