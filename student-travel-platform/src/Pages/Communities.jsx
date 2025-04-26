import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import CommunityCard from '../components/CommunityCard';
import CommunityForm from '../components/forms/CommunityForm';
import { addSampleCommunities } from '../utils/addSampleData';

function Communities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [addingSamples, setAddingSamples] = useState(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const communitiesRef = collection(db, 'communities');
        const snapshot = await getDocs(communitiesRef);
        const communityData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCommunities(communityData);
      } catch (error) {
        console.error('Error fetching communities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
    
    // Listen for custom event from Navbar
    const handleOpenForm = (event) => {
      if (event.detail?.type === 'community') {
        setShowForm(true);
      }
    };
    
    window.addEventListener('open-form', handleOpenForm);
    
    // Cleanup event listener
    return () => {
      window.removeEventListener('open-form', handleOpenForm);
    };
  }, []);

  const handleCommunityAdded = (newCommunity) => {
    setCommunities([newCommunity, ...communities]);
    setShowForm(false); // Close the form after adding
  };

  const handleAddSampleCommunities = async () => {
    try {
      setAddingSamples(true);
      const result = await addSampleCommunities();
      if (result.data && result.data.length > 0) {
        // Refresh communities after adding samples
        const communitiesRef = collection(db, 'communities');
        const snapshot = await getDocs(communitiesRef);
        const communityData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCommunities(communityData);
        alert(`Successfully added ${result.data.length} sample communities!`);
      }
    } catch (error) {
      console.error('Error adding sample communities:', error);
      alert('Failed to add sample communities');
    } finally {
      setAddingSamples(false);
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-3xl">Student Communities</h2>
        <div className="space-x-3">
          <button 
            onClick={handleAddSampleCommunities}
            disabled={addingSamples}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            {addingSamples ? 'Adding...' : 'Add Sample Communities'}
          </button>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Create New Community
          </button>
        </div>
      </div>
      
      {loading ? (
        <p className="text-center text-white">Loading communities...</p>
      ) : communities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      ) : (
        <div className="text-center text-white">
          <p>No communities available.</p>
          <p className="mt-2">Be the first to create a community!</p>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <CommunityForm 
            onClose={() => setShowForm(false)} 
            onSuccess={handleCommunityAdded} 
          />
        </div>
      )}
    </div>
  );
}

export default Communities;
