import React, { useState, useEffect } from "react";
import MapComponent, { addTripMarker } from "../components/Map.jsx";
import { db } from "../firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { addSampleTrips, addSampleEvents, addSampleCommunities } from "../utils/addSampleData";
import "./Home.css";

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("trip");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear error when search term or category changes
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [searchTerm, selectedCategory]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError("Please enter a search term");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Searching for:', searchTerm, 'in category:', selectedCategory);
      let data = [];
      
      if (selectedCategory === "trip") {
        const tripsRef = collection(db, "trips");
        const searchTermLower = searchTerm.toLowerCase();
        const q = query(tripsRef);
        
        try {
          const querySnapshot = await getDocs(q);
          
          // Client-side filtering for partial matches
          data = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(trip => trip.name && trip.name.toLowerCase().includes(searchTermLower));
          
          console.log('Found trips:', data);
        } catch (firestoreError) {
          console.error('Firestore error:', firestoreError);
          
          // Check if it's a permission error
          if (firestoreError.code === 'permission-denied' || 
              firestoreError.message.includes('Missing or insufficient permissions')) {
            console.log('Permission error during search, using mock data instead');
            
            // Use mock data for searches when Firebase permissions fail
            const mockTrips = [
              {
                id: 'mock1',
                name: "Weekend Trek to Manali",
                description: "A thrilling weekend trek through the beautiful mountains of Manali",
                location: { lat: 32.2396, lng: 77.1887 },
                price: 5000,
                duration: "2 days"
              },
              {
                id: 'mock2',
                name: "Goa Beach Adventure",
                description: "Experience the beaches and nightlife of Goa",
                location: { lat: 15.2993, lng: 74.124 },
                price: 8000,
                duration: "3 days"
              },
              {
                id: 'mock3',
                name: "Delhi Heritage Walk",
                description: "Explore the historical monuments of Delhi",
                location: { lat: 28.6139, lng: 77.209 },
                price: 1500,
                duration: "1 day"
              }
            ];
            
            // Filter mock data according to search term
            data = mockTrips.filter(trip => 
              trip.name.toLowerCase().includes(searchTermLower)
            );
            
            // Add a note about using mock data
            setError("Note: Using mock data because of database permission restrictions.");
          } else {
            throw new Error(`Database error: ${firestoreError.message}`);
          }
        }
      } else if (selectedCategory === "event") {
        const eventsRef = collection(db, "events");
        const q = query(eventsRef);
        
        try {
          const querySnapshot = await getDocs(q);
          data = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(event => event.name && event.name.toLowerCase().includes(searchTerm.toLowerCase()));
        } catch (firestoreError) {
          console.error('Firestore error:', firestoreError);
          throw new Error(`Database error: ${firestoreError.message}`);
        }
      } else if (selectedCategory === "community") {
        const communitiesRef = collection(db, "communities");
        const q = query(communitiesRef);
        
        try {
          const querySnapshot = await getDocs(q);
          data = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(community => community.name && community.name.toLowerCase().includes(searchTerm.toLowerCase()));
        } catch (firestoreError) {
          console.error('Firestore error:', firestoreError);
          throw new Error(`Database error: ${firestoreError.message}`);
        }
      }
      
      setResults(data);
      if (data.length === 0 && !error) {
        setError(`No ${selectedCategory}s found matching "${searchTerm}"`);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setError(`Search failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowOnMap = (result) => {
    if (result.location?.lat && result.location?.lng) {
      // Pass the result id and type to the addTripMarker function
      addTripMarker(result.name, result.location.lat, result.location.lng, result.id, selectedCategory);
    } else {
      setError(`Location coordinates are missing for "${result.name}"`);
    }
  };

  return (
    <div className="home-page">
      <h2 className="text-2xl font-bold mb-4">Welcome to Unitribe</h2>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Sample data buttons */}
        <button 
          onClick={async () => {
            try {
              setIsLoading(true);
              setError(null);
              const result = await addSampleTrips();
              
              // If trips were added successfully, update the results state
              if (result.data && result.data.length > 0) {
                setResults(result.data);
                setSelectedCategory("trip");
                alert('Sample trips added successfully! You can now search for them.');
              }
            } catch (error) {
              console.error('Error adding sample trips:', error);
              
              // Handle permission errors with more specific guidance
              if (error.message.includes('permission-denied') || error.message.includes('Missing or insufficient permissions')) {
                setError(
                  `Firebase permission denied: You don't have permission to write to the database. ` +
                  `This is likely due to Firebase security rules. ` +
                  `As a workaround, here are some sample trips you can use for testing:`
                );
                
                // Provide mock data in the UI when database writes fail
                const mockTrips = [
                  {
                    id: 'mock1',
                    name: "Weekend Trek to Manali",
                    description: "A thrilling weekend trek through the beautiful mountains of Manali",
                    location: { lat: 32.2396, lng: 77.1887 },
                    price: 5000,
                    duration: "2 days"
                  },
                  {
                    id: 'mock2',
                    name: "Goa Beach Adventure",
                    description: "Experience the beaches and nightlife of Goa",
                    location: { lat: 15.2993, lng: 74.124 },
                    price: 8000,
                    duration: "3 days"
                  },
                  {
                    id: 'mock3',
                    name: "Delhi Heritage Walk",
                    description: "Explore the historical monuments of Delhi",
                    location: { lat: 28.6139, lng: 77.209 },
                    price: 1500,
                    duration: "1 day"
                  }
                ];
                
                setResults(mockTrips);
              } else {
                // Handle other types of errors
                setError(`Failed to add sample trips: ${error.message}`);
              }
            } finally {
              setIsLoading(false);
            }
          }}
          className="bg-green-500 text-white px-4 py-2 rounded-lg"
          disabled={isLoading}
        >
          {isLoading && selectedCategory === "trip" ? 'Loading...' : 'Add Sample Trips'}
        </button>

        <button 
          onClick={async () => {
            try {
              setIsLoading(true);
              setError(null);
              const result = await addSampleEvents();
              
              if (result.data && result.data.length > 0) {
                setResults(result.data);
                setSelectedCategory("event");
                alert('Sample events added successfully! You can now search for them.');
              }
            } catch (error) {
              console.error('Error adding sample events:', error);
              setError(`Failed to add sample events: ${error.message}`);
            } finally {
              setIsLoading(false);
            }
          }}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg"
          disabled={isLoading}
        >
          {isLoading && selectedCategory === "event" ? 'Loading...' : 'Add Sample Events'}
        </button>

        <button 
          onClick={async () => {
            try {
              setIsLoading(true);
              setError(null);
              const result = await addSampleCommunities();
              
              if (result.data && result.data.length > 0) {
                setResults(result.data);
                setSelectedCategory("community");
                alert('Sample communities added successfully! You can now search for them.');
              }
            } catch (error) {
              console.error('Error adding sample communities:', error);
              setError(`Failed to add sample communities: ${error.message}`);
            } finally {
              setIsLoading(false);
            }
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          disabled={isLoading}
        >
          {isLoading && selectedCategory === "community" ? 'Loading...' : 'Add Sample Communities'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      <div className="search-bar mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-selector p-2 rounded-lg mr-2"
          disabled={isLoading}
        >
          <option value="trip">Trip</option>
          <option value="event">Event</option>
          <option value="community">Community</option>
        </select>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !isLoading) {
              handleSearch();
            }
          }}
          className="p-2 rounded-lg mr-2"
          disabled={isLoading}
        />
        <button 
          onClick={handleSearch} 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="flex gap-4 flex-col md:flex-row">
        <div className="results-container w-full md:w-1/3">
          <h3 className="text-lg font-semibold mb-2">Search Results</h3>
          {isLoading ? (
            <p>Loading results...</p>
          ) : results.length > 0 ? (
            results.map((result) => (
              <div 
                key={result.id} 
                className="result-card p-4 mb-4 bg-white rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleShowOnMap(result)}
              >
                <h3 className="font-bold text-lg">{result.name}</h3>
                <p className="text-gray-600">{result.description}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowOnMap(result);
                  }}
                  className="mt-2 text-blue-500 hover:text-blue-700"
                >
                  Show on Map
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No results found</p>
          )}
        </div>

        <div className="map-container w-full md:w-2/3">
          <MapComponent />
        </div>
      </div>
    </div>
  );
}

export default Home;
