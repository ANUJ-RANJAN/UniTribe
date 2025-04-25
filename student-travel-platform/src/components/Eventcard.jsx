function EventCard({ event }) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold">{event.name}</h3>
      <p>{event.location}</p>
      <p>{event.date}</p>
      <button className="bg-indigo-600 text-white py-2 px-4 rounded-lg mt-2">Join Event</button>
    </div>
  );
}

export default EventCard;
