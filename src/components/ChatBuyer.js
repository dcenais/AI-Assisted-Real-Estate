import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Box, Typography, List, ListItem, ListItemText, TextField, Button, Paper } from '@mui/material';

const ChatBuyer = () => {
  const { user } = useUser();
  const [buyers, setBuyers] = useState([]);
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');

  // Fetch buyers who contacted this seller
  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/chats/seller?seller_email=${user.email}`)
      .then(res => res.json())
      .then(data => setBuyers(data.buyers || []));
  }, [user.email]);

  // Fetch messages with selected buyer
  useEffect(() => {
    if (selectedBuyer) {
      fetch(`http://127.0.0.1:5000/api/chat/messages?buyer_email=${selectedBuyer}&seller_email=${user.email}`)
        .then(res => res.json())
        .then(data => setMessages(data.messages || []));
    }
  }, [selectedBuyer, user.email]);

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedBuyer) return;
    await fetch('http://127.0.0.1:5000/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyer_email: selectedBuyer,
        seller_email: user.email,
        sender: 'seller',
        message: newMsg,
      }),
    });
    setNewMsg('');
    // Refresh messages
    fetch(`http://127.0.0.1:5000/api/chat/messages?buyer_email=${selectedBuyer}&seller_email=${user.email}`)
      .then(res => res.json())
      .then(data => setMessages(data.messages || []));
  };

  return (
    <Box sx={{ display: 'flex', height: '80vh', mt: 4 }}>
      <Paper sx={{ width: 250, mr: 2, p: 2 }}>
        <Typography variant="h6">Buyers</Typography>
        <List>
          {buyers.map(buyer => (
            <ListItem button key={buyer} selected={selectedBuyer === buyer} onClick={() => setSelectedBuyer(buyer)}>
              <ListItemText primary={buyer} />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6">Chat</Typography>
        <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
          {messages.map((msg, idx) => (
            <Box key={idx} sx={{ textAlign: msg.sender === 'seller' ? 'right' : 'left', mb: 1 }}>
              <Typography variant="body2" color={msg.sender === 'seller' ? 'primary' : 'secondary'}>
                {msg.message}
              </Typography>
            </Box>
          ))}
        </Box>
        {selectedBuyer && (
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

export default ChatBuyer;