import { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebase';

function ChatroomList({ currentRoom, onRoomChange }) {
  const [rooms, setRooms] = useState(['general']);
  const [showNewRoomForm, setShowNewRoomForm] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const q = query(collection(db, 'chatrooms'));
        const snapshot = await getDocs(q);
        
        const roomsList = [];
        snapshot.forEach(doc => {
          roomsList.push(doc.id);
        });
        
        if (roomsList.length > 0) {
          setRooms(roomsList);
        }
      } catch (error) {
        console.error("Error fetching rooms: ", error);
      }
    };
    
    fetchRooms();
  }, []);
  
  const createNewRoom = async (e) => {
    e.preventDefault();
    
    if (!newRoomName.trim()) return;
    if (!auth.currentUser) {
      alert('Please sign in to create a new chat room');
      return;
    }
    
    try {
      // Create room document
      const roomNameFormatted = newRoomName.toLowerCase().replace(/\s+/g, '-');
      
      // Add a welcome message to the new room
      await addDoc(collection(db, `chatrooms/${roomNameFormatted}/messages`), {
        text: `Welcome to the ${newRoomName} chat room!`,
        createdAt: serverTimestamp(),
        uid: 'system',
        displayName: 'System',
        photoURL: 'https://api.dicebear.com/6.x/bottts/svg?seed=system'
      });
      
      // Update the rooms list
      setRooms(prev => [...prev, roomNameFormatted]);
      
      // Switch to the new room
      onRoomChange(roomNameFormatted);
      
      // Reset the form
      setNewRoomName('');
      setShowNewRoomForm(false);
    } catch (error) {
      console.error("Error creating room: ", error);
    }
  };
  
  return (
    <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Chat Rooms</h2>
      
      <div className="flex-1 overflow-y-auto">
        <ul>
          {rooms.map(room => (
            <li 
              key={room}
              className={`p-2 mb-1 rounded cursor-pointer hover:bg-gray-700 ${
                currentRoom === room ? 'bg-indigo-700' : ''
              }`}
              onClick={() => onRoomChange(room)}
            >
              # {room}
            </li>
          ))}
        </ul>
      </div>
      
      {showNewRoomForm ? (
        <form onSubmit={createNewRoom} className="mt-4">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Room name"
            className="w-full p-2 rounded bg-gray-700 text-white mb-2"
          />
          <div className="flex space-x-2">
            <button 
              type="submit"
              className="flex-1 bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700"
            >
              Create
            </button>
            <button 
              type="button"
              onClick={() => setShowNewRoomForm(false)}
              className="flex-1 bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button 
          onClick={() => setShowNewRoomForm(true)}
          className="w-full bg-indigo-600 text-white p-2 rounded mt-4 hover:bg-indigo-700"
        >
          + New Room
        </button>
      )}
    </div>
  );
}

export default ChatroomList;