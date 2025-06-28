import React from 'react';
import { Button, Box, Typography, Container, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import BuyerHome from './BuyerHome';
import SellerHome from './SellerHome';
import AdminHome from './AdminHome';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  if (!user) {
    return (
      <Box sx={styles.root}>
        <Container
          maxWidth="lg"
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%', // Make sure it fills the parent Box
            minHeight: '0', // Prevents extra height
            py: 0, // Remove vertical padding
          }}
        >
          <Grid
            container
            spacing={4}
            alignItems="center"
            justifyContent="center"
            sx={{
              flex: 1,
              height: '100%',
              minHeight: '0',
              py: 0,
              my: 0,
            }}
          >
            {/* Left: Hero Image & Globe */}
            <Grid item xs={12} md={5}>
              <Box sx={styles.heroImageContainer}>
                <img
                  src="/house-icon.png"
                  alt="House Icon"
                  style={styles.heroImage}
                />
                <Box sx={styles.globeIcon} aria-label="Globe icon">
                  <img
                    src="/globe-icon.svg"
                    alt="Globe Icon"
                    style={styles.globeImage}
                  />
                </Box>
              </Box>
            </Grid>
            {/* Right: Hero Text */}
            <Grid item xs={12} md={7}>
              <Paper elevation={6} sx={styles.heroTextPaper}>
                <Box sx={styles.heroText}>
                  <Box sx={styles.welcomeBox}>Welcome To</Box>
                  <Typography variant="h2" sx={styles.heroHeading}>
                    AI-assisted <br /> Real Estate
                  </Typography>
                  <Typography sx={styles.description}>
                    Experience a smarter way to buy, sell, and rent properties with AI-powered price predictions, personalized recommendations, and intuitive tools. Navigate the real estate market with confidence.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={styles.ctaButton}
                    onClick={() => navigate('/login')}
                  >
                    TRY AI PREDICTION NOW
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (user.role === 'buyer') return <BuyerHome />;
  if (user.role === 'seller') return <SellerHome />;
  if (user.role === 'admin') return <AdminHome />;
  return null;
};

const styles = {
  root: {
    height: '100vh', // Only this controls the height
    background: 'linear-gradient(135deg, #1565c0 0%, #e3f2fd 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Poppins', sans-serif",
    overflow: 'hidden', // Prevent scrollbars
  },
  heroImageContainer: {
    position: 'relative',
    width: 220,
    height: 220,
    borderRadius: '50%',
    background: '#1976d2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 0 12px #90caf9',
    margin: '0 auto',
  },
  heroImage: {
    width: 170,
    height: 170,
    borderRadius: '50%',
    objectFit: 'contain',
    zIndex: 2,
    background: 'white',
    padding: 16,
  },
  globeIcon: {
    position: 'absolute',
    bottom: -18,
    left: 25,
    width: 70,
    height: 70,
    borderRadius: '50%',
    background: '#e3f2fd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(21,101,192,0.08)',
    zIndex: 3,
  },
  globeImage: {
    width: 40,
    height: 40,
    filter: 'invert(32%) sepia(99%) saturate(749%) hue-rotate(183deg) brightness(98%) contrast(101%)',
  },
  heroTextPaper: {
    p: { xs: 2, md: 4 },
    background: 'rgba(255,255,255,0.98)',
    borderRadius: 4,
    boxShadow: '0 8px 32px rgba(21,101,192,0.12)',
    maxWidth: 520,
    margin: { xs: '0 auto', md: 0 },
  },
  heroText: {
    color: '#1565c0',
    textAlign: { xs: 'center', md: 'left' },
  },
  welcomeBox: {
    display: 'inline-block',
    background: '#1565c0',
    color: 'white',
    fontWeight: 700,
    padding: '0.25rem 1.25rem',
    borderRadius: 8,
    fontSize: '1.25rem',
    marginBottom: '0.75rem',
    letterSpacing: 1,
  },
  heroHeading: {
    margin: 0,
    fontWeight: 900,
    lineHeight: 1.1,
    fontSize: { xs: '2.5rem', md: '3.5rem' },
    mb: 2,
    color: '#1565c0',
  },
  description: {
    marginTop: '1.25rem',
    fontSize: '1.15rem',
    maxWidth: 500,
    color: '#1976d2',
    mb: 3,
  },
  ctaButton: {
    mt: 3,
    px: 4,
    py: 1.5,
    fontWeight: 'bold',
    fontSize: '1.1rem',
    borderRadius: 2,
    boxShadow: '0 2px 8px rgba(21,101,192,0.08)',
    backgroundColor: '#1565c0',
    color: 'white',
    '&:hover': {
      backgroundColor: '#0d47a1',
    },
  },
};

export default Home;
