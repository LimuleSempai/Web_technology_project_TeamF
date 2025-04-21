// Import React and useState for state management
import React, { useState } from "react";

// Import useNavigate to programmatically redirect after login, and Link for navigation
import { useNavigate, Link } from 'react-router-dom';

// Import axios for making HTTP requests
import axios from "axios";

// Define the Login functional component
const Login = () => {
  const navigate = useNavigate(); // Initialize the navigate function to redirect users after login

  const [email, setEmail] = useState(""); // State to store the user's input email
  const [password, setPassword] = useState(""); // State to store the user's input password
  const [error, setError] = useState(""); // State to store error message if login fails

  // Function to handle form submission
  const handleLogin = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(""); // Reset error message

    // Send login request to backend
    axios.post(`${process.env.REACT_APP_API_URI}auth/login`, { email, password })
      .then((res) => {
        // Check if response includes user data and token
        if (res.data && res.data.user && res.data.token) {
          // Store user and token in localStorage for persistence
          localStorage.setItem('user', JSON.stringify(res.data.user));
          localStorage.setItem('token', res.data.token);
          console.log('User and token stored in localStorage:', res.data.user, res.data.token);
          navigate('/'); // Redirect to homepage
        } else {
          // Login technically succeeded but user data is missing
          console.warn('Login response did not contain user data or token.');
          setError('Login successful but user data or token was missing');
        }
      })
      .catch((err) => {
        // Handle failed login
        console.error("Login error:", err);
        setError(err.response?.data?.message || 'Invalid credentials or server error');
      });
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-100 px-4">
      <div className="p-6 md:p-8 max-w-md w-full bg-white rounded-lg shadow-md">
        {/* Heading */}
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>

        {/* Display error message if login fails */}
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        {/* Login form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            {/* Email label and input */}
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            {/* Password label and input */}
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Login
          </button>
        </form>

        {/* Link to register page */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login; // Export the Login page
