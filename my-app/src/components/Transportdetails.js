// Created by LimuleSempai : 08/04/25
// Modified 4 times by LimuleSempai : last 10/05/25
// Modified 1 time by Warnex04 : last 20/04/25

// Connect componentsfor the transport page

// Import necessary dependencies
import React, { useState, useEffect } from "react"; // React core and hooks
import { useParams } from "react-router-dom"; // Hook to access route parameters
import axios from "axios"; // For API calls

// Import child components for reviews
import ReviewForm from "./ReviewForm"; // Component for submitting a new review
import ReviewList from "./ReviewList"; // Component for displaying all reviews

// Define the TransportDetails component
const TransportDetails = () => {
  const { id } = useParams(); // Get the `id` from the route parameters
  const [transport, setTransport] = useState(null); // State to hold transport data

  // Fetch transport details on component mount or when ID changes
  useEffect(() => {
    const fetchData = async () => {
      // Make GET request to fetch transport data by ID
      const res = await axios.get(`${process.env.REACT_APP_API_URI}transport/${id}`);
      setTransport(res.data); // Store response data in state
    };
    fetchData();
  }, [id]);

  return (
    <div className="p-6">
      {transport ? (
        <>
          {/* Display transport name and description */}
          <h1 className="text-3xl font-bold">{transport.name}</h1>
          <p>{transport.description}</p>

          {/* Display form to post a new review */}
          <ReviewForm transportId={id} />

          {/* Display existing reviews for this transport */}
          <ReviewList transportId={id} />
        </>
      ) : (
        // Show loading state while fetching transport
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TransportDetails; // Export the component for use in routing
