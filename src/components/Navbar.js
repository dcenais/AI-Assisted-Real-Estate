import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useUser } from '../contexts/UserContext';

const Navbar = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  return (
    <AppBar position="static" color="primary" elevation={2} sx={{ background: '#1565c0' }}>
      <Container maxWidth="lg" disableGutters>
        <Toolbar>
          {user && (
            <Typography variant="body1" sx={{ color: '#fff', mr: 2 }}>
              Hi, {user.username}
            </Typography>
          )}
          <Button color="inherit" component={Link} to="/">Home</Button>
          {!user && (
            <>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button color="inherit" component={Link} to="/contact">Contact</Button>
            </>
          )}
          {user && user.role === 'buyer' && (
            <>
              <Button color="inherit" component={Link} to="/buy">Buy</Button>
              <Button color="inherit" component={Link} to="/rent">Rent</Button>
              <Button color="inherit" component={Link} to="/liked">Liked</Button>
              <Button color="inherit" component={Link} to="/ask-ai">Ask AI</Button>
              <Button color="inherit" component={Link} to="/profile">Profile</Button>
            </>
          )}
          {user && user.role === 'seller' && (
            <>
              <Button color="inherit" component={Link} to="/sell">Sell</Button>
              <Button color="inherit" component={Link} to="/ask-ai">Ask AI</Button>
              <Button color="inherit" component={Link} to="/profile">Profile</Button>
            </>
          )}
          {user && user.role === 'admin' && (
            <>
              <Button color="inherit" component={Link} to="/request">Request</Button>
              <Button color="inherit" component={Link} to="/verified">Verified</Button>
              <Button color="inherit" component={Link} to="/profile">Profile</Button>
            </>
          )}
          {user && <Box sx={{ flexGrow: 1 }} />}
          {user && (
            <Button color="inherit" onClick={() => { logout(); navigate('/'); }}>
              Logout
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
