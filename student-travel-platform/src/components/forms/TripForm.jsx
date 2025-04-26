import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import PropTypes from "prop-types";

function TripForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    destination: "",
    startDate: "",
    endDate: "",
    tripType: "",
    budget: "",
    maxParticipants: 2, // Default value
    // Default trip icon - no need for user to upload
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/unitribe-b04e1.appspot.com/o/default-icons%2Ftravel-icon.png?alt=media&token=trip-icon-12345",
    latitude: "",
    longitude: ""
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
      if (cleanValue.includes('S')) {
        // South latitude should be negative
        return -parseFloat(cleanValue.replace('S', '').trim());
      } else if (cleanValue.includes('N')) {
        // North latitude should be positive
        return parseFloat(cleanValue.replace('N', '').trim());
      }
    } 
    // For longitude (E/W)
    else if (type === "lng") {
      if (cleanValue.includes('W')) {
        // West longitude should be negative
        return -parseFloat(cleanValue.replace('W', '').trim());
      } else if (cleanValue.includes('E')) {
        // East longitude should be positive
        return parseFloat(cleanValue.replace('E', '').trim());
      }
    }
    
    // If no direction specified, just return the parsed float
    return parseFloat(cleanValue);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
      if (!formData.title || !formData.description || !formData.destination || !formData.startDate || !formData.latitude || !formData.longitude) {
        throw new Error("Please fill all required fields");
      }

      if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
        throw new Error("End date must be after start date");
      }

      // Validate latitude and longitude as numbers
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      
      if (isNaN(lat) || isNaN(lng)) {
        throw new Error("Latitude and longitude must be valid numbers");
      }
      
      if (lat < -90 || lat > 90) {
        throw new Error("Latitude must be between -90 and 90 degrees");
      }
      
      if (lng < -180 || lng > 180) {
        throw new Error("Longitude must be between -180 and 180 degrees");
      }

      // Create timestamp for creation date
      const tripData = {
        name: formData.title, // Save title as name for consistency
        description: formData.description,
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        tripType: formData.tripType,
        imageUrl: formData.imageUrl,
        // Create location object structure for map compatibility
        location: {
          lat: parseCoordinate(formData.latitude, "lat"),
          lng: parseCoordinate(formData.longitude, "lng")
        },
        // Keep original latitude/longitude for backward compatibility
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        createdAt: new Date(),
        participants: 1, // Creator is the first participant
        status: "Active",
        maxParticipants: parseInt(formData.maxParticipants) || 2,
        budget: formData.budget ? parseFloat(formData.budget) : null,
      };

      // Add trip to Firestore
      const tripRef = await addDoc(collection(db, "trips"), tripData);
      
      // Call the success callback with the new trip data
      onSuccess({ id: tripRef.id, ...tripData });
      
    } catch (error) {
      console.error("Error adding trip:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const tripTypes = [
    "Weekend Trip",
    "Spring Break",
    "Summer Vacation",
    "Study Abroad",
    "Conference",
    "Field Trip",
    "Other"
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">Create New Trip</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-gray-700 font-medium mb-1">
            Trip Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-700 font-medium mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="3"
            required
          />
        </div>

        <div>
          <label htmlFor="destination" className="block text-gray-700 font-medium mb-1">
            Destination <span className="text-red-500">*</span>
          </label>
          <input
            id="destination"
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-gray-700 font-medium mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              id="startDate"
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-gray-700 font-medium mb-1">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="tripType" className="block text-gray-700 font-medium mb-1">
              Trip Type
            </label>
            <select
              id="tripType"
              name="tripType"
              value={formData.tripType}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a type</option>
              {tripTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="budget" className="block text-gray-700 font-medium mb-1">
              Estimated Budget
            </label>
            <input
              id="budget"
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="$ Amount"
            />
          </div>
        </div>

        {/* Maximum Participants field */}
        <div>
          <label htmlFor="maxParticipants" className="block text-gray-700 font-medium mb-1">
            Maximum Participants
          </label>
          <input
            id="maxParticipants"
            type="number"
            name="maxParticipants"
            value={formData.maxParticipants}
            onChange={handleChange}
            min="1"
            max="100"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Location fields - improved UI with helpful text */}
        <div>
          <h3 className="text-gray-700 font-medium mb-1">
            Location Coordinates <span className="text-red-500">*</span>
            <span className="ml-2 text-sm font-normal text-gray-500">(Required for map display)</span>
          </h3>
          
          <div className="mb-2 text-sm text-gray-600">
            <p>You can find coordinates by:</p>
            <ol className="list-decimal ml-5 mt-1">
              <li>Going to Google Maps</li>
              <li>Right-clicking your destination</li>
              <li>Selecting "What's here?"</li>
              <li>Copying the numbers that appear</li>
            </ol>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-gray-700 font-medium mb-1">
                Latitude <span className="text-red-500">*</span>
              </label>
              <input
                id="latitude"
                type="text"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="e.g. 37.7749°N"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-gray-700 font-medium mb-1">
                Longitude <span className="text-red-500">*</span>
              </label>
              <input
                id="longitude"
                type="text"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="e.g. -122.4194°W"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Default trip icon notice */}
        <div className="bg-blue-50 p-3 rounded border border-blue-100">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Note:</span> A default trip icon will be automatically used for this trip.
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
            {isLoading ? "Creating..." : "Create Trip"}
          </button>
        </div>
      </form>
    </div>
  );
}

// Define PropTypes for component props validation
TripForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired
};

export default TripForm;