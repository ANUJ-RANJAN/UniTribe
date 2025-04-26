import { auth } from '../../firebase';

function ChatMessage({ message }) {
  const { text, uid, displayName, photoURL, createdAt } = message;
  const messageClass = uid === auth.currentUser?.uid ? 'sent' : 'received';
  
  // Format timestamp if available
  const formattedTime = createdAt ? new Date(createdAt.toDate()).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  }) : '';
  
  return (
    <div className={`flex mb-4 ${messageClass === 'sent' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[70%] ${messageClass === 'sent' ? 'flex-row-reverse' : ''}`}>
        <img 
          src={photoURL} 
          alt={displayName} 
          className="w-8 h-8 rounded-full mx-2 self-end"
        />
        
        <div className={`px-4 py-2 rounded-lg ${
          messageClass === 'sent' 
            ? 'bg-indigo-600 text-white rounded-tr-none' 
            : 'bg-gray-200 text-gray-800 rounded-tl-none'
        }`}>
          <div className="text-xs opacity-75 mb-1">
            {displayName} {formattedTime && `• ${formattedTime}`}
          </div>
          <p>{text}</p>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;