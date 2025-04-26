import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';
import TripCard from '../components/Tripcard';
import TripForm from '../components/forms/TripForm';

function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [clearingTrips, setClearingTrips] = useState(false);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const tripsRef = collection(db, 'trips');
      const snapshot = await getDocs(tripsRef);
      const tripData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrips(tripData);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    
    // Listen for custom event from Navbar
    const handleOpenForm = (event) => {
      if (event.detail?.type === 'trip') {
        setShowForm(true);
      }
    };
    
    window.addEventListener('open-form', handleOpenForm);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('open-form', handleOpenForm);
    };
  }, []);

  const handleTripAdded = async (newTrip) => {
    console.log("New trip added:", newTrip); // Add debugging
    
    // Refresh the entire trips list to ensure we get the latest data
    await fetchTrips();
    setShowForm(false); // Close the form after adding
  };

  const handleClearAllTrips = async () => {
    if (!window.confirm('Are you sure you want to delete all trips? This action cannot be undone.')) {
      return;
    }
    
    try {
      setClearingTrips(true);
      const tripsRef = collection(db, 'trips');
      const snapshot = await getDocs(tripsRef);
      
      // Delete each trip document
      const deletePromises = snapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      
      // Refresh the trips list (should be empty now)
      setTrips([]);
      alert('All trips have been removed successfully.');
    } catch (error) {
      console.error('Error clearing trips:', error);
      alert('Failed to clear trips: ' + error.message);
    } finally {
      setClearingTrips(false);
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-3xl">Available Trips</h2>
        <div className="space-x-3">
          {trips.length > 0 && (
            <button 
              onClick={handleClearAllTrips}
              disabled={clearingTrips}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              {clearingTrips ? 'Clearing...' : 'Clear All Trips'}
            </button>
          )}
          <button 
            onClick={() => setShowForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Post New Trip
          </button>
        </div>
      </div>
      
      {loading ? (
        <p className="text-center text-white">Loading trips...</p>
      ) : trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="text-center text-white">
          <p>No trips available.</p>
          <p className="mt-2">Be the first to post a trip!</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <TripForm 
            onClose={() => setShowForm(false)} 
            onSuccess={handleTripAdded} 
          />
        </div>
      )}
    </div>
  );
}

export default Trips;
