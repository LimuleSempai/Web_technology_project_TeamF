import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableCell, TableBody } from "@/components/ui/table";

const TransportDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/api/get-transport");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Real-Time Transport Data</h1>
        <Button onClick={fetchData} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh Data"}
        </Button>
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableCell>Trip ID</TableCell>
              <TableCell>Route ID</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Stop ID</TableCell>
              <TableCell>Delay (seconds)</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              item.trip_update.stop_time_update.map((stop, index) => (
                <TableRow key={`${item.id}-${index}`}>
                  <TableCell>{item.trip_update.trip.trip_id}</TableCell>
                  <TableCell>{item.trip_update.trip.route_id}</TableCell>
                  <TableCell>{item.trip_update.trip.start_time}</TableCell>
                  <TableCell>{stop.stop_id}</TableCell>
                  <TableCell>{stop.arrival?.delay || "N/A"}</TableCell>
                </TableRow>
              ))
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default TransportDashboard;
