import React from 'react';
import TripForm from '../../components/forms/TripForm';
import { useNavigate } from 'react-router-dom';

function PostTrip() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  const handleSuccess = (data) => {
    console.log('New trip created:', data);
    navigate('/');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Post a New Trip</h1>
      <TripForm onClose={handleClose} onSuccess={handleSuccess} />
    </div>
  );
}

export default PostTrip;