import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, CardMedia, CardContent, Typography, Button, Box } from '@mui/material';
import { useUser } from '../contexts/UserContext';

function getImageSrc(image_url) {
  if (!image_url) return '/placeholder.jpg'; // fallback image
  if (image_url.startsWith('http')) return image_url;
  return `http://127.0.0.1:5000${image_url}`;
}

const PropertyDetails = () => {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [likeMessage, setLikeMessage] = useState('');
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/buy-properties/${propertyId}`);
        const data = await response.json();
        if (response.ok) setProperty(data);
      } catch (error) {
        console.error('Error fetching property details:', error);
      }
    };
    if (propertyId) fetchPropertyDetails();
  }, [propertyId]);

  const handleLike = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/like-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          property_id: property.id,
          type: 'buy'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setLikeMessage('Property liked successfully!');
      } else {
        setLikeMessage(data.error || 'Failed to like property.');
      }
    } catch (err) {
      setLikeMessage('Failed to like property.');
    }
  };

  const handleContactSeller = async () => {
    await fetch('http://127.0.0.1:5000/api/contact-seller', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buyer_email: user.email,
        seller_email: property.seller_email, // use the actual seller's email
        message: "Hi, I'm interested in your property!"
      })
    });
    navigate(`/chat-seller?seller=${property.seller_email}`);
  };

  if (!property) return <div>Loading...</div>;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card sx={{ borderRadius: '12px', boxShadow: 4 }}>
        <CardMedia
          component="img"
          height="350"
          image={getImageSrc(property.image_url)}
          alt={property.name}
          sx={{ objectFit: 'cover', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}
        />
        <CardContent>
          <Typography variant="h4" color="primary" gutterBottom>
            {property.name}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            {property.address}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
            RM {property.price}
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {property.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button variant="contained" color="primary" onClick={handleLike}>
              Like
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#ff9800', color: 'white', '&:hover': { backgroundColor: '#e68900' } }}
              onClick={handleContactSeller}
            >
              Buy / Contact Seller
            </Button>
          </Box>
          {likeMessage && (
            <Typography color="success.main" sx={{ mb: 2 }}>
              {likeMessage}
            </Typography>
          )}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
              Location Map
            </Typography>
            <iframe
              title="Property Location"
              width="100%"
              height="250"
              style={{ border: 0, borderRadius: '8px' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed`}
            ></iframe>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PropertyDetails;
