import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardMedia, CardContent, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Liked = () => {
  const [likedProperties, setLikedProperties] = useState([]);
  const [compareLeft, setCompareLeft] = useState(null);
  const [compareRight, setCompareRight] = useState(null);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user && user.id) {
      fetch(`http://127.0.0.1:5000/api/liked-properties/${user.id}`)
        .then(res => res.json())
        .then(data => {
          console.log('Liked properties:', data);
          setLikedProperties(data);
        });
    }
  }, [user]);

  const handleUnlike = async (likedId) => {
    try {
      setLikedProperties((prev) =>
        prev.filter((prop) => prop.liked_id !== likedId)
      );
      const res = await fetch(
        `http://127.0.0.1:5000/api/remove-liked-property/${likedId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Server failed to remove like');
    } catch (err) {
      console.error('Error unliking property:', err);
    }
  };

  const handleContactSeller = (property) => {
    navigate('/chat-seller');
  };

  // Handle compare logic
  const handleCompare = (property) => {
    if (!compareLeft) {
      setCompareLeft(property);
    } else if (!compareRight && property.liked_id !== compareLeft.liked_id) {
      setCompareRight(property);
    }
  };

  const handleBackLeft = () => setCompareLeft(null);
  const handleBackRight = () => setCompareRight(null);

  // If both sides are filled, hide the list
  const showList = !compareLeft || !compareRight;

  // Example like button handler
  const handleLike = async (property) => {
    await fetch('http://127.0.0.1:5000/api/like-property', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        property_id: property.id,
        type: 'buy' // or 'rent', depending on the page
      })
    });
  };

  // Remove duplicates by property_id and type
  const uniqueLikedProperties = [];
  const seen = new Set();
  for (const prop of likedProperties) {
    const key = `${prop.id}-${prop.type}`;
    if (!seen.has(key)) {
      uniqueLikedProperties.push(prop);
      seen.add(key);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Your Liked Properties
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, minHeight: 420 }}>
        {/* Left Compare Panel */}
        {compareLeft && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Card sx={styles.compareProperty}>
              <CardMedia
                component="img"
                alt={compareLeft.name}
                image={getImageSrc(compareLeft.image_url)}
                sx={styles.selectedPropertyImage}
              />
              <CardContent>
                <Typography variant="h6">{compareLeft.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {compareLeft.address}
                </Typography>
                <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                  RM {compareLeft.price}
                </Typography>
                <Typography variant="body2">{compareLeft.description}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Type: {compareLeft.type}
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    mt: 2,
                    backgroundColor: '#ffb300', // yellow
                    color: '#0d47a1',
                    '&:hover': { backgroundColor: '#ffa000', color: '#0d47a1' }
                  }}
                  onClick={() => handleContactSeller(compareLeft)}
                >
                  Contact Seller
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    mt: 2,
                    ml: 2,
                    borderColor: '#1976d2', // blue
                    color: '#1976d2',
                    '&:hover': { borderColor: '#0d47a1', color: '#0d47a1' }
                  }}
                  onClick={handleBackLeft}
                >
                  Back
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Right Compare Panel */}
        {compareRight && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Card sx={styles.compareProperty}>
              <CardMedia
                component="img"
                alt={compareRight.name}
                image={getImageSrc(compareRight.image_url)}
                sx={styles.selectedPropertyImage}
              />
              <CardContent>
                <Typography variant="h6">{compareRight.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {compareRight.address}
                </Typography>
                <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                  RM {compareRight.price}
                </Typography>
                <Typography variant="body2">{compareRight.description}</Typography>
                <Typography variant="body2" color="textSecondary">
                  Type: {compareRight.type}
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    mt: 2,
                    backgroundColor: '#ffb300', // yellow
                    color: '#0d47a1',
                    '&:hover': { backgroundColor: '#ffa000', color: '#0d47a1' }
                  }}
                  onClick={() => handleContactSeller(compareRight)}
                >
                  Contact Seller
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    mt: 2,
                    ml: 2,
                    borderColor: '#1976d2', // blue
                    color: '#1976d2',
                    '&:hover': { borderColor: '#0d47a1', color: '#0d47a1' }
                  }}
                  onClick={handleBackRight}
                >
                  Back
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Property List */}
        {showList && (
          <Box sx={{ flex: 1.5 }}>
            <Grid container spacing={4}>
              {uniqueLikedProperties.map((property) => (
                <Grid item key={property.liked_id} xs={12} sm={6} md={4}>
                  <Card sx={styles.propertyCard}>
                    <CardMedia
                      component="img"
                      alt={property.name}
                      image={getImageSrc(property.image_url)}
                      sx={styles.propertyImage}
                    />
                    <CardContent>
                      <Typography variant="h6" component="div" noWrap>
                        {property.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" noWrap>
                        {property.address}
                      </Typography>
                      <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                        RM {property.price}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Type: {property.type}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          variant="contained"
                          sx={{
                            flex: 1,
                            backgroundColor: '#0d47a1', // dark blue
                            color: 'white',
                            '&:hover': { backgroundColor: '#002171' }
                          }}
                          onClick={() => handleUnlike(property.liked_id)}
                        >
                          Unlike
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            flex: 1,
                            backgroundColor: '#1976d2', // blue
                            color: 'white',
                            '&:hover': { backgroundColor: '#115293' }
                          }}
                          onClick={() => handleCompare(property)}
                          disabled={
                            (compareLeft && compareLeft.liked_id === property.liked_id) ||
                            (compareRight && compareRight.liked_id === property.liked_id)
                          }
                        >
                          Compare
                        </Button>
                        <Button
                          variant="contained"
                          sx={{
                            flex: 1,
                            backgroundColor: '#ffb300', // yellow
                            color: '#0d47a1',
                            '&:hover': { backgroundColor: '#ffa000', color: '#0d47a1' }
                          }}
                          onClick={() => handleContactSeller(property)}
                        >
                          Contact Seller
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
};

function getImageSrc(image_url) {
  if (!image_url) return '/placeholder.jpg'; // fallback image
  if (image_url.startsWith('http')) return image_url;
  return `http://127.0.0.1:5000${image_url}`;
}

const styles = {
  propertyCard: {
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease-in-out',
    width: 340,
    height: 390,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  propertyImage: {
    objectFit: 'cover',
    height: 180,
    width: '100%',
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
  },
  compareProperty: {
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    padding: '15px',
    backgroundColor: 'white',
    minHeight: 420,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  selectedPropertyImage: {
    width: '100%',
    height: 200,
    objectFit: 'cover',
    borderRadius: '8px',
  },
};

export default Liked;
