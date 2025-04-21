// src/pages/AboutUs.js
import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-container">
      <h2>About Us</h2>

      <p>Welcome to <strong>TransportApp</strong> – your companion for navigating Ireland’s public transport system with confidence and ease! 🚍</p>

      <p>
        We are <strong>Team F</strong>, a group of passionate Web Technology students from <strong>Griffith University</strong>. This platform was developed as part of our academic project with a simple but ambitious goal: 
        to make real-time transport data accessible, helpful, and interactive for everyone.
      </p>

      <p>
        TransportApp allows you to:
        <ul>
          <li>🔎 Browse up-to-date transport routes and schedules using real-time API data</li>
          <li>📝 View detailed stop-by-stop trip information</li>
          <li>🌟 Read and post reviews for specific routes to help fellow passengers</li>
          <li>👤 Manage your own user profile, with options to edit your data and review history</li>
        </ul>
      </p>

      <p>
        Our platform is powered by open data from Transport for Ireland and aims to bring commuters a smoother experience by blending modern web technologies with a user-friendly interface.
      </p>

      <p>
        This project has been a collaborative effort in frontend, backend, and full-stack integration — helping us grow both technically and creatively.
      </p>

      <p>
        Whether you’re a daily commuter, a student, a visitor, or just someone trying to catch the next bus — we’re glad you’re here. 🚏
      </p>

      <p><strong>Thank you for using TransportApp. Safe travels!</strong> 🌍</p>
    </div>
  );
};

export default AboutUs;
