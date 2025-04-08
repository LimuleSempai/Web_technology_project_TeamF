import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Transport = () => {
  const [transports, setTransports] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("http://localhost:5000/api/transport");
      setTransports(res.data);
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Available Transports</h1>
      <ul>
        {transports.map((t) => (
          <li key={t._id} className="border p-4 my-2">
            <Link to={`/transport/${t._id}`} className="text-blue-500">{t.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Transport;
