import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Typography, TextField, Grid, Card, CardMedia, CardContent, Button, Slider, Box, MenuItem
} from '@mui/material';
import { useUser } from '../contexts/UserContext';

const PRICE_MIN = 0;
const PRICE_MAX = 10000000;

const Buy = () => {
  const { user } = useUser();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [filter, setFilter] = useState({
    minPrice: '',
    maxPrice: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
  });

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/buy-properties')
      .then((response) => response.json())
      .then((data) => {
        setProperties(data);
        setFilteredProperties(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching properties:', error);
        setLoading(false);
      });
  }, []);

  // Handle filter change
  const handleSliderChange = (event, newValue) => {
    setFilter((prev) => ({
      ...prev,
      price: newValue,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filter properties based on the filter state
  useEffect(() => {
    let filtered = properties;

    if (filter.minPrice) {
      filtered = filtered.filter((property) => property.price >= Number(filter.minPrice));
    }
    if (filter.maxPrice) {
      filtered = filtered.filter((property) => property.price <= Number(filter.maxPrice));
    }
    if (filter.location) {
      filtered = filtered.filter((property) =>
        property.address.toLowerCase().includes(filter.location.toLowerCase())
      );
    }
    if (filter.bedrooms) {
      filtered = filtered.filter((property) => property.bedrooms >= filter.bedrooms);
    }
    if (filter.bathrooms) {
      filtered = filtered.filter((property) => property.bathrooms >= filter.bathrooms);
    }

    setFilteredProperties(filtered);
  }, [filter, properties]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Find Your Dream Home - Buy Properties
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Browse through our curated collection of homes and make your dream come true. Use the filters to find your perfect match.
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            variant="outlined"
            label="Min Price (RM)"
            name="minPrice"
            type="number"
            value={filter.minPrice || ''}
            onChange={e => setFilter(prev => ({ ...prev, minPrice: e.target.value }))}
            sx={styles.filterInput}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            variant="outlined"
            label="Max Price (RM)"
            name="maxPrice"
            type="number"
            value={filter.maxPrice || ''}
            onChange={e => setFilter(prev => ({ ...prev, maxPrice: e.target.value }))}
            sx={styles.filterInput}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            variant="outlined"
            label="Location"
            name="location"
            value={filter.location}
            onChange={handleInputChange}
            sx={styles.filterInput}
          />
        </Grid>
      </Grid>
      <Grid container spacing={4}>
        {filteredProperties.map((property) => (
          <Grid item key={property.id} xs={12} sm={6} md={4}>
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
                  RM {property.price.toLocaleString()}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to={`/buy/property/${property.id}`}
                  sx={styles.detailsButton}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

function getImageSrc(image_url) {
  if (!image_url) return '/placeholder.jpg'; // fallback image
  if (image_url.startsWith('http')) return image_url;
  return `http://127.0.0.1:5000${image_url}`;
}

const styles = {
  filterInput: {
    '& .MuiOutlinedInput-root': {
      borderRadius: '6px',
      '& fieldset': {
        borderColor: '#ccc',
      },
      '&:hover fieldset': {
        borderColor: '#007961',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#007961',
      },
    },
  },
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
  detailsButton: {
    width: '100%',
    borderRadius: '4px',
    padding: '12px',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    mt: 1,
  },
};

export default Buy;
