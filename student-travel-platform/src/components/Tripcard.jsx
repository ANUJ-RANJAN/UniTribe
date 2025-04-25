import React from "react";

function TripCard({ trip }) {
  return (
    <div className="bg-white text-black rounded-lg shadow-lg overflow-hidden p-4 max-w-xs">
      <img src={trip.imageUrl} alt={trip.name} className="w-full h-40 object-cover rounded-md" />
      <div className="pt-4 pb-2">
        <h3 className="font-bold text-xl">{trip.name}</h3>
        <p className="text-sm text-gray-600">{trip.description}</p>
      </div>
      <div className="text-center">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-2 hover:bg-blue-700 transition">
          Book Now
        </button>
      </div>
    </div>
  );
}

export default TripCard;
