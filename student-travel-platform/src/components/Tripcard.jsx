import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from "../firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc,
  getDoc 
} from "firebase/firestore";
import { showInterestedUsers, addTripMarker } from "./Map";

function Tripcard({ trip }) {
  const [isInterested, setIsInterested] = useState(false);
  const [interestCount, setInterestCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [showingUsers, setShowingUsers] = useState(false);
  
  useEffect(() => {
    // Check if current user is interested in this trip
    const checkUserInterest = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const interestsRef = collection(db, "interests");
        const q = query(
          interestsRef,
          where("itemId", "==", trip.id),
          where("itemType", "==", "trip"),
          where("userId", "==", user.uid)
        );
        const snapshot = await getDocs(q);
        setIsInterested(!snapshot.empty);
      } catch (error) {
        console.error("Error checking user interest:", error);
      }
    };

    // Get the count of interested users
    const getInterestCount = async () => {
      try {
        const interestsRef = collection(db, "interests");
        const q = query(
          interestsRef,
          where("itemId", "==", trip.id),
          where("itemType", "==", "trip")
        );
        const snapshot = await getDocs(q);
        setInterestCount(snapshot.size);
      } catch (error) {
        console.error("Error getting interest count:", error);
      }
    };

    // Only run if trip.id exists
    if (trip && trip.id) {
      checkUserInterest();
      getInterestCount();
    }
  }, [trip?.id]);

  // Format date to a more readable format - safe handling of dates
  const formatDate = (dateValue) => {
    if (!dateValue) return "No date";
    
    try {
      // Handle Firestore timestamp objects
      if (dateValue.seconds) {
        return new Date(dateValue.seconds * 1000).toLocaleDateString();
      }
      
      // Handle string dates
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      }
      
      // Handle date objects directly
      if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
        return dateValue.toLocaleDateString();
      }
      
      return "Invalid Date";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Fetch interested users
  const fetchInterestedUsers = async () => {
    if (!trip || !trip.id) return;
    
    try {
      const interestsRef = collection(db, "interests");
      const q = query(
        interestsRef,
        where("itemId", "==", trip.id),
        where("itemType", "==", "trip")
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setInterestedUsers([]);
        return;
      }
      
      const userPromises = snapshot.docs.map(async (interest) => {
        const userId = interest.data().userId;
        const userDoc = await getDoc(doc(db, "users", userId));
        
        if (userDoc.exists()) {
          return {
            id: userId,
            ...userDoc.data()
          };
        }
        return null;
      });
      
      const users = await Promise.all(userPromises);
      setInterestedUsers(users.filter(user => user !== null));
    } catch (error) {
      console.error("Error fetching interested users:", error);
    }
  };

  const toggleInterest = async () => {
    const user = auth.currentUser;
    if (!user) {
      // Prompt user to sign in
      alert("Please sign in to show interest in this trip");
      return;
    }

    setLoading(true);
    try {
      const interestsRef = collection(db, "interests");
      const q = query(
        interestsRef,
        where("itemId", "==", trip.id),
        where("itemType", "==", "trip"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // User is not interested yet, add interest
        await addDoc(interestsRef, {
          itemId: trip.id,
          itemType: "trip",
          userId: user.uid,
          timestamp: new Date()
        });
        setIsInterested(true);
        setInterestCount(prev => prev + 1);
      } else {
        // User is already interested, remove interest
        const docToDelete = snapshot.docs[0].ref;
        await deleteDoc(docToDelete);
        setIsInterested(false);
        setInterestCount(prev => prev - 1);
      }
    } catch (error) {
      console.error("Error toggling interest:", error);
      alert("Failed to update interest status: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowInterestedUsers = () => {
    if (trip && trip.id) {
      // First display the trip on the map
      if (trip.startLocation && trip.startLocation.lat && trip.startLocation.lng) {
        addTripMarker(trip.destination || "Trip", trip.startLocation.lat, trip.startLocation.lng, trip.id, "trip");
      }
      
      // Then show interested users
      showInterestedUsers(trip.id, "trip");
      
      // Scroll to the map
      const mapElement = document.querySelector('.map-container');
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      console.error("Trip ID is missing");
      alert("Cannot show interested users: Trip ID is missing");
    }
  };

  // Toggle showing interested users list
  const toggleShowUsers = async () => {
    if (showingUsers) {
      setShowingUsers(false);
    } else {
      await fetchInterestedUsers();
      setShowingUsers(true);
    }
  };

  // Direct chat with user
  const startChat = (userId, userName) => {
    // Store the user ID we want to chat with 
    sessionStorage.setItem('chatWithUserId', userId);
    sessionStorage.setItem('chatWithUserName', userName || 'User');
    
    // Navigate to chat page
    window.location.href = '/chat';
  };

  // Calculate remaining spots
  const remainingSpots = trip.maxParticipants ? (trip.maxParticipants - (trip.participants?.length || 0)) : null;

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border border-gray-700">
      <div className="h-48 overflow-hidden relative">
        <img 
          src={trip.imageUrl || 'https://source.unsplash.com/random/300x200/?travel'} 
          alt={trip.destination || "Trip"} 
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
        <div className="absolute top-3 right-3 bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
        </div>
        <div className="absolute top-3 left-3 bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
          ${trip.cost || 0}
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{trip.name || trip.title || trip.destination || "Trip"}</h3>
        
        <div className="flex items-center mb-3 text-gray-300 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{trip.destination || "No destination specified"}</span>
        </div>
        
        <p className="text-gray-400 mb-4 text-sm line-clamp-2">{trip.description}</p>
        
        <div className="flex justify-between items-center">
          <button
            onClick={toggleShowUsers}
            className="flex items-center text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {interestCount} interested
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShowInterestedUsers}
              className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
            >
              Show on Map
            </button>
            
            <button
              onClick={toggleInterest}
              disabled={loading}
              className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                isInterested
                  ? "bg-pink-600 hover:bg-pink-700 text-white"
                  : "bg-gray-700 hover:bg-gray-600 text-white"
              }`}
            >
              {loading ? (
                <span className="animate-pulse">...</span>
              ) : isInterested ? (
                <>Interested</>
              ) : (
                <>Interested?</>
              )}
            </button>
          </div>
        </div>
        
        {remainingSpots !== null && (
          <div className="mt-3 px-3 py-1 bg-green-800 text-green-100 text-xs font-medium rounded-full inline-block">
            {remainingSpots > 0 ? `${remainingSpots} spot${remainingSpots === 1 ? '' : 's'} available` : "Full"}
          </div>
        )}
        
        {showingUsers && interestedUsers.length > 0 && (
          <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
            <h4 className="text-white text-sm font-medium mb-2">Interested Users</h4>
            <ul className="space-y-2">
              {interestedUsers.map(user => (
                <li key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="w-6 h-6 rounded-full mr-2" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center mr-2">
                        <span className="text-xs text-white">{user.displayName?.[0] || 'U'}</span>
                      </div>
                    )}
                    <span className="text-gray-300 text-sm">{user.displayName || 'Anonymous User'}</span>
                  </div>
                  <button 
                    onClick={() => startChat(user.id, user.displayName)}
                    className="text-xs px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                  >
                    Message
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tripcard;
