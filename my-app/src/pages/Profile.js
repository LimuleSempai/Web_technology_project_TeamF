// src/pages/Profile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditProfileModal from '../components/EditProfileModal';
import './Profile.css';

const Profile = () => {
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URI}api/auth/profile`, { withCredentials: true })
      .then((res) => setUser(res.data))
      .catch((err) => console.error('Failed to fetch user profile', err));
  }, []);

  if (!user) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <h2>Welcome, {user?.name}</h2>
      <p><strong>Email:</strong> {user?.email}</p>
      <button onClick={() => setShowModal(true)}>Edit Profile</button>

      {showModal && (
        <EditProfileModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
          }}
        />
      )}
    </div>
  );
};

export default Profile;
