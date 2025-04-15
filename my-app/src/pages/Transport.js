import React, { useEffect, useState } from "react";
import axios from "axios";

const Transport = () => {
  const [transports, setTransports] = useState([]); // Ensure it's an array by default

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URI}api/transport/transports`)
      .then((res) => {
        console.log("Transport data:", res.data);
        setTransports(Array.isArray(res.data) ? res.data : []); // Make sure it's an array
      })
      .catch((err) => {
        console.error("Error fetching transport data:", err);
        setTransports([]); // Fallback to empty array on error
      });
  }, []);

  return (
    <div>
      <h2>Available Transports</h2>
      <ul>
        {transports.map((transport) => (
          <li key={transport._id}>
            <strong>{transport._id}</strong> — {transport.description}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Transport;
