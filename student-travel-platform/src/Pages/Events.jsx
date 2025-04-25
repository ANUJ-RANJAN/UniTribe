import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Adjust the path

import EventCard from '../components/Eventcard';

function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await db.collection('events').get();
      setEvents(snapshot.docs.map(doc => doc.data()));
    };

    fetchEvents();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-3xl mb-4">Upcoming Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event, index) => (
          <EventCard key={index} event={event} />
        ))}
      </div>
    </div>
  );
}

export default Events;
