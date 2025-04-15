import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";

const TransportDetails = () => {
  const { id } = useParams();
  const [transport, setTransport] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`${process.env.REACT_APP_API_URI}api/transport/${id}`);
      setTransport(res.data);
    };
    fetchData();
  }, [id]);

  return (
    <div className="p-6">
      {transport ? (
        <>
          <h1 className="text-3xl font-bold">{transport.name}</h1>
          <p>{transport.description}</p>
          <ReviewForm transportId={id} />
          <ReviewList transportId={id} />
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TransportDetails;
