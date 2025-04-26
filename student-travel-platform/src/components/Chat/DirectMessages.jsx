import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import ChatMessage from './ChatMessage';
import NotificationService from '../Notifications/NotificationService';

function DirectMessages() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Check auth state initialization
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthInitialized(true);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Check for chat request from map interaction
  useEffect(() => {
    if (!authInitialized) return; // Wait for auth to be initialized
    
    const handleChatRequest = async () => {
      try {
        setLoading(true);
        const chatWithUserId = sessionStorage.getItem('chatWithUserId');
        const chatWithUserName = sessionStorage.getItem('chatWithUserName');
        
        if (chatWithUserId) {
          console.log("Found chat request:", { userId: chatWithUserId, name: chatWithUserName });
          
          // Clear the storage item to prevent repeated automatic conversation starts
          sessionStorage.removeItem('chatWithUserId');
          sessionStorage.removeItem('chatWithUserName');
          
          // Start a conversation with this user
          await startConversation(chatWithUserId, chatWithUserName);
        }
      } catch (err) {
        console.error("Error handling chat request:", err);
        setError("Failed to start conversation with selected user");
      } finally {
        setLoading(false);
      }
    };
    
    handleChatRequest();
  }, [authInitialized]);
  
  // Fetch conversations for current user
  useEffect(() => {
    if (!authInitialized) return; // Wait for auth to be initialized
    if (!auth.currentUser) return;
    
    setLoading(true);
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', auth.currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(conversationList);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations");
      setLoading(false);
    });
    
    return unsubscribe;
  }, [authInitialized]);
  
  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;
    
    setLoading(true);
    const q = query(
      collection(db, `conversations/${selectedConversation.id}/messages`),
      orderBy('createdAt')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messageList);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages");
      setLoading(false);
    });
    
    return unsubscribe;
  }, [selectedConversation]);
  
  // Fetch available users for starting new conversations
  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchTerm.trim() || !showUserSearch) return;
      
      try {
        setLoading(true);
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        
        const usersList = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(user => 
            user.id !== auth.currentUser?.uid && 
            (user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
             user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        
        setUsers(usersList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError("Failed to search for users");
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [searchTerm, showUserSearch]);
  
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    if (!authInitialized) {
      console.log("Auth not yet initialized");
      return;
    }
    if (!auth.currentUser) {
      alert('Please sign in to send messages');
      return;
    }
    
    try {
      const messageData = {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName || 'Anonymous',
        photoURL: auth.currentUser.photoURL || `https://api.dicebear.com/6.x/personas/svg?seed=${auth.currentUser.uid}`
      };
      
      await addDoc(collection(db, `conversations/${selectedConversation.id}/messages`), messageData);
      
      // Send notification to other participants
      selectedConversation.participants.forEach(participantId => {
        if (participantId !== auth.currentUser.uid) {
          NotificationService.createMessageNotification(
            participantId,
            auth.currentUser.displayName || 'Anonymous',
            newMessage,
            selectedConversation.id
          );
        }
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError("Failed to send message");
    }
  };
  
  const startConversation = async (userId, userName = null) => {
    if (!authInitialized) {
      console.log("Auth not yet initialized");
      // Instead of failing immediately, wait for auth to initialize
      let attempts = 0;
      const maxAttempts = 5;
      
      while (!auth.currentUser && attempts < maxAttempts) {
        console.log(`Waiting for auth to initialize (attempt ${attempts + 1}/${maxAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
        attempts++;
      }
      
      // If still not authenticated after waiting
      if (!auth.currentUser) {
        alert("Please sign in to start a conversation");
        return;
      }
    } else if (!auth.currentUser) {
      return;
    }
    
    console.log(`Starting conversation with user: ${userId}, name: ${userName || 'Unknown'}`);
    
    // Check if conversation already exists
    const existingConversation = conversations.find(conv => 
      conv.participants.includes(userId) && conv.participants.length === 2
    );
    
    if (existingConversation) {
      setSelectedConversation(existingConversation);
      setShowUserSearch(false);
      return;
    }
    
    try {
      setLoading(true);
      // Get user data from either 'users' collection or direct user document
      let userData = { displayName: userName || 'User' };
      
      try {
        // First try direct document lookup by ID
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          userData = userDoc.data();
        } else {
          // If not found, try looking up by uid field
          const userByUidSnapshot = await getDocs(query(collection(db, 'users'), where('uid', '==', userId)));
          if (!userByUidSnapshot.empty) {
            userData = userByUidSnapshot.docs[0].data();
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
      
      // Create new conversation
      const conversationData = {
        participants: [auth.currentUser.uid, userId],
        participantNames: {
          [auth.currentUser.uid]: auth.currentUser.displayName || auth.currentUser.email || 'Anonymous',
          [userId]: userData.displayName || userData.email || userName || 'User'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'conversations'), conversationData);
      
      // Welcome message
      await addDoc(collection(db, `conversations/${docRef.id}/messages`), {
        text: 'This is the beginning of your conversation.',
        createdAt: serverTimestamp(),
        uid: 'system',
        displayName: 'System',
        photoURL: 'https://api.dicebear.com/6.x/bottts/svg?seed=system'
      });
      
      const newConversation = {
        id: docRef.id,
        ...conversationData
      };
      
      setSelectedConversation(newConversation);
      setShowUserSearch(false);
      
      console.log("Created new conversation:", newConversation);
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError(`Failed to start conversation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const getConversationName = (conversation) => {
    if (!conversation || !auth.currentUser) return 'Conversation';
    
    const otherParticipants = conversation.participants.filter(id => id !== auth.currentUser.uid);
    
    if (otherParticipants.length === 0) return 'Conversation with yourself';
    
    return otherParticipants.map(id => conversation.participantNames[id] || 'User').join(', ');
  };
  
  return (
    <div className="flex h-[calc(100vh-150px)]">
      {/* Conversations sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Direct Messages</h2>
          <button
            onClick={() => setShowUserSearch(!showUserSearch)}
            className="text-gray-300 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-800 text-white p-2 rounded-md mb-3 text-sm">
            {error}
          </div>
        )}
        
        {showUserSearch && (
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
            
            {searchTerm && (
              <div className="mt-2 max-h-40 overflow-y-auto">
                {loading ? (
                  <p className="text-gray-400 text-sm">Searching...</p>
                ) : users.length > 0 ? (
                  <ul>
                    {users.map(user => (
                      <li
                        key={user.id}
                        onClick={() => startConversation(user.id, user.displayName)}
                        className="p-2 hover:bg-gray-700 cursor-pointer rounded flex items-center"
                      >
                        <img
                          src={user.photoURL || `https://api.dicebear.com/6.x/personas/svg?seed=${user.id}`}
                          alt={user.displayName || 'User'}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                        <span>{user.displayName || user.email || 'User'}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm">No users found</p>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto">
          {loading && !error && conversations.length === 0 ? (
            <div className="flex items-center justify-center h-20">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : conversations.length > 0 ? (
            <ul>
              {conversations.map(conv => (
                <li
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-2 mb-1 rounded cursor-pointer hover:bg-gray-700 ${
                    selectedConversation?.id === conv.id ? 'bg-indigo-700' : ''
                  }`}
                >
                  {getConversationName(conv)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">No conversations yet</p>
          )}
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
        {selectedConversation ? (
          <>
            <div className="p-4 bg-indigo-600 text-white font-medium">
              {getConversationName(selectedConversation)}
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-20">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : messages.length > 0 ? (
                messages.map(msg => (
                  <ChatMessage key={msg.id} message={msg} />
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Start a conversation
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
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            {loading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-3"></div>
                <p>Loading conversations...</p>
              </div>
            ) : (
              <p>Select a conversation or start a new one</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DirectMessages;