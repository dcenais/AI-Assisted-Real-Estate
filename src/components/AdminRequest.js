import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Grid, Container } from '@mui/material';

const AdminRequest = () => {
  const [properties, setProperties] = useState([]);

  // Fetch pending properties on mount
  useEffect(() => {
    fetch('http://127.0.0.1:5000/admin/request')
      .then(r => r.json())
      .then(setProperties)
      .catch(console.error);
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this property?')) return;
    await fetch(`http://127.0.0.1:5000/admin/request/${id}/approve`, { method: 'POST' });
    setProperties(ps => ps.filter(p => p.id !== id));
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this property?')) return;
    await fetch(`http://127.0.0.1:5000/admin/request/${id}/reject`, { method: 'POST' });
    setProperties(ps => ps.filter(p => p.id !== id));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, minHeight: '100vh' }}>
      <Typography variant="h4" color="primary" fontWeight={700} align="center" gutterBottom>
        Pending Property Verification
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {properties.map(property => (
          <Grid item xs={12} key={property.id}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, display: 'flex', gap: 3, alignItems: 'center', minHeight: 180 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" fontWeight={600}>{property.name}</Typography>
                <Typography color="text.secondary">{property.address}</Typography>
                <Typography sx={{ mt: 1 }}>Price: <b>RM {property.price}</b></Typography>
                <Typography>Size: {property.size} sqft</Typography>
                <Typography>Type: {property.property_type}</Typography>
                <Typography>Beds: {property.bedrooms} | Baths: {property.bathrooms}</Typography>
                <Typography>Status:
                  <span style={{
                    marginLeft: 8,
                    background: '#fbc02d',
                    color: '#fff',
                    borderRadius: 8,
                    padding: '2px 12px',
                    fontWeight: 600,
                    fontSize: '0.95rem'
                  }}>Pending</span>
                </Typography>
                <a href={`http://127.0.0.1:5000${property.doc_url}`} target="_blank" rel="noopener noreferrer" style={{
                  color: '#1565c0', fontWeight: 'bold', textDecoration: 'none', display: 'inline-block', marginTop: 8
                }}>View Document</a>
              </Box>
              <Box sx={{ minWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={`http://127.0.0.1:5000${property.image_url}`} alt={property.name} style={{
                  width: 160, height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8
                }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleApprove(property.id)}
                    sx={{ fontWeight: 600 }}
                    fullWidth
                  >Approve</Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleReject(property.id)}
                    sx={{ fontWeight: 600 }}
                    fullWidth
                  >Reject</Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminRequest;
