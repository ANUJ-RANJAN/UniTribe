import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    bio: '',
    university: '',
    interests: [],
    photoURL: ''
  });
  const [newInterest, setNewInterest] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [userTrips, setUserTrips] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'trips', 'events'
  
  const navigate = useNavigate();
  
  // Pre-defined interests for suggestions
  const interestSuggestions = [
    'Travel', 'Hiking', 'Photography', 'Music', 'Art', 'Sports', 'Reading',
    'Cooking', 'Gaming', 'Technology', 'Languages', 'Movies', 'Dancing',
    'Volunteering', 'Fitness', 'Fashion', 'Science', 'History', 'Nature'
  ];
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch user profile data from Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile({
              displayName: userData.displayName || currentUser.displayName || '',
              bio: userData.bio || '',
              university: userData.university || '',
              interests: userData.interests || [],
              photoURL: userData.photoURL || currentUser.photoURL || ''
            });
          } else {
            // Create a new user document if it doesn't exist
            const newUserData = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || '',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              bio: '',
              university: '',
              interests: [],
              createdAt: new Date()
            };
            
            await updateDoc(userDocRef, newUserData);
            setUserProfile({
              displayName: newUserData.displayName,
              bio: newUserData.bio,
              university: newUserData.university,
              interests: newUserData.interests,
              photoURL: newUserData.photoURL
            });
          }
          
          // Fetch user's trips
          fetchUserTrips(currentUser.uid);
          
          // Fetch user's events
          fetchUserEvents(currentUser.uid);
          
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
        navigate('/');
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);
  
  const fetchUserTrips = async (userId) => {
    try {
      const q = query(collection(db, 'trips'), where('createdBy', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const trips = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUserTrips(trips);
    } catch (error) {
      console.error('Error fetching user trips:', error);
    }
  };
  
  const fetchUserEvents = async (userId) => {
    try {
      const q = query(collection(db, 'events'), where('createdBy', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUserEvents(events);
    } catch (error) {
      console.error('Error fetching user events:', error);
    }
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      // Upload profile image if selected
      let photoURL = userProfile.photoURL;
      
      if (profileImage) {
        photoURL = await uploadProfileImage(profileImage);
      }
      
      // Update user profile in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: userProfile.displayName,
        bio: userProfile.bio,
        university: userProfile.university,
        interests: userProfile.interests,
        photoURL: photoURL,
        updatedAt: new Date()
      });
      
      // Update auth profile
      await updateProfile(user, {
        displayName: userProfile.displayName,
        photoURL: photoURL
      });
      
      // Update local state
      setUserProfile({
        ...userProfile,
        photoURL: photoURL
      });
      
      setEditMode(false);
      setProfileImage(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  const uploadProfileImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const storageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Error uploading image:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };
  
  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setProfileImage(e.target.files[0]);
      setUserProfile({
        ...userProfile,
        photoURL: URL.createObjectURL(e.target.files[0])
      });
    }
  };
  
  const addInterest = () => {
    if (newInterest.trim() && !userProfile.interests.includes(newInterest.trim())) {
      setUserProfile({
        ...userProfile,
        interests: [...userProfile.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };
  
  const removeInterest = (interest) => {
    setUserProfile({
      ...userProfile,
      interests: userProfile.interests.filter(item => item !== interest)
    });
  };
  
  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    
    if (typeof date === 'object' && date.toDate) {
      date = date.toDate();
    } else if (!(date instanceof Date)) {
      date = new Date(date);
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please sign in to view your profile</h2>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Go Home
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Profile</h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-white text-indigo-600 rounded hover:bg-indigo-100"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
        
        <div className="tabs flex border-b">
          <button 
            className={`flex-1 py-3 px-4 font-medium ${activeTab === 'profile' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`flex-1 py-3 px-4 font-medium ${activeTab === 'trips' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('trips')}
          >
            My Trips ({userTrips.length})
          </button>
          <button 
            className={`flex-1 py-3 px-4 font-medium ${activeTab === 'events' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
            onClick={() => setActiveTab('events')}
          >
            My Events ({userEvents.length})
          </button>
        </div>
        
        {activeTab === 'profile' && (
          <div className="p-6">
            {editMode ? (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="flex flex-col md:flex-row md:space-x-6">
                  <div className="mb-6 md:mb-0 flex flex-col items-center">
                    <div className="relative">
                      <img
                        src={userProfile.photoURL || `https://api.dicebear.com/6.x/personas/svg?seed=${user.uid}`}
                        alt={userProfile.displayName || 'User'}
                        className="w-40 h-40 object-cover rounded-full"
                      />
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold">{Math.round(uploadProgress)}%</span>
                        </div>
                      )}
                    </div>
                    <label className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 cursor-pointer">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="displayName">
                        Name
                      </label>
                      <input
                        id="displayName"
                        type="text"
                        value={userProfile.displayName}
                        onChange={(e) => setUserProfile({...userProfile, displayName: e.target.value})}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Your name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="university">
                        University
                      </label>
                      <input
                        id="university"
                        type="text"
                        value={userProfile.university}
                        onChange={(e) => setUserProfile({...userProfile, university: e.target.value})}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Your university"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        value={userProfile.bio}
                        onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Tell us about yourself"
                        rows="4"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Interests
                      </label>
                      <div className="flex flex-wrap mb-2">
                        {userProfile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="bg-indigo-100 text-indigo-800 text-sm rounded-full px-3 py-1 m-1 flex items-center"
                          >
                            {interest}
                            <button
                              type="button"
                              onClick={() => removeInterest(interest)}
                              className="ml-2 text-indigo-600 hover:text-indigo-800 focus:outline-none"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex">
                        <input
                          type="text"
                          value={newInterest}
                          onChange={(e) => setNewInterest(e.target.value)}
                          className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          placeholder="Add an interest"
                        />
                        <button
                          type="button"
                          onClick={addInterest}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-r hover:bg-indigo-700"
                        >
                          Add
                        </button>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-1">Suggestions:</p>
                        <div className="flex flex-wrap">
                          {interestSuggestions
                            .filter(interest => !userProfile.interests.includes(interest))
                            .slice(0, 5)
                            .map((interest, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => {
                                  setUserProfile({
                                    ...userProfile,
                                    interests: [...userProfile.interests, interest]
                                  });
                                }}
                                className="bg-gray-200 text-gray-800 text-sm rounded-full px-3 py-1 m-1 hover:bg-gray-300"
                              >
                                {interest}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setProfileImage(null);
                      setUploadProgress(0);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col md:flex-row md:space-x-6">
                <div className="mb-6 md:mb-0 flex flex-col items-center">
                  <img
                    src={userProfile.photoURL || `https://api.dicebear.com/6.x/personas/svg?seed=${user.uid}`}
                    alt={userProfile.displayName || 'User'}
                    className="w-40 h-40 object-cover rounded-full"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {userProfile.displayName || 'Anonymous User'}
                  </h3>
                  
                  {userProfile.university && (
                    <p className="text-indigo-600 mb-4">
                      {userProfile.university}
                    </p>
                  )}
                  
                  {userProfile.bio && (
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-gray-700 mb-2">Bio</h4>
                      <p className="text-gray-600">{userProfile.bio}</p>
                    </div>
                  )}
                  
                  {userProfile.interests.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-700 mb-2">Interests</h4>
                      <div className="flex flex-wrap">
                        {userProfile.interests.map((interest, index) => (
                          <span
                            key={index}
                            className="bg-indigo-100 text-indigo-800 text-sm rounded-full px-3 py-1 m-1"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'trips' && (
          <div className="p-6">
            {userTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userTrips.map(trip => (
                  <div key={trip.id} className="border rounded-lg overflow-hidden shadow-md">
                    {trip.imageUrl && (
                      <img 
                        src={trip.imageUrl} 
                        alt={trip.title} 
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{trip.title}</h3>
                      <p className="text-indigo-600 mb-2">{trip.location}</p>
                      <p className="text-gray-600 text-sm mb-2">
                        {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                      </p>
                      <p className="text-gray-700 mb-4 line-clamp-2">{trip.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">${trip.cost}</span>
                        <span className="text-gray-600 text-sm">
                          {trip.participants?.length || 0}/{trip.capacity} participants
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-700 mb-4">You haven't created any trips yet</h3>
                <button
                  onClick={() => navigate('/post-trip')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Create a Trip
                </button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'events' && (
          <div className="p-6">
            {userEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userEvents.map(event => (
                  <div key={event.id} className="border rounded-lg overflow-hidden shadow-md">
                    {event.imageUrl && (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title} 
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{event.title}</h3>
                      <p className="text-indigo-600 mb-2">{event.location}</p>
                      <p className="text-gray-600 text-sm mb-2">
                        {formatDate(event.date)}
                      </p>
                      <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">
                          {event.cost > 0 ? `$${event.cost}` : 'Free'}
                        </span>
                        <span className="text-gray-600 text-sm">
                          {event.attendees?.length || 0}/{event.capacity} attendees
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium text-gray-700 mb-4">You haven't created any events yet</h3>
                <button
                  onClick={() => navigate('/post-event')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Create an Event
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;