import React, { useState, useEffect } from 'react';
import 'reactjs-popup/dist/index.css';
import { db } from '../firebase'; // Adjust the path
import { Link } from 'react-router-dom';
import EventCard from '../components/Eventcard';
import Popup from 'reactjs-popup';
import { collection, addDoc } from "firebase/firestore"; 
import { getDatabase, ref, child, get } from "firebase/database";
import { getFirestore, getDocs } from 'firebase/firestore';


function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dbRef = ref(getDatabase());
  get(child(dbRef, `events`)).then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });
  
  const Create = async (e) => {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const name = formData.get("name");
    const description = formData.get("description");
    const location = formData.get("location");
    const time = formData.get("time");
    const organizer = formData.get("organizer");
    const imageUrl = formData.get("imageUrl");
  
    console.log({ name, description, location });
  
    try {
      const docRef = await addDoc(collection(db, "events"), {
        name,
        description,
        location,
        organizer,
        time,
        imageUrl,
        createdAt: new Date(), // Optional: add timestamp
      });
      console.log("Document written with ID: ", docRef.id);
      // Reload events after creating a new one
      fetchEvents();
      close(); // Close the popup
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };
  
  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Initialize the database reference
      const db = getFirestore();
      
      // Create reference to the events collection
      const eventsRef = collection(db, 'events');
      
      // Get the data once
      const snapshot = await getDocs(eventsRef);
      const eventsArray = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEvents(eventsArray);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching events:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="p-4 container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Upcoming Events</h2>
        <Popup
          trigger={
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            style={{ backgroundColor: 'green', color: 'white', padding: '10px 20px' }}>
              + Create
            </button>
          }
          modal
          nested
        >
          {(close) => (
            <div className="bg-white p-6 rounded shadow-md text-black">
              <form onSubmit={(e) => {
                Create(e);
                // Note: We don't close here as Create will handle closing on success
              }} className="space-y-4 text-black">
                <div>
                  <label className="block text-black font-semibold">Name:</label>
                  <input
                    name="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-black font-semibold">Description:</label>
                  <input
                    name="description"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-black font-semibold">Location:</label>
                  <input
                    name="location"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-black font-semibold">Date:</label>
                  <input
                    name="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-black font-semibold">Organizer:</label>
                  <input
                    name="organizer"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-black font-semibold">Time:</label>
                  <input
                    name="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-black font-semibold">Image:</label>
                  <input
                    name="imageUrl"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-black"
                  />
                </div>
                <div className="flex justify-between pt-4">
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          )}
        </Popup>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold">Events List<button 
          onClick={fetchEvents}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-right"
          style={{ backgroundColor: 'blue', color: 'white', padding: '10px 20px' }}
        >
          Reload
        </button></h3>
        
      </div>
      
      {loading ? (
        <p>Loading events...</p>
      ) : error ? (
        <p>Error loading events: {error}</p>
      ) : events.length === 0 ? (
        <p>No events found in the database</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            return (
              <div key={event.id} className={`rounded-lg shadow-lg overflow-hidden border border-gray-700`}>
                
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2">Event: {event.name || event.title}</h3>
                  {event.date && <p className="text-gray-300 mb-2">Date: {event.date}</p>}
                  {event.description && <p className="text-gray-200 mb-3">Description: {event.description}</p>}
                  {event.location && <p className="text-gray-300">Location: {event.location}</p>}
                  {event.organizer && <p className="text-gray-300">Orgainizer: {event.organizer}</p>}
                  {event.time && <p className="text-gray-300">Time: {event.time}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>   
  );
}

export default Events;