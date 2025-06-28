import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Grid, Collapse, IconButton, Divider } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const AdminVerifiedListings = () => {
  const [props, setProps] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/admin/verified')
      .then((r) => r.json())
      .then(setProps)
      .catch(console.error);
  }, []);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const toggleDetails = (id) => setExpandedId(expandedId === id ? null : id);

  const filteredProperties = props.filter((property) =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto', py: 4, px: { xs: 1, sm: 3 }, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      <Typography variant="h4" color="primary" fontWeight={700} align="center" gutterBottom>
        Verified Listings
      </Typography>
      <TextField
        label="Search by property name"
        value={searchTerm}
        onChange={handleSearch}
        fullWidth
        sx={{ mb: 3, bgcolor: 'white', borderRadius: 1 }}
      />
      <Grid container spacing={3} justifyContent="center">
        {filteredProperties.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">No verified listings found.</Typography>
            </Paper>
          </Grid>
        )}
        {filteredProperties.map((property) => (
          <Grid item xs={12} key={property.id}>
            <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  width: '100%',
                }}
                onClick={() => toggleDetails(property.id)}
              >
                <Box>
                  <Typography variant="h6" fontWeight={600}>{property.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{property.address}</Typography>
                </Box>
                <IconButton>
                  {expandedId === property.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={expandedId === property.id}>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={8}>
                    <Typography sx={{ mt: 1 }}>Price: <b>RM {property.price}</b></Typography>
                    <Typography>Size: {property.size} sqft</Typography>
                    <Typography>Type: {property.property_type}</Typography>
                    <Typography>Beds: {property.bedrooms} | Baths: {property.bathrooms}</Typography>
                    <Typography>Status:
                      <span style={{
                        marginLeft: 8,
                        background: '#007961',
                        color: '#fff',
                        borderRadius: 8,
                        padding: '2px 12px',
                        fontWeight: 600,
                        fontSize: '0.95rem'
                      }}>Verified</span>
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                      <b>Seller:</b> {property.seller_username} ({property.seller_email})
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                      <b>Description:</b> {property.description}
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                      <b>Uploaded:</b> {property.upload_date}
                    </Typography>
                    <a
                      href={`http://127.0.0.1:5000${property.doc_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#1565c0',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        display: 'inline-block',
                        marginTop: 8
                      }}
                    >
                      View Document
                    </a>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {property.image_url && (
                      <img
                        src={`http://127.0.0.1:5000${property.image_url}`}
                        alt={property.name}
                        style={{
                          width: '100%',
                          maxWidth: 320,
                          height: 'auto',
                          borderRadius: 8,
                          margin: '8px 0'
                        }}
                      />
                    )}
                  </Grid>
                </Grid>
              </Collapse>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminVerifiedListings;
