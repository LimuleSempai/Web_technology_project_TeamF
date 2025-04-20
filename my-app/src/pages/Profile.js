// src/pages/Profile.js
import React, { useEffect, useState } from 'react'; // Import React and useEffect/useState hooks
import axios from 'axios'; // Import axios for making HTTP requests
import EditProfileModal from '../components/EditProfileModal'; // Import the EditProfileModal component
import './Profile.css'; // Import profile-specific styling

const Profile = () => { // Define the Profile component
  const [showModal, setShowModal] = useState(false); // State to control visibility of the EditProfileModal
  const [user, setUser] = useState(null); // State to store the current user's profile data

  useEffect(() => { // Fetch user profile data on component mount
    axios.get(`${process.env.REACT_APP_API_URI}api/auth/profile`, { withCredentials: true }) // Send GET request to backend to retrieve session-based user info
      .then((res) => setUser(res.data)) // On success, store user info in state
      .catch((err) => console.error('Failed to fetch user profile', err)); // On error, log a warning to the console
  }, []);

  if (!user) return <p>Loading profile...</p>; // If user data hasn't loaded yet, show loading message

  return (
    <div className="profile-container">
      <h2>Welcome, {user?.name}</h2> {/* Welcome message with the user's name */}
      <p><strong>Email:</strong> {user?.email}</p> {/* Display the user's email */}
      <button onClick={() => setShowModal(true)}>Edit Profile</button> {/* Button to trigger the edit modal */}
      {/* Conditionally render the EditProfileModal when showModal is true */}
      {showModal && (
        <EditProfileModal
          onClose={() => setShowModal(false)} // Close the modal
          onSuccess={() => { // Placeholder for future success callback
          }}
        />
      )}
    </div>
  );
};

export default Profile; // Export the component for use in routing
