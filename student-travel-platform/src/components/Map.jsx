import React, { useEffect } from "react";
import mapboxgl from "mapbox-gl"; // Import Mapbox

// Set your Mapbox access token
mapboxgl.accessToken = "pk.eyJ1IjoiYW51anJhbmphbmFyIiwiYSI6ImNtOXdicXVuZzB1YTgyaW13MDB4OWIyb3YifQ._jLzZwYAUIVDWD2om7QZ5w";

function Map() {
  useEffect(() => {
    // Initialize the map
    const map = new mapboxgl.Map({
      container: "map", // The ID of the container div
      style: "mapbox://styles/mapbox/streets-v11", // Map style
      center: [-74.5, 40], // Initial position [longitude, latitude]
      zoom: 9, // Initial zoom level
    });

    // Add zoom and rotation controls to the map
    map.addControl(new mapboxgl.NavigationControl());
  }, []);

  return (
    <div className="map-container">
      <div id="map" style={{ width: "100%", height: "500px" }}></div>
    </div>
  );
}

export default Map;
