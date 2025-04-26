import React, { useState, useEffect } from "react";
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

function CommunityCard({ community }) {
  const [isInterested, setIsInterested] = useState(false);
  const [interestCount, setInterestCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [showingUsers, setShowingUsers] = useState(false);

  useEffect(() => {
    // Check if current user is interested in this community
    const checkUserInterest = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const interestsRef = collection(db, "interests");
        const q = query(
          interestsRef,
          where("itemId", "==", community.id),
          where("itemType", "==", "community"),
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
          where("itemId", "==", community.id),
          where("itemType", "==", "community")
        );
        const snapshot = await getDocs(q);
        setInterestCount(snapshot.size);
      } catch (error) {
        console.error("Error getting interest count:", error);
      }
    };

    // Only run if community.id exists
    if (community && community.id) {
      checkUserInterest();
      getInterestCount();
    }
  }, [community?.id]);

  // Fetch interested users
  const fetchInterestedUsers = async () => {
    if (!community || !community.id) return;
    
    try {
      const interestsRef = collection(db, "interests");
      const q = query(
        interestsRef,
        where("itemId", "==", community.id),
        where("itemType", "==", "community")
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
      alert("Please sign in to show interest in this community");
      return;
    }

    setLoading(true);
    try {
      const interestsRef = collection(db, "interests");
      const q = query(
        interestsRef,
        where("itemId", "==", community.id),
        where("itemType", "==", "community"),
        where("userId", "==", user.uid)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // User is not interested yet, add interest
        await addDoc(interestsRef, {
          itemId: community.id,
          itemType: "community",
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
    if (community && community.id && community.location) {
      // First display the community on the map
      if (community.location.lat && community.location.lng) {
        addTripMarker(community.name, community.location.lat, community.location.lng, community.id, "community");
      }
      
      // Then show interested users
      showInterestedUsers(community.id, "community");
      
      // Scroll to the map
      const mapElement = document.querySelector('.map-container');
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      console.error("Community ID or location is missing");
      alert("Cannot show on map: Community information is incomplete");
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

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border border-gray-700">
      {community.imageUrl ? (
        <div className="h-48 overflow-hidden relative">
          <img 
            src={community.imageUrl} 
            alt={community.name} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
          <div className="absolute top-3 right-3 bg-purple-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
            {community.members || 0} members
          </div>
        </div>
      ) : (
        <div className="h-48 overflow-hidden relative bg-gradient-to-r from-purple-700 to-indigo-800">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
          <div className="absolute top-3 right-3 bg-purple-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
            {community.members || 0} members
          </div>
        </div>
      )}
      
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{community.name}</h3>
        
        <div className="flex items-center mb-3 text-gray-300 text-sm">
          {community.category && (
            <span className="bg-indigo-900 text-indigo-200 text-xs px-2 py-1 rounded-full">
              {community.category}
            </span>
          )}
        </div>
        
        <p className="text-gray-400 mb-4 text-sm line-clamp-2">{community.description}</p>
        
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
            {community.location && (
              <button
                onClick={handleShowInterestedUsers}
                className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
              >
                Show on Map
              </button>
            )}
            
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

export default CommunityCard;