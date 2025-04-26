import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import ChatMessage from '../../components/Chat/ChatMessage';
import ChatroomList from '../../components/Chat/ChatroomList';
import DirectMessages from '../../components/Chat/DirectMessages';

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentRoom, setCurrentRoom] = useState('general');
  const [chatMode, setChatMode] = useState('rooms'); // 'rooms' or 'direct'
  
  // Check if we're coming from a user marker on the map
  useEffect(() => {
    const chatWithUserId = sessionStorage.getItem('chatWithUserId');
    if (chatWithUserId) {
      // Switch to direct messages mode automatically
      setChatMode('direct');
    }
  }, []);
  
  useEffect(() => {
    // Only fetch messages if in 'rooms' mode
    if (chatMode !== 'rooms') return;
    
    // Query messages from Firestore
    const q = query(
      collection(db, `chatrooms/${currentRoom}/messages`),
      orderBy('createdAt')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messages);
    });
    
    return unsubscribe;
  }, [currentRoom, chatMode]);
  
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    if (!auth.currentUser) {
      alert('Please sign in to send messages');
      return;
    }
    
    try {
      await addDoc(collection(db, `chatrooms/${currentRoom}/messages`), {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || 'Anonymous',
        photoURL: auth.currentUser.photoURL || 'https://api.dicebear.com/6.x/personas/svg?seed=' + auth.currentUser.uid
      });
      
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };
  
  const changeRoom = (room) => {
    setCurrentRoom(room);
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-center space-x-4 p-2 bg-white rounded-lg shadow">
        <button 
          onClick={() => setChatMode('rooms')}
          className={`px-4 py-2 rounded-md ${
            chatMode === 'rooms' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Chat Rooms
        </button>
        <button 
          onClick={() => setChatMode('direct')}
          className={`px-4 py-2 rounded-md ${
            chatMode === 'direct' 
              ? 'bg-indigo-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Direct Messages
        </button>
      </div>
      
      {chatMode === 'rooms' ? (
        <div className="flex h-[calc(100vh-200px)]">
          <ChatroomList currentRoom={currentRoom} onRoomChange={changeRoom} />
          
          <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-indigo-600 text-white font-medium">
              #{currentRoom} Chat
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {messages.length > 0 ? (
                messages.map(msg => (
                  <ChatMessage key={msg.id} message={msg} />
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No messages yet in #{currentRoom}
                </div>
              )}
            </div>
            
            <form onSubmit={sendMessage} className="p-4 border-t">
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <DirectMessages />
      )}
    </div>
  );
}

export default Chat;