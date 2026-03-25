import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowLeft, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { API_BASE_URL, SOCKET_URL } from '../config/api';

const Chat = () => {
  const { matchId, chatId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [chatRoom, setChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);

  const messagesEndRef = useRef(null);

  // Lock body scroll while chat is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Scroll to bottom every time messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 1. Initialize Socket
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // 2. Fetch Chat data and Messages from API
    const initChat = async () => {
      try {
        let chatData;
        
        if (matchId) {
          // Get or Create Chat Room based on the match
          const chatRes = await axios.get(`${API_BASE_URL}/chats/match/${matchId}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          chatData = chatRes.data;
        } else if (chatId) {
          // Get existing chat metadata
          const chatRes = await axios.get(`${API_BASE_URL}/chats/${chatId}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          chatData = chatRes.data;
        }
        
        setChatRoom(chatData);

        // Fetch existing messages
        const msgRes = await axios.get(`${API_BASE_URL}/chats/${chatData._id}/messages`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        setMessages(msgRes.data);
        
        // Join the Socket.io room using the chatId
        newSocket.emit('join_room', chatData._id);

      } catch (err) {
        console.error('Chat error:', err);
        setError('Failed to load chat. You may not be authorized.');
      } finally {
        setLoading(false);
      }
    };

    if (user && (matchId || chatId)) {
      initChat();
    }

    // 3. Listen for incoming messages
    newSocket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Cleanup when component unmounts
    return () => {
      newSocket.off('receive_message');
      newSocket.disconnect();
    };
  }, [matchId, chatId, user]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatRoom) return;

    try {
      // Send to DB (Controller broadcasts via Socket.io)
      await axios.post(
        `${API_BASE_URL}/chats/${chatRoom._id}/messages`,
        { content: newMessage },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-4 rounded-full border-primary-200 border-t-primary-600 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-20 text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h2 className="mb-4 text-xl font-bold">{error}</h2>
        <button onClick={() => navigate(-1)} className="px-6 py-2 border btn-secondary rounded-xl border-slate-300">
          Go Back
        </button>
      </div>
    );
  }

  return createPortal(
    <div className="fixed top-16 left-0 right-0 bottom-0 z-50 bg-[var(--background)] overflow-hidden">
    <div className="flex flex-col h-full max-w-5xl px-4 py-6 mx-auto">

      {/* Single card — back arrow + messages + input */}
      <div className="flex flex-col flex-grow min-h-0 overflow-hidden glass-card">

        {/* Back arrow header inside card */}
        <div className="flex items-center gap-3 p-3 px-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2 transition rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h2 className="text-base font-bold leading-tight text-slate-900 dark:text-white">Claim Chat</h2>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex flex-col flex-grow min-h-0 gap-4 p-4 overflow-y-auto sm:p-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-grow text-slate-400">
              <div className="p-4 mb-3 rounded-full bg-slate-100 dark:bg-slate-800">
                <Send className="w-6 h-6" />
              </div>
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isMe = msg.sender._id === user._id || msg.sender === user._id;
              const senderName = msg.sender.name || 'User';
              return (
                <div
                  key={msg._id || index}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}
                >
                  {!isMe && <span className="text-[10px] text-slate-400 ml-2 mb-1">{senderName}</span>}
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl ${
                      isMe
                        ? 'bg-primary-600 text-white rounded-br-sm shadow-md shadow-primary-500/20'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    <p className="text-sm break-words sm:text-base">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 mx-2">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area inside same card */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-2 border-t sm:p-3 border-slate-200 dark:border-slate-700 shrink-0">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow px-4 py-3 text-sm border-none outline-none bg-slate-100 dark:bg-slate-800 rounded-xl sm:py-4 focus:ring-0 sm:text-base dark:placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="flex items-center justify-center p-3 text-white transition-colors shadow-md bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 sm:p-4 rounded-xl shrink-0"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>

      </div>
    </div>
    </div>,
    document.body
  );
};

export default Chat;
