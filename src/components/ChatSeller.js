import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Box, Typography, List, ListItem, ListItemText, TextField, Button, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const ChatSeller = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');

  // Fetch sellers this buyer has contacted
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/chats/buyer?buyer_email=${user.email}`)
      .then(res => res.json())
      .then(data => setSellers(data.sellers || []));
  }, [user.email]);

  // Parse seller from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sellerParam = params.get('seller');
    if (sellerParam && sellers.includes(sellerParam)) {
      setSelectedSeller(sellerParam);
    }
  }, [location.search, sellers]);

  // Fetch messages with selected seller
  useEffect(() => {
    if (selectedSeller) {
      fetch(`http://127.0.0.1:5000/api/chat/messages?buyer_email=${user.email}&seller_email=${selectedSeller}`)
        .then(res => res.json())
        .then(data => setMessages(data.messages || []));
    }
  }, [selectedSeller, user.email]);

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedSeller) return;
    await fetch('http://127.0.0.1:5000/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyer_email: user.email,
        seller_email: selectedSeller,
        sender: 'buyer',
        message: newMsg,
      }),
    });
    setNewMsg('');
    // Refresh messages
    fetch(`http://127.0.0.1:5000/api/chat/messages?buyer_email=${user.email}&seller_email=${selectedSeller}`)
      .then(res => res.json())
      .then(data => setMessages(data.messages || []));
  };

  const SELLER_EMAIL = "seller@example.com"; // hardcoded

  const handleContactSeller = async () => {
    await fetch('http://127.0.0.1:5000/api/contact-seller', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyer_email: user.email,
        seller_email: SELLER_EMAIL,
        message: "Hi, I'm interested in your property!"
      })
    });
    // Redirect to chat page with seller's email as query param
    navigate(`/chat-seller?seller=${SELLER_EMAIL}`);
  };

  return (
    <Box sx={{ display: 'flex', height: '80vh', mt: 4 }}>
      <Paper sx={{ width: 250, mr: 2, p: 2 }}>
        <Typography variant="h6">Sellers</Typography>
        <List>
          {sellers.map(seller => (
            <ListItem button key={seller} selected={selectedSeller === seller} onClick={() => setSelectedSeller(seller)}>
              <ListItemText primary={seller} />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6">Chat</Typography>
        <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
          {messages.map((msg, idx) => (
            <Box key={idx} sx={{ textAlign: msg.sender === 'buyer' ? 'right' : 'left', mb: 1 }}>
              <Typography variant="body2" color={msg.sender === 'buyer' ? 'primary' : 'secondary'}>
                {msg.message}
              </Typography>
            </Box>
          ))}
        </Box>
        {selectedSeller && (
          <Box sx={{ display: 'flex' }}>
            <TextField
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              fullWidth
              placeholder="Type a message..."
              size="small"
            />
            <Button onClick={handleSend} variant="contained" sx={{ ml: 1 }}>
              Send
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ChatSeller;