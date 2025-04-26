import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, or } from 'firebase/firestore';
import { db } from '../../firebase';

function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q') || '';
  
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState({
    trips: [],
    events: [],
    communities: []
  });
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'trips', 'events', 'communities'
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setLoading(false);
      return;
    }
    
    const fetchSearchResults = async () => {
      setLoading(true);
      
      try {
        const searchQueryLower = searchQuery.toLowerCase();
        
        // Search trips
        const tripsQuery = query(
          collection(db, 'trips')
        );
        const tripsSnapshot = await getDocs(tripsQuery);
        const tripsResults = tripsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: 'trip'
          }))
          .filter(trip => 
            trip.title.toLowerCase().includes(searchQueryLower) ||
            trip.description.toLowerCase().includes(searchQueryLower) ||
            trip.location.toLowerCase().includes(searchQueryLower)
          );
        
        // Search events
        const eventsQuery = query(
          collection(db, 'events')
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsResults = eventsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: 'event'
          }))
          .filter(event => 
            event.title.toLowerCase().includes(searchQueryLower) ||
            event.description.toLowerCase().includes(searchQueryLower) ||
            event.location.toLowerCase().includes(searchQueryLower)
          );
        
        // Search communities
        const communitiesQuery = query(
          collection(db, 'communities')
        );
        const communitiesSnapshot = await getDocs(communitiesQuery);
        const communitiesResults = communitiesSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: 'community'
          }))
          .filter(community => 
            community.name.toLowerCase().includes(searchQueryLower) ||
            community.description.toLowerCase().includes(searchQueryLower) ||
            community.category.toLowerCase().includes(searchQueryLower)
          );
        
        setSearchResults({
          trips: tripsResults,
          events: eventsResults,
          communities: communitiesResults
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error searching:', error);
        setLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [searchQuery]);
  
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
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSearchQuery = formData.get('searchQuery');
    
    if (newSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(newSearchQuery.trim())}`);
    }
  };
  
  const getTotalResultsCount = () => {
    return searchResults.trips.length + searchResults.events.length + searchResults.communities.length;
  };
  
  const getFilteredResults = () => {
    if (activeTab === 'all') {
      return [
        ...searchResults.trips,
        ...searchResults.events,
        ...searchResults.communities
      ].sort((a, b) => {
        // Sort by creation date if available
        const dateA = a.createdAt ? (a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt)) : new Date(0);
        const dateB = b.createdAt ? (b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt)) : new Date(0);
        return dateB - dateA;
      });
    } else if (activeTab === 'trips') {
      return searchResults.trips;
    } else if (activeTab === 'events') {
      return searchResults.events;
    } else if (activeTab === 'communities') {
      return searchResults.communities;
    }
    
    return [];
  };
  
  const getResultCard = (result) => {
    switch (result.type) {
      case 'trip':
        return (
          <div key={result.id} className="border rounded-lg overflow-hidden shadow-md">
            {result.imageUrl && (
              <img 
                src={result.imageUrl} 
                alt={result.title} 
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <div className="text-xs font-medium text-indigo-600 uppercase mb-1">Trip</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{result.title}</h3>
              <p className="text-indigo-600 mb-2">{result.location}</p>
              <p className="text-gray-600 text-sm mb-2">
                {formatDate(result.startDate)} - {formatDate(result.endDate)}
              </p>
              <p className="text-gray-700 mb-4 line-clamp-2">{result.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">${result.cost}</span>
                <span className="text-gray-600 text-sm">
                  {result.participants?.length || 0}/{result.capacity} participants
                </span>
              </div>
            </div>
          </div>
        );
      
      case 'event':
        return (
          <div key={result.id} className="border rounded-lg overflow-hidden shadow-md">
            {result.imageUrl && (
              <img 
                src={result.imageUrl} 
                alt={result.title} 
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <div className="text-xs font-medium text-purple-600 uppercase mb-1">Event</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{result.title}</h3>
              <p className="text-indigo-600 mb-2">{result.location}</p>
              <p className="text-gray-600 text-sm mb-2">
                {formatDate(result.date)}
              </p>
              <p className="text-gray-700 mb-4 line-clamp-2">{result.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">
                  {result.cost > 0 ? `$${result.cost}` : 'Free'}
                </span>
                <span className="text-gray-600 text-sm">
                  {result.attendees?.length || 0}/{result.capacity} attendees
                </span>
              </div>
            </div>
          </div>
        );
      
      case 'community':
        return (
          <div key={result.id} className="border rounded-lg overflow-hidden shadow-md">
            {result.imageUrl && (
              <img 
                src={result.imageUrl} 
                alt={result.name} 
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <div className="text-xs font-medium text-green-600 uppercase mb-1">Community</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{result.name}</h3>
              <p className="text-indigo-600 mb-2">{result.category}</p>
              <p className="text-gray-700 mb-4 line-clamp-3">{result.description}</p>
              <div className="flex justify-end items-center">
                <span className="text-gray-600 text-sm">
                  {result.members?.length || 0} members
                </span>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-indigo-600 text-white">
          <h2 className="text-2xl font-bold">Search Results</h2>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="flex w-full md:w-2/3 lg:w-1/2 mx-auto">
              <input
                type="text"
                name="searchQuery"
                defaultValue={searchQuery}
                placeholder="Search for trips, events, communities..."
                className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Search
              </button>
            </div>
          </form>
          
          {!searchQuery.trim() ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-700 mb-4">Enter a search query to find trips, events, and communities</h3>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : getTotalResultsCount() === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-700 mb-4">No results found for "{searchQuery}"</h3>
              <p className="text-gray-600">Try different keywords or check for typos</p>
            </div>
          ) : (
            <>
              <div className="flex border-b mb-6 overflow-x-auto">
                <button
                  className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === 'all' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('all')}
                >
                  All Results ({getTotalResultsCount()})
                </button>
                <button
                  className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === 'trips' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('trips')}
                >
                  Trips ({searchResults.trips.length})
                </button>
                <button
                  className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === 'events' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('events')}
                >
                  Events ({searchResults.events.length})
                </button>
                <button
                  className={`py-3 px-4 font-medium whitespace-nowrap ${activeTab === 'communities' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('communities')}
                >
                  Communities ({searchResults.communities.length})
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getFilteredResults().map(result => getResultCard(result))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;