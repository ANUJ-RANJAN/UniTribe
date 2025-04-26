import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import EventCard from '../components/Eventcard'; // Make sure this matches the actual filename case
import EventForm from '../components/forms/EventForm';
import { SampleDataUtility } from '../utils/addSampleData';

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [addingSamples, setAddingSamples] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsRef = collection(db, 'events');
        const snapshot = await getDocs(eventsRef);
        const eventData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(eventData);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    
    // Listen for custom event from Navbar
    const handleOpenForm = (event) => {
      if (event.detail?.type === 'event') {
        setShowForm(true);
      }
    };
    
    window.addEventListener('open-form', handleOpenForm);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('open-form', handleOpenForm);
    };
  }, []);

  const handleEventAdded = (newEvent) => {
    setEvents([newEvent, ...events]);
    setShowForm(false); // Close the form after adding
  };

  const handleAddSampleEvents = async () => {
    try {
      setAddingSamples(true);
      const eventIds = await SampleDataUtility.addSampleEvents();
      // Refresh events after adding samples
      const eventsRef = collection(db, 'events');
      const snapshot = await getDocs(eventsRef);
      const eventData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventData);
      alert(`Successfully added ${eventIds.length} sample events!`);
    } catch (error) {
      console.error('Error adding sample events:', error);
      alert('Failed to add sample events');
    } finally {
      setAddingSamples(false);
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-3xl">Upcoming Events</h2>
        <div className="space-x-3">
          <button 
            onClick={handleAddSampleEvents}
            disabled={addingSamples}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            {addingSamples ? 'Adding...' : 'Add Sample Events'}
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Post New Event
          </button>
        </div>
      </div>
      
      {loading ? (
        <p className="text-center text-white">Loading events...</p>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center text-white">
          <p>No events available.</p>
          <p className="mt-2">Be the first to post an event!</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <EventForm 
            onClose={() => setShowForm(false)} 
            onSuccess={handleEventAdded} 
          />
        </div>
      )}
    </div>
  );
}

export default Events;
