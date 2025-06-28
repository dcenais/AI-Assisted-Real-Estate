import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, Container } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const AdminHome = () => {
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [properties, setProperties] = useState([]);
  const [queries, setQueries] = useState([]);

  // Fetch counts
  const fetchCounts = () => {
    fetch('http://127.0.0.1:5000/admin/counts')
      .then(r => r.json())
      .then(data => {
        setVerifiedCount(data.verified);
        setRejectedCount(data.rejected);
      });
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/admin/requests')
      .then(r => r.json())
      .then(data => setProperties(data));
  }, []);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/admin/queries')
      .then(r => r.json())
      .then(data => setQueries(data));
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this property?')) return;
    await fetch(`http://127.0.0.1:5000/admin/request/${id}/approve`, { method: 'POST' });
    setProperties(ps => ps.filter(p => p.id !== id));
    fetchCounts();
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this property?')) return;
    await fetch(`http://127.0.0.1:5000/admin/request/${id}/reject`, { method: 'POST' });
    setProperties(ps => ps.filter(p => p.id !== id));
    fetchCounts();
  };

  // Listings per year for chart
  const listingsPerYear = properties.reduce((acc, p) => {
    const year = p.upload_date ? p.upload_date.slice(0, 4) : 'Unknown';
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});
  const listingsData = Object.entries(listingsPerYear).map(([year, count]) => ({ year, count }));

  // Responsive height calculation for "fit to page"
  // Adjust these values as needed for your header/nav height
  const HEADER_HEIGHT = 64; // px, adjust if your navbar is taller
  const PAGE_PADDING = 32; // px, top+bottom
  const TOTAL_HEIGHT = `calc(100vh - ${HEADER_HEIGHT + PAGE_PADDING}px)`;

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        minHeight: '100vh',
        height: '100vh',
        bgcolor: '#f5f7fa',
        overflow: 'hidden',
        py: 2
      }}
    >
      <Box
        sx={{
          px: { xs: 1, md: 4 },
          height: TOTAL_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start'
        }}
      >
        <Typography variant="h3" fontWeight={800} color="primary" gutterBottom sx={{ mb: 2 }}>
          Welcome, Admin!
        </Typography>
        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Paper sx={{ background: '#fff', color: '#007961', px: 2, py: 2, borderRadius: 3, boxShadow: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" fontWeight={600}>Pending Listings</Typography>
              <Typography variant="h4" fontWeight={800}>{properties.length}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ background: '#fff', color: '#1565c0', px: 2, py: 2, borderRadius: 3, boxShadow: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" fontWeight={600}>Verified Listings</Typography>
              <Typography variant="h4" fontWeight={800}>{verifiedCount}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper sx={{ background: '#fff', color: '#e91e63', px: 2, py: 2, borderRadius: 3, boxShadow: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2" fontWeight={600}>Rejected Listings</Typography>
              <Typography variant="h4" fontWeight={800}>{rejectedCount}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Analytics, Queries, and Listings */}
        <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
          <Grid item xs={12} md={4} sx={{ height: '100%' }}>
            <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2, height: '100%', minHeight: 250, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Listings Created Per Year</Typography>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={listingsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1565c0" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4} sx={{ height: '100%' }}>
            <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2, height: '100%', minHeight: 250, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>User Queries / Help</Typography>
              <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                {queries.length === 0 && <Typography color="text.secondary">No queries yet.</Typography>}
                {queries.map(q => (
                  <Box key={q.id} sx={{ mb: 1, p: 1, border: '1px solid #e0e0e0', borderRadius: 2, background: '#fafbfc' }}>
                    <Typography fontWeight={600}>{q.user_email}</Typography>
                    <Typography variant="body2" color="text.secondary">{q.question}</Typography>
                    <Typography variant="caption" color="text.secondary">{q.created_at}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4} sx={{ height: '100%' }}>
            <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2, height: '100%', minHeight: 250, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Active Listings</Typography>
              <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                {properties.map(property => (
                  <Paper key={property.id} sx={{ p: 1.5, borderRadius: 2, boxShadow: 1, mb: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle2" fontWeight={700}>{property.title || property.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{property.description}</Typography>
                    <Typography variant="body2" color="text.secondary">Seller: {property.seller_username} ({property.seller_email})</Typography>
                    <Typography variant="body2" color="text.secondary">Uploaded: {property.upload_date}</Typography>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      background: property.status === 'pending' ? '#fbc02d' : property.status === 'verified' ? '#007961' : '#e91e63',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      marginTop: 8
                    }}>
                      {property.status ? property.status.charAt(0).toUpperCase() + property.status.slice(1) : 'Pending'}
                    </span>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Button variant="contained" color="success" size="small" onClick={() => handleApprove(property.id)} sx={{ flex: 1 }}>Approve</Button>
                      <Button variant="contained" color="error" size="small" onClick={() => handleReject(property.id)} sx={{ flex: 1 }}>Reject</Button>
                    </Box>
                  </Paper>
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ fontWeight: 'bold', letterSpacing: 1, px: 2, py: 1, fontSize: 14 }}
                  onClick={() => window.open('http://127.0.0.1:5000/admin/export-csv', '_blank')}
                >
                  Export CSV
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AdminHome;