import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

function EventForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: { 
      lat: "", 
      lng: "",
      address: "" 
    },
    date: "",
    time: "",
    category: "",
    // Default event icon - no need for user to upload
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/unitribe-b04e1.appspot.com/o/default-icons%2Fevent-icon.png?alt=media&token=event-icon-12345",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Parse coordinates with directional indicators
  const parseCoordinate = (value, type) => {
    if (!value) return "";
    
    // Remove degree symbols and extra spaces
    const cleanValue = value.replace(/°/g, '').trim();
    
    // For latitude (N/S)
    if (type === "lat") {
      if (cleanValue.toUpperCase().includes('N')) {
        // North is positive
        return parseFloat(cleanValue.replace(/[NS]/gi, '').trim());
      } else if (cleanValue.toUpperCase().includes('S')) {
        // South is negative
        return -parseFloat(cleanValue.replace(/[NS]/gi, '').trim());
      } else {
        // Assume it's just a number
        return parseFloat(cleanValue) || "";
      }
    }
    
    // For longitude (E/W)
    if (type === "lng") {
      if (cleanValue.toUpperCase().includes('E')) {
        // East is positive
        return parseFloat(cleanValue.replace(/[EW]/gi, '').trim());
      } else if (cleanValue.toUpperCase().includes('W')) {
        // West is negative
        return -parseFloat(cleanValue.replace(/[EW]/gi, '').trim());
      } else {
        // Assume it's just a number
        return parseFloat(cleanValue) || "";
      }
    }
    
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "lat" || name === "lng") {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [name]: value, // Store the raw input value
        },
      });
    } else if (name === "address") {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          address: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log("Starting form submission");
      
      // Validate form data
      if (!formData.name || !formData.description || !formData.date || !formData.category) {
        throw new Error("Please fill all required fields");
      }

      if (!formData.location.lat || !formData.location.lng) {
        throw new Error("Please provide both latitude and longitude");
      }

      // Parse coordinates before submission
      const parsedLat = parseCoordinate(formData.location.lat, "lat");
      const parsedLng = parseCoordinate(formData.location.lng, "lng");
      
      if (isNaN(parsedLat) || isNaN(parsedLng)) {
        throw new Error("Invalid coordinates format. Please enter valid latitude and longitude values.");
      }

      // Create timestamp for creation date
      const eventData = {
        ...formData,
        location: {
          ...formData.location,
          lat: parsedLat,
          lng: parsedLng
        },
        createdAt: new Date(),
        attendees: 0,
      };

      console.log("Saving event data to Firestore:", eventData);
      // Add event to Firestore
      const eventRef = await addDoc(collection(db, "events"), eventData);
      console.log("Event added with ID:", eventRef.id);
      
      // Call the success callback with the new event data
      onSuccess({ id: eventRef.id, ...eventData });
      
    } catch (error) {
      console.error("Error adding event:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const categories = [
    "Workshop",
    "Conference",
    "Meetup",
    "Hackathon",
    "Party",
    "Concert",
    "Festival",
    "Sport",
    "Networking",
    "Other"
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-purple-700">Create New Event</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Event Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="3"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Address
          </label>
          <input
            type="text"
            name="address"
            value={formData.location.address}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="e.g. Student Union Building"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Latitude <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lat"
              value={formData.location.lat}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. 48.8566° N or -48.8566"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Format: 48.8566° N or 48.8566 or -48.8566 (for South)</p>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Longitude <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lng"
              value={formData.location.lng}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. 2.3522° E or -2.3522"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Format: 2.3522° E or 2.3522 or -2.3522 (for West)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Time
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* The image upload section has been removed */}
        
        {/* Default event icon notice */}
        <div className="bg-purple-50 p-3 rounded border border-purple-100">
          <p className="text-sm text-purple-800">
            <span className="font-medium">Note:</span> A default event icon will be automatically used for this event.
          </p>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors shadow"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EventForm;