import React from 'react';
import { Link } from 'react-router-dom'; // For navigation
import houseIcon from '../assets/house.png';  // Import house image
import travelIcon from '../assets/travel.png'; // Import travel image
import peopleIcon from '../assets/people.png'; // Import people image
import diversityIcon from '../assets/diversity.png'; // Import diversity image
import "../App.css";  // Adjust path according to where the App.css file is located


function Navbar() {
  return (
    <div className="navbar">
      <div className="nav-links">
        {/* Home Button */}
        <Link to="/">
          <img src={houseIcon} alt="Home" style={{ width: '20px', marginRight: '8px' }} />
          Home
        </Link>

        {/* Trips Button */}
        <Link to="/trips">
          <img src={travelIcon} alt="Trips" style={{ width: '20px', marginRight: '8px' }} />
          Trips
        </Link>

        {/* Events Button */}
        <Link to="/events">
          <img src={peopleIcon} alt="Events" style={{ width: '20px', marginRight: '8px' }} />
          Events
        </Link>

        {/* Communities Button */}
        <Link to="/communities">
          <img src={diversityIcon} alt="Communities" style={{ width: '20px', marginRight: '8px' }} />
          Communities
        </Link>
      </div>
    </div>
  );
}

export default Navbar;
