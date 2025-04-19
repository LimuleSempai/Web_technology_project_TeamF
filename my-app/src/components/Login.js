import React, { useState } from "react"; // Import React and useState hook for state management
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook from React Router for programmatic navigation
import axios from "axios"; // Import axios for making HTTP requests
// Define the Login functional component
const Login = () => {
  const navigate = useNavigate(); // Initialize the navigate function to redirect users after login

  const [email, setEmail] = useState(""); // State to store the user's input email
  const [password, setPassword] = useState(""); // State to store the user's input password
  const [error, setError] = useState(""); // State to store error message if login fails
  // Function to handle form submission
  const handleLogin = (e) => {
    e.preventDefault(); // Prevent default form reload behavior
    // Send login credentials to the backend via POST request
    axios.post(`${process.env.REACT_APP_API_URI}api/auth/login`, { email, password }, { withCredentials: true }) // Include session cookie by setting withCredentials: true
      .then((res) => {
        navigate('/'); // On successful login, redirect to home
        window.location.reload(); // Refresh the page to reload authenticated user state
      })
      .catch((err) => {
        setError('Invalid credentials'); // On login failure, show a generic error message
      });
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold">Login</h2> {/* Heading for the login form */}
      {error && <p className="text-red-500">{error}</p>} {/* Show error message if login fails */}
      <form onSubmit={handleLogin} className="flex flex-col gap-4"> {/* Form for email and password login */}
        <input type="email" placeholder="Email" className="border p-2" 
          onChange={(e) => setEmail(e.target.value)} required /> {/* Email input field */}
        <input type="password" placeholder="Password" className="border p-2" 
          onChange={(e) => setPassword(e.target.value)} required /> {/* Password input field */}
        <button type="submit" className="bg-blue-500 text-white p-2">Login</button> {/* Submit button to log in */}
      </form>
    </div>
  );
};

export default Login; // Export the Login page
