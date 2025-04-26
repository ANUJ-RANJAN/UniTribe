import React from 'react';
import CommunityForm from '../../components/forms/CommunityForm';
import { useNavigate } from 'react-router-dom';

function PostCommunity() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  const handleSuccess = (data) => {
    console.log('New community created:', data);
    navigate('/');
  };

  return (
    <div className="post-community-page">
      <CommunityForm onClose={handleClose} onSuccess={handleSuccess} />
    </div>
  );
}

export default PostCommunity;