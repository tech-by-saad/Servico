import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getMessagesForBookingAPI } from '../api/chat';

const socket = io(import.meta.env.VITE_API_BASE_URL);

const ChatModal = ({ isOpen, onClose, booking }) => {
  const { user } = useAuth();
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      socket.emit('join_chat', booking._id);
      socket.on('receive_message', (data) => {
        setMessages((list) => [...list, data]);
      });

      const fetchHistory = async () => {
        try {
            const history = await getMessagesForBookingAPI(booking._id);
            setMessages(history);
        } catch (error) {
            toast.error("Could not load chat history.");
        }
      };
      fetchHistory();
    }
    return () => {
      socket.off('receive_message');
    };
  }, [isOpen, booking._id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (currentMessage.trim() !== '') {
      const messageData = {
        booking: booking._id,
        sender: user._id,
        content: currentMessage,
        createdAt: new Date().toISOString(),
      };
      await socket.emit('send_message', messageData);
      // We do NOT add the message locally here.
      // The 'receive_message' event will handle it for everyone, including the sender.
      setCurrentMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg h-[70vh] flex flex-col">
        <div className="flex-shrink-0 p-4 border-b bg-gray-50 rounded-t-lg">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      Chat with {user.role === 'provider' ? booking.customer.name : booking.provider.name}
                    </h2>
                    <p className="text-xs text-gray-500">Regarding: {booking.service.name}</p>
                </div>
                <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto bg-gray-100">
            {messages.map((msg, index) => (
                <div key={index} className={`flex mb-3 ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-2xl px-4 py-2 max-w-xs md:max-w-md ${msg.sender === user._id ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 text-right ${msg.sender === user._id ? 'text-blue-200' : 'text-gray-500'}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>

        <div className="flex-shrink-0 p-4 border-t bg-white rounded-b-lg">
            <div className="flex items-center gap-2">
                <input 
                    type="text" 
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type your message..."
                    className="flex-grow p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={sendMessage} className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/></svg>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;