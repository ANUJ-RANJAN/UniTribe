import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import TripCard from '../components/TripCard';

function Trips() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const fetchTrips = async () => {
      const snapshot = await db.collection('trips').get();
      setTrips(snapshot.docs.map(doc => doc.data()));
    };

    fetchTrips();
  }, []);

  return (
    <div className="p-8 bg-gray-900">
      <h1 className="text-white text-3xl mb-6 text-center">Available Trips</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {trips.map((trip, index) => (
          <TripCard key={index} trip={trip} />
        ))}
      </div>
    </div>
  );
}

export default Trips;
