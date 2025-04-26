import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";

function CommunityForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    rules: "",
    // Default community icon - no need for user to upload
    imageUrl: "https://firebasestorage.googleapis.com/v0/b/unitribe-b04e1.appspot.com/o/default-icons%2Fcommunity-icon.png?alt=media&token=community-icon-12345",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
      if (!formData.name || !formData.description || !formData.type) {
        throw new Error("Please fill all required fields");
      }

      // Create timestamp for creation date
      const communityData = {
        ...formData,
        createdAt: new Date(),
        members: 1, // Creator is the first member
        posts: 0,
      };

      // Add community to Firestore
      const communityRef = await addDoc(collection(db, "communities"), communityData);
      
      // Call the success callback with the new community data
      onSuccess({ id: communityRef.id, ...communityData });
      
    } catch (error) {
      console.error("Error adding community:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const communityTypes = [
    "Study Group",
    "Interest Group",
    "Student Organization",
    "Club",
    "Department",
    "Alumni Network",
    "Other"
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-2xl font-bold text-center mb-6 text-green-700">Create New Community</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Community Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="3"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Community Type <span className="text-red-500">*</span>
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Select a type</option>
            {communityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Community Rules
          </label>
          <textarea
            name="rules"
            value={formData.rules}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="3"
            placeholder="List any rules or guidelines for your community"
          />
        </div>

        {/* The image upload section has been removed */}
        
        {/* Default community icon notice */}
        <div className="bg-green-50 p-3 rounded border border-green-100">
          <p className="text-sm text-green-800">
            <span className="font-medium">Note:</span> A default community icon will be automatically used for this community.
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
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors shadow"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Community"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CommunityForm;