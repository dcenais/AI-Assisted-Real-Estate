import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Badge } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: 1, sender: 'bot', text: 'Hello! How can I assist you today?' }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) setUnread(0);
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnread(0);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { id: Date.now(), sender: 'user', text: input.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: input.trim() }),
      });

      const data = await response.json();

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, sender: 'bot', text: data.answer || "Sorry, I couldn't generate a response." },
        ]);
        setIsTyping(false);
        if (!isOpen) setUnread((u) => u + 1);
      }, 1000); // Typing delay simulation
    } catch (error) {
      console.error('Error getting response from bot:', error);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button onClick={toggleChat} className="chatbot-fab">
        <Badge badgeContent={unread} color="error">
          <ChatIcon style={{ color: '#fff', fontSize: 32 }} />
        </Badge>
      </button>
      {isOpen && (
        <div className="chatbot-window">
          <div className="chat-header">
            <span>AI Chat</span>
            <button onClick={toggleChat} className="close-chat">✕</button>
          </div>
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                <p>{msg.text}</p>
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <p>Typing...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="message-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
      <style>{`
          .chatbot-fab {
          position: fixed;
          bottom: 32px;
          right: 32px;
          background: #1565c0;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          box-shadow: 0 4px 16px rgba(21,101,192,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2000;
          transition: background 0.2s;
        }
        .chatbot-fab:hover {
          background: #0d47a1;
        }
        .chatbot-window {
          position: fixed;
          bottom: 110px;
          right: 32px;
          width: 350px;
          max-height: 500px;
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(21,101,192,0.18);
          display: flex;
          flex-direction: column;
          z-index: 2100;
          overflow: hidden;
        }
        .chat-header {
          background: #1565c0;
          color: #fff;
          padding: 14px 18px;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .close-chat {
          background: none;
          border: none;
          font-size: 18px;
          color: #fff;
          cursor: pointer;
        }
        .chat-messages {
          overflow-y: auto;
          flex-grow: 1;
          padding: 16px;
          background: #f5faff;
        }
        .message {
          margin-bottom: 12px;
          padding: 10px 16px;
          border-radius: 18px;
          max-width: 80%;
          font-size: 1rem;
          word-break: break-word;
        }
        .user-message {
          background: #1565c0;
          color: #fff;
          align-self: flex-end;
          border-top-left-radius: 0;
        }
        .bot-message {
          background: #e3f2fd;
          color: #1565c0;
          align-self: flex-start;
          border-top-right-radius: 0;
        }
        .typing-indicator {
          color: #888;
          font-size: 14px;
          margin-bottom: 8px;
        }
        .message-input {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background: #f5faff;
          border-top: 1px solid #e3f2fd;
        }
        .message-input textarea {
          width: 80%;
          padding: 10px;
          border-radius: 20px;
          border: 1px solid #90caf9;
          resize: none;
          font-size: 1rem;
          outline: none;
          background: #fff;
          color: #1565c0;
        }
        .message-input button {
          background: #1565c0;
          color: #fff;
          border: none;
          border-radius: 50%;
          padding: 10px 15px;
          cursor: pointer;
          margin-left: 10px;
          font-weight: bold;
          font-size: 1rem;
          transition: background 0.2s;
        }
        .message-input button:hover {
          background: #0d47a1;
        }
      `}</style>
    </>
  );
};

export default Chatbot;
