import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { UserProvider, useUser } from '../contexts/UserContext';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} {...props} />;
});

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [username, setUsername] = useState(''); // <-- Add the username state here
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, username }),  // Ensure 'username' is included
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 1200);
      } else {
        setError(data.message || 'Sign-up failed');
      }
    } catch (err) {
      setError('Sign-up failed');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box mt={8}>
        <Typography variant="h5" align="center">Sign Up</Typography>
        <form onSubmit={handleSignup}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={e => setUsername(e.target.value)}  // Update username state on input change
            required
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <TextField
            label="Role"
            select
            SelectProps={{ native: true }}
            fullWidth
            margin="normal"
            value={role}
            onChange={e => setRole(e.target.value)}
          >
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </TextField>
          {error && <Typography color="error">{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Sign Up
          </Button>
        </form>
        <div style={styles.redirect}>
          <p>Already have an account? <a href="/login" style={styles.link}>Login</a></p>
        </div>
      </Box>
      <Snackbar
        open={success}
        autoHideDuration={1200}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Sign up successful!
        </Alert>
      </Snackbar>
    </Container>
  );
};

const styles = {
  redirect: {
    marginTop: '1rem',
    textAlign: 'center',
  },
  link: {
    color: 'primary.main',
    textDecoration: 'underline',
  },
};

export default Signup;
