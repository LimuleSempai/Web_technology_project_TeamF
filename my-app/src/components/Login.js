import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    axios.post(`${process.env.REACT_APP_API_URI}api/auth/login`, { email, password }, { withCredentials: true })
      .then((res) => {
        navigate('/');
        window.location.reload();
      })
      .catch((err) => {
        setError('Invalid credentials');
      });
  };

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input type="email" placeholder="Email" className="border p-2" 
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="border p-2" 
          onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" className="bg-blue-500 text-white p-2">Login</button>
      </form>
    </div>
  );
};

export default Login;
