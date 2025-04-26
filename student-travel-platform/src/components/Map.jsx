import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// Use your specific Mapbox token
const MAPBOX_TOKEN = "pk.eyJ1IjoiYW51anJhbmphbmFyIiwiYSI6ImNtOXdicXVuZzB1YTgyaW13MDB4OWIyb3YifQ._jLzZwYAUIVDWD2om7QZ5w";
mapboxgl.accessToken = MAPBOX_TOKEN;

let mapRef = null;
let leafletMapRef = null;
let markers = [];
let leafletMarkers = [];
let userMarkers = [];
let leafletUserMarkers = [];

// Function to fetch users interested in a specific trip/event
export async function fetchInterestedUsers(itemId, itemType) {
  try {
    // Query the 'interests' collection to find users interested in this trip/event
    const interestsRef = collection(db, "interests");
    const q = query(interestsRef, where("itemId", "==", itemId), where("itemType", "==", itemType));
    const interestsSnapshot = await getDocs(q);
    
    const userPromises = interestsSnapshot.docs.map(async (interest) => {
      const userId = interest.data().userId;
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (userDoc.exists()) {
        return {
          id: userId,
          ...userDoc.data(),
          location: userDoc.data().currentLocation || null
        };
      }
      return null;
    });
    
    const users = await Promise.all(userPromises);
    return users.filter(user => user !== null && user.location);
  } catch (error) {
    console.error("Error fetching interested users:", error);
    return [];
  }
}

// Function to handle direct chat with a user
export function startChatWithUser(userId, userName) {
  // Store the user ID and name we want to chat with
  sessionStorage.setItem('chatWithUserId', userId);
  sessionStorage.setItem('chatWithUserName', userName || 'User');
  
  // Navigate to chat page
  window.location.href = '/chat';
}

// Function to add trip marker
export function addTripMarker(name, lat, lng, id, type = "trip") {
  // Try to add marker to Mapbox map first
  if (mapRef) {
    try {
      // Clear existing markers
      markers.forEach(marker => marker.remove());
      markers = [];

      const el = document.createElement("div");
      el.innerHTML = type === "trip" ? "🎒" : "📅";
      el.style.fontSize = "24px";
      el.style.cursor = "pointer";

      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <strong>${name}</strong>
          <br>
          <button id="show-interested-users" class="text-blue-500 underline">Show interested users</button>
        `))
        .addTo(mapRef);

      // Add custom data to marker element
      el.dataset.id = id;
      el.dataset.type = type;
      
      // Add click event to show interested users
      el.addEventListener('click', async () => {
        const popup = marker.getPopup();
        popup.on('open', () => {
          const showUsersBtn = document.getElementById('show-interested-users');
          if (showUsersBtn) {
            showUsersBtn.addEventListener('click', async () => {
              showInterestedUsers(id, type);
            });
          }
        });
        marker.togglePopup();
      });

      markers.push(marker);

      // Fly to the marker location
      mapRef.flyTo({
        center: [lng, lat],
        zoom: 10,
        essential: true
      });
      return;
    } catch (error) {
      console.error("Error adding Mapbox marker:", error);
    }
  }
  
  // Fallback to Leaflet if Mapbox failed
  if (leafletMapRef) {
    try {
      // Clear existing Leaflet markers
      leafletMarkers.forEach(marker => leafletMapRef.removeLayer(marker));
      leafletMarkers = [];
      
      const marker = L.marker([lat, lng])
        .addTo(leafletMapRef)
        .bindPopup(`
          <strong>${name}</strong>
          <br>
          <button id="leaflet-show-users" class="text-blue-500 underline">Show interested users</button>
        `);
      
      marker.itemId = id;
      marker.itemType = type;
      
      marker.on('popupopen', () => {
        const showUsersBtn = document.getElementById('leaflet-show-users');
        if (showUsersBtn) {
          showUsersBtn.addEventListener('click', () => {
            showInterestedUsers(id, type);
          });
        }
      });
      
      leafletMarkers.push(marker);
      
      // Pan to the marker
      leafletMapRef.setView([lat, lng], 10);
    } catch (error) {
      console.error("Error adding Leaflet marker:", error);
    }
  }
}

// Function to show interested users on the map
export async function showInterestedUsers(itemId, itemType) {
  try {
    // Clear existing user markers
    clearUserMarkers();
    
    // Get all interested users, including those without location data
    const interestsRef = collection(db, "interests");
    const q = query(interestsRef, where("itemId", "==", itemId), where("itemType", "==", itemType));
    const interestsSnapshot = await getDocs(q);
    
    if (interestsSnapshot.empty) {
      alert("No users are interested in this item yet");
      return;
    }
    
    // Get all users who have expressed interest
    const userPromises = interestsSnapshot.docs.map(async (interest) => {
      const userId = interest.data().userId;
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        
        if (userDoc.exists()) {
          return {
            id: userId,
            ...userDoc.data()
          };
        }
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
      }
      return null;
    });
    
    const allUsers = (await Promise.all(userPromises)).filter(user => user !== null);
    
    // Filter users who have location data
    const usersWithLocation = allUsers.filter(user => 
      user.currentLocation && 
      user.currentLocation.lat && 
      user.currentLocation.lng
    );
    
    if (usersWithLocation.length === 0) {
      if (allUsers.length > 0) {
        alert(`${allUsers.length} user(s) are interested, but none have shared their location.`);
      } else {
        alert("No users are interested in this item yet");
      }
      return;
    }
    
    // Add markers for users with location data
    usersWithLocation.forEach(user => {
      const location = user.currentLocation;
      if (location && location.lat && location.lng) {
        // Use user.displayName if available, otherwise email or "User"
        const name = user.displayName || user.email || "User";
        addUserMarker(name, location.lat, location.lng, user.id, itemType);
      }
    });
    
    // Adjust map bounds to fit all markers
    if (mapRef && userMarkers.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      userMarkers.forEach(marker => {
        bounds.extend(marker.getLngLat());
      });
      markers.forEach(marker => {
        bounds.extend(marker.getLngLat());
      });
      mapRef.fitBounds(bounds, { padding: 50 });
    } else if (leafletMapRef && leafletUserMarkers.length > 0) {
      const bounds = L.latLngBounds();
      leafletUserMarkers.forEach(marker => {
        bounds.extend(marker.getLatLng());
      });
      leafletMarkers.forEach(marker => {
        bounds.extend(marker.getLatLng());
      });
      leafletMapRef.fitBounds(bounds, { padding: [50, 50] });
    }
    
    // Show notification in console instead of an alert
    console.log(`Showing ${usersWithLocation.length} interested user(s) on the map.`);
    // Remove the alert so we don't have duplicate popups
    
  } catch (error) {
    console.error("Error showing interested users:", error);
    alert("Failed to load interested users");
  }
}

// Function to add user marker
function addUserMarker(name, lat, lng, userId, itemType = "item") {
  if (mapRef) {
    try {
      // Create a custom element for the marker
      const el = document.createElement("div");
      
      // Create a more prominent user marker
      el.innerHTML = `
        <div style="position: relative;">
          <div style="font-size: 32px; text-shadow: 0px 0px 3px white;">👤</div>
          <div style="position: absolute; bottom: -5px; right: -5px; 
                      background-color: #4CAF50; color: white; 
                      border-radius: 50%; width: 20px; height: 20px;
                      display: flex; justify-content: center; align-items: center;
                      font-size: 14px; font-weight: bold; border: 2px solid white;">
            💬
          </div>
        </div>
      `;
      el.style.cursor = "pointer";
      
      // Add a tooltip that appears on hover
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
      }).setHTML(`<strong>${name}</strong><br/><span class="text-xs">Click to chat</span>`);

      // Create the actual marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="text-center">
                <strong class="text-lg">${name}</strong>
                <p class="text-xs text-gray-600 my-1">Interested in this ${itemType}</p>
                <button 
                  id="chat-with-user-${userId}" 
                  class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg mt-2 w-full"
                >
                  Start Chat
                </button>
              </div>
            `)
        );
        
      // Show tooltip on hover
      el.addEventListener('mouseenter', () => {
        popup.addTo(mapRef);
      });
      
      el.addEventListener('mouseleave', () => {
        popup.remove();
      });

      // Add click event both to element and popup button
      el.addEventListener('click', () => {
        marker.togglePopup();
      });
      
      // Add the marker to the map
      marker.addTo(mapRef);
      
      // Add event listener for the chat button in the popup
      marker.getPopup().on('open', () => {
        const chatBtn = document.getElementById(`chat-with-user-${userId}`);
        if (chatBtn) {
          chatBtn.addEventListener('click', () => {
            startChatWithUser(userId);
          });
        }
      });

      // Store the marker for later reference
      userMarkers.push(marker);
    } catch (error) {
      console.error("Error adding Mapbox user marker:", error);
    }
  } else if (leafletMapRef) {
    try {
      // For Leaflet, we can use a custom icon
      const userIcon = L.divIcon({
        html: `
          <div style="position: relative;">
            <div style="font-size: 32px; text-shadow: 0px 0px 3px white;">👤</div>
            <div style="position: absolute; bottom: -5px; right: -5px; 
                        background-color: #4CAF50; color: white; 
                        border-radius: 50%; width: 20px; height: 20px;
                        display: flex; justify-content: center; align-items: center;
                        font-size: 14px; font-weight: bold; border: 2px solid white;">
              💬
            </div>
          </div>
        `,
        className: 'user-marker-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });
      
      const marker = L.marker([lat, lng], { icon: userIcon })
        .addTo(leafletMapRef)
        .bindPopup(`
          <div class="text-center">
            <strong class="text-lg">${name}</strong>
            <p class="text-xs text-gray-600 my-1">Interested in this ${itemType || 'item'}</p>
            <button 
              id="leaflet-chat-${userId}" 
              class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg mt-2 w-full"
            >
              Start Chat
            </button>
          </div>
        `);
      
      // Add tooltip
      marker.bindTooltip(`<strong>${name}</strong><br/><span class="text-xs">Click to chat</span>`);
      
      marker.on('popupopen', () => {
        const chatBtn = document.getElementById(`leaflet-chat-${userId}`);
        if (chatBtn) {
          chatBtn.addEventListener('click', () => {
            startChatWithUser(userId);
          });
        }
      });
      
      leafletUserMarkers.push(marker);
    } catch (error) {
      console.error("Error adding Leaflet user marker:", error);
    }
  }
}

// Function to clear user markers
function clearUserMarkers() {
  if (mapRef) {
    userMarkers.forEach(marker => marker.remove());
    userMarkers = [];
  }
  
  if (leafletMapRef) {
    leafletUserMarkers.forEach(marker => leafletMapRef.removeLayer(marker));
    leafletUserMarkers = [];
  }
}

function MapComponent() {
  const mapContainerRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Try to initialize Mapbox first
    let mapboxFailed = false;
    
    try {
      if (mapboxgl.supported()) {
        console.log("Using Mapbox token starting with:", MAPBOX_TOKEN.substring(0, 8) + "...");
        
        mapRef = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/outdoors-v12",
          center: [77.209, 28.6139], // Delhi
          zoom: 4,
          attributionControl: true
        });

        mapRef.addControl(new mapboxgl.NavigationControl());

        mapRef.on('load', () => {
          console.log("Mapbox map loaded successfully");
          setMapLoaded(true);
        });

        mapRef.on('error', (e) => {
          console.error("Mapbox error:", e);
          mapboxFailed = true;
          setMapError(`Mapbox error: ${e.error?.message || 'Unknown error'}`);
          // Will trigger fallback to Leaflet below
          throw new Error("Mapbox failed to load");
        });
        
        // Return cleanup function for Mapbox
        return () => {
          if (mapRef) {
            markers.forEach(marker => marker.remove());
            markers = [];
            userMarkers.forEach(marker => marker.remove());
            userMarkers = [];
            mapRef.remove();
            mapRef = null;
          }
        };
      } else {
        mapboxFailed = true;
        console.warn("Mapbox GL not supported in this browser");
        throw new Error("Mapbox GL not supported");
      }
    } catch (error) {
      console.error("Error initializing Mapbox:", error);
      mapboxFailed = true;
      
      // Fallback to Leaflet if Mapbox failed
      try {
        console.log("Falling back to Leaflet with OpenStreetMap");
        setUsingFallback(true);
        
        // Need to wait for the next render cycle when usingFallback is set to true
        setTimeout(() => {
          if (!mapContainerRef.current) return;
          
          // Initialize Leaflet map
          leafletMapRef = L.map(mapContainerRef.current).setView([77.209, 28.6139], 4);
          
          // Add OpenStreetMap tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(leafletMapRef);
          
          setMapLoaded(true);
        }, 0);
        
        // Return cleanup function for Leaflet
        return () => {
          if (leafletMapRef) {
            leafletMarkers.forEach(marker => leafletMapRef.removeLayer(marker));
            leafletMarkers = [];
            leafletUserMarkers.forEach(marker => leafletMapRef.removeLayer(marker));
            leafletUserMarkers = [];
            leafletMapRef.remove();
            leafletMapRef = null;
          }
        };
      } catch (leafletError) {
        console.error("Error initializing Leaflet fallback:", leafletError);
        setMapError(`Failed to initialize maps: ${error.message}. Fallback also failed: ${leafletError.message}`);
      }
    }
  }, []);

  if (mapError && !usingFallback) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Map Error:</strong>
        <span className="block sm:inline"> {mapError}</span>
        <p className="mt-2">Attempting to use fallback map...</p>
      </div>
    );
  }

  return (
    <>
      <div 
        ref={mapContainerRef} 
        style={{ width: "100%", height: "500px" }} 
        className={usingFallback ? "leaflet-container" : ""}
      />
      {!mapLoaded && (
        <div className="text-center mt-2">
          <p>Loading map{usingFallback ? ' (using OpenStreetMap fallback)' : ''}...</p>
        </div>
      )}
      {usingFallback && mapLoaded && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-2" role="alert">
          <span className="block sm:inline">Using OpenStreetMap as a fallback because Mapbox encountered an error.</span>
        </div>
      )}
    </>
  );
}

export default MapComponent;