import { useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

function UserLocationTracker() {
  useEffect(() => {
    let watchId = null;
    
    const startLocationTracking = () => {
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser");
        return;
      }
      
      if (!auth.currentUser) {
        console.log("User not logged in, not tracking location");
        return;
      }
      
      // Options for the geolocation API
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      };
      
      // Watch position and update in database
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const userId = auth.currentUser.uid;
            
            // Update user document with current location
            await setDoc(doc(db, 'users', userId), {
              currentLocation: {
                lat: latitude,
                lng: longitude,
                updatedAt: serverTimestamp()
              }
            }, { merge: true });
            
            console.log("Location updated successfully");
          } catch (error) {
            console.error("Error updating location:", error);
          }
        },
        (error) => {
          console.error("Error getting location:", error.message);
        },
        options
      );
    };
    
    // Start tracking when user is authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        startLocationTracking();
      } else if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    });
    
    // Cleanup function
    return () => {
      unsubscribe();
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);
  
  // This component doesn't render anything, it just runs the side effect
  return null;
}

export default UserLocationTracker;