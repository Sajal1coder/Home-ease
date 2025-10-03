import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  AttachFile, 
  Search,
  MoreVert,
  ArrowBack
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import API_BASE_URL from '../config';
import '../styles/MessagingPage.scss';
import LazyImage from '../components/LazyImage';

const MessagingPage = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Initialize socket connection
    socketRef.current = io(API_BASE_URL, {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      socketRef.current.emit('get-online-users');
    });

    socketRef.current.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    socketRef.current.on('user-online', (userId) => {
      setOnlineUsers(prev => [...prev, userId]);
    });

    socketRef.current.on('user-offline', (userId) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    socketRef.current.on('new-message', ({ conversationId, message }) => {
      if (selectedConversation?._id === conversationId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
        
        // Mark as read
        markAsRead(conversationId);
      }
      
      // Update conversation list
      fetchConversations();
    });

    socketRef.current.on('user-typing', ({ conversationId, userId }) => {
      if (selectedConversation?._id === conversationId && userId !== user._id) {
        setIsTyping(true);
      }
    });

    socketRef.current.on('user-stopped-typing', ({ conversationId }) => {
      if (selectedConversation?._id === conversationId) {
        setIsTyping(false);
      }
    });

    socketRef.current.on('messages-read', ({ messageIds }) => {
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg._id) ? { ...msg, read: true } : msg
      ));
    });

    fetchConversations();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, token, navigate]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      socketRef.current?.emit('join-conversation', selectedConversation._id);
      markAsRead(selectedConversation._id);
    }

    return () => {
      if (selectedConversation) {
        socketRef.current?.emit('leave-conversation', selectedConversation._id);
      }
    };
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/messages/conversations`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/messages/conversation/${conversationId}/messages`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const tempId = Date.now().toString();
    const tempMessage = {
      _id: tempId,
      content: messageInput,
      sender: user,
      createdAt: new Date(),
      tempId
    };

    // Optimistic update
    setMessages(prev => [...prev, tempMessage]);
    setMessageInput('');
    scrollToBottom();

    try {
      const response = await fetch(
        `${API_BASE_URL}/messages/conversation/${selectedConversation._id}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: messageInput })
        }
      );

      if (response.ok) {
        const savedMessage = await response.json();
        
        // Replace temp message with real message
        setMessages(prev => prev.map(msg => 
          msg.tempId === tempId ? savedMessage : msg
        ));

        // Emit via socket
        socketRef.current?.emit('send-message', {
          conversationId: selectedConversation._id,
          message: savedMessage
        });

        // Update conversations list
        fetchConversations();
      } else {
        // Remove temp message on error
        setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
      toast.error('Failed to send message');
    }
  };

  const handleTyping = () => {
    if (selectedConversation && socketRef.current) {
      socketRef.current.emit('typing-start', {
        conversationId: selectedConversation._id
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing-stop', {
          conversationId: selectedConversation._id
        });
      }, 2000);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await fetch(
        `${API_BASE_URL}/messages/conversation/${conversationId}/read`,
        {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.otherParticipant?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return <div className="messaging-loading">Loading messages...</div>;
  }

  return (
    <div className="messaging-page">
      {/* Conversations List */}
      <div className={`conversations-sidebar ${selectedConversation ? 'mobile-hidden' : ''}`}>
        <div className="sidebar-header">
          <h2>Messages</h2>
          <div className="search-box">
            <Search />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="conversations-list">
          {filteredConversations.length === 0 ? (
            <div className="no-conversations">
              <p>No conversations yet</p>
              <button onClick={() => navigate('/')}>Start exploring properties</button>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv._id}
                className={`conversation-item ${selectedConversation?._id === conv._id ? 'active' : ''}`}
                onClick={() => setSelectedConversation(conv)}
              >
                <div className="conversation-avatar-wrapper">
                  <LazyImage
                    src={conv.otherParticipant?.profileImagePath 
                      ? `${API_BASE_URL}/${conv.otherParticipant.profileImagePath.replace("public", "")}`
                      : "/assets/default-avatar.png"}
                    alt={conv.otherParticipant?.firstName}
                    className="conversation-avatar"
                  />
                  {isUserOnline(conv.otherParticipant?._id) && (
                    <span className="online-indicator"></span>
                  )}
                </div>

                <div className="conversation-info">
                  <div className="conversation-header">
                    <h4>{conv.otherParticipant?.firstName} {conv.otherParticipant?.lastName}</h4>
                    <span className="message-time">
                      {conv.lastMessage?.timestamp && formatTime(conv.lastMessage.timestamp)}
                    </span>
                  </div>
                  <p className="last-message">
                    {conv.listing?.title && <span className="property-name">{conv.listing.title} · </span>}
                    {conv.lastMessage?.content || 'No messages yet'}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="unread-badge">{conv.unreadCount}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`chat-area ${selectedConversation ? 'active' : ''}`}>
        {selectedConversation ? (
          <>
            <div className="chat-header">
              <button 
                className="back-btn mobile-only"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowBack />
              </button>

              <div className="chat-header-info">
                <div className="avatar-wrapper">
                  <LazyImage
                    src={selectedConversation.otherParticipant?.profileImagePath 
                      ? `${API_BASE_URL}/${selectedConversation.otherParticipant.profileImagePath.replace("public", "")}`
                      : "/assets/default-avatar.png"}
                    alt={selectedConversation.otherParticipant?.firstName}
                    className="chat-avatar"
                  />
                  {isUserOnline(selectedConversation.otherParticipant?._id) && (
                    <span className="online-indicator"></span>
                  )}
                </div>
                <div>
                  <h3>{selectedConversation.otherParticipant?.firstName} {selectedConversation.otherParticipant?.lastName}</h3>
                  <p className="status-text">
                    {isUserOnline(selectedConversation.otherParticipant?._id) ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>

              <button className="more-btn">
                <MoreVert />
              </button>
            </div>

            {selectedConversation.listing && (
              <div className="property-banner">
                <LazyImage
                  src={`${API_BASE_URL}/${selectedConversation.listing.listingPhotoPaths?.[0]?.replace("public", "")}`}
                  alt={selectedConversation.listing.title}
                  className="property-thumb"
                />
                <div className="property-info">
                  <h4>{selectedConversation.listing.title}</h4>
                  <p>{selectedConversation.listing.city}</p>
                </div>
                <button onClick={() => navigate(`/properties/${selectedConversation.listing._id}`)}>
                  View Property
                </button>
              </div>
            )}

            <div className="messages-container">
              {messages.map((message, index) => {
                const isOwnMessage = message.sender._id === user._id;
                const showAvatar = index === 0 || messages[index - 1].sender._id !== message.sender._id;

                return (
                  <div 
                    key={message._id}
                    className={`message ${isOwnMessage ? 'own-message' : 'other-message'}`}
                  >
                    {!isOwnMessage && showAvatar && (
                      <LazyImage
                        src={message.sender.profileImagePath 
                          ? `${API_BASE_URL}/${message.sender.profileImagePath.replace("public", "")}`
                          : "/assets/default-avatar.png"}
                        alt={message.sender.firstName}
                        className="message-avatar"
                      />
                    )}
                    <div className="message-content">
                      <p>{message.content}</p>
                      <span className="message-timestamp">
                        {formatTime(message.createdAt)}
                        {isOwnMessage && message.read && ' · Read'}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <button className="attach-btn">
                <AttachFile />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  handleTyping();
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button 
                className="send-btn"
                onClick={sendMessage}
                disabled={!messageInput.trim()}
              >
                <Send />
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <h3>Select a conversation to start messaging</h3>
            <p>Choose from your existing conversations or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;
