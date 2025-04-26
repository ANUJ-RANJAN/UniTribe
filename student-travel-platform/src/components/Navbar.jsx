import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import houseIcon from '../assets/house.png';
import travelIcon from '../assets/travel.png';
import peopleIcon from '../assets/people.png';
import diversityIcon from '../assets/diversity.png';
import UserProfile from './Auth/UserProfile';
import "../App.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll event listener to change navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to search results with query parameter
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSearch(false);
    }
  };

  // Check if the current path matches the link path
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Function to dispatch a custom event to show the form on the appropriate page
  const openPostForm = (type) => {
    // Create and dispatch a custom event to open the correct form type
    const event = new CustomEvent('open-form', { detail: { type } });
    window.dispatchEvent(event);
  };

  return (
    <div className={`sticky top-0 z-50 backdrop-blur-md transition-all duration-300 ${
      scrolled ? 'bg-white/95 shadow-soft' : 'bg-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-1 sm:space-x-4">
            {/* Home Button */}
            <Link to="/" className={`nav-link group flex flex-col items-center px-2 py-1 rounded-xl transition-all ${
              isActive('/') 
                ? 'text-primary-600 bg-primary-50 scale-105 shadow-sm' 
                : 'text-neutral-600 hover:text-primary-500 hover:bg-primary-50/70'
            }`}>
              <div className={`p-1.5 rounded-full transition-all ${isActive('/') ? 'bg-primary-100' : 'group-hover:bg-primary-100'}`}>
                <img src={houseIcon} alt="Home" className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-xs font-medium mt-1">{isActive('/') ? <strong>Home</strong> : 'Home'}</span>
            </Link>

            {/* Trips Icon */}
            <Link to="/trips" className={`nav-link group flex flex-col items-center px-2 py-1 rounded-xl transition-all ${
              isActive('/trips') 
                ? 'text-primary-600 bg-primary-50 scale-105 shadow-sm' 
                : 'text-neutral-600 hover:text-primary-500 hover:bg-primary-50/70'
            }`}>
              <div className={`p-1.5 rounded-full transition-all ${isActive('/trips') ? 'bg-primary-100' : 'group-hover:bg-primary-100'}`}>
                <img src={travelIcon} alt="Trips" className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-xs font-medium mt-1">{isActive('/trips') ? <strong>Trips</strong> : 'Trips'}</span>
            </Link>

            {/* Events Icon */}
            <Link to="/events" className={`nav-link group flex flex-col items-center px-2 py-1 rounded-xl transition-all ${
              isActive('/events') 
                ? 'text-primary-600 bg-primary-50 scale-105 shadow-sm' 
                : 'text-neutral-600 hover:text-primary-500 hover:bg-primary-50/70'
            }`}>
              <div className={`p-1.5 rounded-full transition-all ${isActive('/events') ? 'bg-primary-100' : 'group-hover:bg-primary-100'}`}>
                <img src={peopleIcon} alt="Events" className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-xs font-medium mt-1">{isActive('/events') ? <strong>Events</strong> : 'Events'}</span>
            </Link>

            {/* Communities Icon */}
            <Link to="/communities" className={`nav-link group flex flex-col items-center px-2 py-1 rounded-xl transition-all ${
              isActive('/communities') 
                ? 'text-primary-600 bg-primary-50 scale-105 shadow-sm' 
                : 'text-neutral-600 hover:text-primary-500 hover:bg-primary-50/70'
            }`}>
              <div className={`p-1.5 rounded-full transition-all ${isActive('/communities') ? 'bg-primary-100' : 'group-hover:bg-primary-100'}`}>
                <img src={diversityIcon} alt="Communities" className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
              </div>
              <span className="text-xs font-medium mt-1">{isActive('/communities') ? <strong>Communities</strong> : 'Communities'}</span>
            </Link>
            
            {/* Chat Icon */}
            <Link to="/chat" className={`nav-link group flex flex-col items-center px-2 py-1 rounded-xl transition-all ${
              isActive('/chat') 
                ? 'text-primary-600 bg-primary-50 scale-105 shadow-sm' 
                : 'text-neutral-600 hover:text-primary-500 hover:bg-primary-50/70'
            }`}>
              <div className={`p-1.5 rounded-full transition-all ${isActive('/chat') ? 'bg-primary-100' : 'group-hover:bg-primary-100'}`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xs font-medium mt-1">{isActive('/chat') ? <strong>Chat</strong> : 'Chat'}</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Create new content dropdown */}
            <div className="relative group">
              <button 
                className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2 group-hover:scale-105"
              >
                <span>Create</span>
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-elevated py-2 w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top scale-95 group-hover:scale-100 z-10">
                <button 
                  onClick={() => navigate('/post-trip')} 
                  className="flex items-center w-full px-4 py-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <span>New Trip</span>
                </button>
                <button 
                  onClick={() => navigate('/post-event')} 
                  className="flex items-center w-full px-4 py-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span>New Event</span>
                </button>
                <button 
                  onClick={() => navigate('/post-community')} 
                  className="flex items-center w-full px-4 py-2 text-neutral-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span>New Community</span>
                </button>
              </div>
            </div>

            {/* Search Icon and Form */}
            <div className="relative">
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 rounded-full text-neutral-600 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {showSearch && (
                <form onSubmit={handleSearch} className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-elevated p-3 w-72 z-10 animate-slide-up">
                  <div className="flex">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search trips, events, communities..."
                      className="w-full rounded-l-lg border-neutral-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-all"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-3 rounded-r-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            {/* User Profile Component */}
            <UserProfile />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
