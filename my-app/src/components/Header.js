// src/components/Header.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaBus, FaUserCircle } from 'react-icons/fa'; // Example icons
import './Header.css';

const Header = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Check login status on mount
    useEffect(() => {
        // First set from localStorage for immediate UI update
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user from localStorage", e);
                localStorage.removeItem('user');
            }
        }

        // Then verify with backend
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoading(false);
            setUser(null);
            localStorage.removeItem('user');
            return;
        }
        axios.get(`${process.env.REACT_APP_API_URI}auth/status`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setIsLoading(false);
                if (res.data.isLoggedIn) {
                    setUser(res.data.user);
                    localStorage.setItem('user', JSON.stringify(res.data.user));
                } else {
                    setUser(null);
                    localStorage.removeItem('user');
                }
            })
            .catch(err => {
                setIsLoading(false);
                console.error("Error checking auth status:", err);
            });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/');
    };

    return (
        <header className="bg-gray-800 text-white shadow-md">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center text-xl font-bold">
                            <FaBus className="mr-2 h-6 w-6 text-indigo-400" /> {/* Example Logo */}
                            <span>TransportApp</span>
                        </Link>
                        {/* link to transport page */}
                        <Link
                            to="/transports"
                            className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Transport
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/profile" className="flex items-center text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                    <FaUserCircle className="mr-1" />
                                    <span>{user.name || user.email}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                    Login
                                </Link>
                                <Link to="/register" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
