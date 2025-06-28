import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Switch, FormControlLabel, Card, CardContent, IconButton, InputAdornment } from '@mui/material';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const Profile = () => {
  const { user, switchRole } = useUser();
  const [role, setRole] = useState(user.role);
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: user.username,
    password: ''
  });

  // Toggle role between buyer and seller
  const handleRoleToggle = async () => {
    const newRole = role === 'buyer' ? 'seller' : 'buyer';
    setRole(newRole);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, role: newRole }),
      });
      if (response.ok) {
        switchRole(newRole);
        setMessage('Role updated!');
      } else {
        setMessage('Failed to update role');
      }
    } catch {
      setMessage('Failed to update role');
    }
  };

  // Handle edit form changes
  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };

  // Save profile changes (username/password)
  const handleSave = async () => {
    setMessage('');
    try {
      const response = await fetch('http://127.0.0.1:5000/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          username: editForm.username,
          password: editForm.password
        }),
      });
      if (response.ok) {
        setMessage('Profile updated!');
        setEditing(false);
      } else {
        setMessage('Failed to update profile');
      }
    } catch {
      setMessage('Failed to update profile');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <Card sx={{ width: 400, p: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" align="center" gutterBottom>Profile</Typography>
            {!editing && (
              <IconButton onClick={() => setEditing(true)} color="primary">
                <EditIcon />
              </IconButton>
            )}
          </Box>
          <TextField
            label="Username"
            name="username"
            value={editing ? editForm.username : user.username}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            InputProps={{
              readOnly: !editing,
              endAdornment: editing && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleSave}
                    color="primary"
                    edge="end"
                  >
                    <SaveIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => { setEditing(false); setEditForm({ username: user.username, password: '' }); }}
                    color="error"
                    edge="end"
                  >
                    <CancelIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          <TextField
            label="Email"
            value={user.email}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />
          {editing && (
            <TextField
              label="New Password"
              name="password"
              type="password"
              value={editForm.password}
              onChange={handleEditChange}
              fullWidth
              margin="normal"
              placeholder="Press Save Icon to update password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSave}
                      color="primary"
                      edge="end"
                    >
                      <SaveIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => { setEditing(false); setEditForm({ username: user.username, password: '' }); }}
                      color="error"
                      edge="end"
                    >
                      <CancelIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          )}
          {/* Only show switch for buyer/seller */}
          {user.role !== 'admin' && (
            <>
              <FormControlLabel
                control={
                  <Switch
                    checked={role === 'seller'}
                    onChange={handleRoleToggle}
                    color="primary"
                  />
                }
                label={role === 'seller' ? 'Seller' : 'Buyer'}
                sx={{ mt: 2 }}
              />
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 2 }}>
                Switch between Buyer and Seller to access different features. As a Seller, you can list and manage your properties. As a Buyer, you can browse and contact sellers.
              </Typography>
            </>
          )}
          {message && <Typography color="primary" sx={{ mt: 2 }}>{message}</Typography>}
          {role === 'buyer' && (
            <Button
              component={Link}
              to="/chat-seller"
              variant="contained"
              sx={{
                mt: 3,
                width: '100%',
                background: '#1565c0',
                color: '#fff',
                fontWeight: 'bold',
                letterSpacing: 1,
                '&:hover': { background: '#003c8f' }
              }}
            >
              Sellers You Have Contacted
            </Button>
          )}
          {role === 'seller' && (
            <Button
              component={Link}
              to="/chat-buyer"
              variant="contained"
              sx={{
                mt: 3,
                width: '100%',
                background: '#1565c0',
                color: '#fff',
                fontWeight: 'bold',
                letterSpacing: 1,
                '&:hover': { background: '#003c8f' }
              }}
            >
              Chat With Your Buyers
            </Button>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;