import { useState, useEffect } from 'react';
import { auth, signOutUser } from '../../firebase';
import AuthModal from './AuthModal';
import NotificationsPanel from '../Notifications/NotificationsPanel';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });
    
    return unsubscribe;
  }, []);
  
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOutUser();
      setShowDropdown(false);
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };
  
  const handleAuthSuccess = (user) => {
    setUser(user);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (showDropdown) setShowDropdown(false);
  };
  
  const openAuthModal = () => {
    setShowAuthModal(true);
  };
  
  const closeAuthModal = () => {
    setShowAuthModal(false);
  };
  
  return (
    <div className="relative flex items-center space-x-4">
      {user && (
        <button
          onClick={toggleNotifications}
          className="relative text-gray-700 hover:text-indigo-600 focus:outline-none"
          aria-label="Notifications"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Notification indicator */}
          <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 bg-red-500 text-white text-xs rounded-full">
            {/* Replace with actual notification count */}
          </span>
        </button>
      )}
      
      {user ? (
        // User is signed in
        <div>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 focus:outline-none"
            disabled={isSigningOut}
          >
            <img 
              src={user.photoURL || `https://api.dicebear.com/6.x/personas/svg?seed=${user.uid}`} 
              alt={user.displayName || "User"} 
              className="w-8 h-8 rounded-full"
            />
            <span className="hidden md:block text-sm font-medium">
              {user.displayName || user.email || "User"}
            </span>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                disabled={isSigningOut}
              >
                {isSigningOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          )}
        </div>
      ) : (
        // User is not signed in
        <button 
          onClick={openAuthModal}
          className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Sign In
        </button>
      )}
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={closeAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
      
      <NotificationsPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
}

export default UserProfile;