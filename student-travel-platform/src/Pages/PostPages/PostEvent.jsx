import React from 'react';
import EventForm from '../../components/forms/EventForm';
import { useNavigate } from 'react-router-dom';

function PostEvent() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  const handleSuccess = (data) => {
    console.log('New event created:', data);
    navigate('/');
  };

  return (
    <div className="post-event-page">
      <EventForm onClose={handleClose} onSuccess={handleSuccess} />
    </div>
  );
}

export default PostEvent;