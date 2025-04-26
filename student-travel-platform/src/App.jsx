import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './Pages/Home';
import Trips from './Pages/Trips';
import Events from './Pages/Events';
import Communities from './Pages/Communities';
import PostTrip from './Pages/PostPages/PostTrip';
import PostEvent from './Pages/PostPages/PostEvent';
import PostCommunity from './Pages/PostPages/PostCommunity';
import Chat from './Pages/Chat/Chat';
import Profile from './Pages/Profile/Profile';
import Search from './Pages/Search/Search';
import UserLocationTracker from './components/UserLocationTracker';

function App() {
  const [activeForm, setActiveForm] = useState(null);

  useEffect(() => {
    // Listen for the custom event dispatched from the Navbar component
    const handleOpenForm = (event) => {
      setActiveForm(event.detail.type);
    };

    window.addEventListener('open-form', handleOpenForm);

    return () => {
      window.removeEventListener('open-form', handleOpenForm);
    };
  }, []);

  const handleCloseForm = () => {
    setActiveForm(null);
  };

  const handleFormSuccess = (data) => {
    console.log(`New ${activeForm} created:`, data);
    setActiveForm(null); // Close form after successful submission
  };

  return (
    <Router>
      <div className="app-container min-h-screen flex flex-col">
        {/* User location tracker component */}
        <UserLocationTracker />
        
        <Navbar />
        <div className="content flex-grow p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/events" element={<Events />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/post-trip" element={<PostTrip />} />
            <Route path="/post-event" element={<PostEvent />} />
            <Route path="/post-community" element={<PostCommunity />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </div>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
