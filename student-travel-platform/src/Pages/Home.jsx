import React, { useState } from "react";
import Map from "../components/Map.jsx"; // Corrected the extension to .jsx
import { db } from "../firebase"; // Import Firebase Firestore
import "./Home.css"; // Custom CSS for Home Page

function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("trip");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    let data = [];
    if (selectedCategory === "trip") {
      const snapshot = await db.collection("trips").where("name", ">=", searchTerm).get();
      data = snapshot.docs.map((doc) => doc.data());
    } else if (selectedCategory === "event") {
      const snapshot = await db.collection("events").where("name", ">=", searchTerm).get();
      data = snapshot.docs.map((doc) => doc.data());
    } else if (selectedCategory === "community") {
      const snapshot = await db.collection("communities").where("name", ">=", searchTerm).get();
      data = snapshot.docs.map((doc) => doc.data());
    }
    setResults(data);
  };

  return (
    <div className="home-page">
      <h2>Welcome to Unitribe</h2>
      <div className="search-bar">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-selector"
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
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <div className="results">
        {results.length > 0 ? (
          results.map((result, index) => (
            <div key={index} className="result-card">
              <h3>{result.name}</h3>
              <p>{result.description}</p>
            </div>
          ))
        ) : (
          <p>No results found</p>
        )}
      </div>

      {/* Display the Map below the search results */}
      <Map />
    </div>
  );
}

export default Home;
