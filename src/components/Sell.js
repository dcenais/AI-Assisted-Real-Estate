// src/components/Sell.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { Grid, Box, TextField, Button, Container, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const Sell = () => {
  const { user } = useUser();               // so we can grab seller’s email
  const navigate = useNavigate();
  const [form, setForm] = useState({
    propertyName: '',
    address: '',
    price: '',
    size: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    description: '', // <-- Add this line
    image: null,
    doc: null
  });
  const [error, setError] = useState('');
  const [myProps, setMyProps] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    if (user) {
      fetch(`http://127.0.0.1:5000/api/my-properties?email=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => setMyProps(data));
    }
  }, [user]);

  const handleChange = e => {
    const { name, value } = e.target;
    // Only allow letters, numbers, spaces, and basic punctuation in description
    if (name === "description") {
      const clean = value.replace(/[^a-zA-Z0-9\s.,;:?!'"-]/g, "");
      setForm(f => ({ ...f, [name]: clean }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleFile = e => {
    const { name, files } = e.target;
    if (files.length) setForm(f => ({ ...f, [name]: files[0] }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!user) {
      setError('You must be logged in as a seller to submit.');
      return;
    }

    const data = new FormData();
    data.append('sellerEmail', user.email);
    data.append('propertyName', form.propertyName);
    data.append('address', form.address);
    data.append('price', form.price);
    data.append('size', form.size);
    data.append('propertyType', form.propertyType);
    data.append('bedrooms', form.bedrooms);
    data.append('bathrooms', form.bathrooms);
    data.append('description', form.description); // <-- Add this line
    data.append('listingType', form.listingType || 'sell');
    if (form.image) data.append('image', form.image);
    if (form.doc)   data.append('doc', form.doc);

    const res = await fetch('http://127.0.0.1:5000/properties', {
      method: 'POST',
      body: data
    });

    if (res.ok) {
      alert('Property submitted—awaiting admin approval.');
      navigate('/');
    } else {
      const { message } = await res.json();
      setError(message || 'Submission failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    const res = await fetch(`http://127.0.0.1:5000/api/my-properties/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMyProps(myProps.filter(p => p.id !== id));
    } else {
      alert('Failed to delete property.');
    }
  };

  const startEdit = (prop) => {
    setEditingId(prop.id);
    setEditForm({
      propertyName: prop.name,
      address: prop.address,
      price: prop.price,
      size: prop.size,
      propertyType: prop.property_type,
      bedrooms: prop.bedrooms,
      bathrooms: prop.bathrooms,
      description: prop.description,
    });
  };

  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm(f => ({
      ...f,
      [name]: name === "description"
        ? value.replace(/[^a-zA-Z0-9\s.,;:?!'"-]/g, "")
        : value
    }));
  };

  const handleEditSubmit = async (id) => {
    const data = new FormData();
    Object.entries(editForm).forEach(([k, v]) => data.append(k, v));
    const res = await fetch(`http://127.0.0.1:5000/api/my-properties/${id}`, {
      method: 'PUT',
      body: data
    });
    if (res.ok) {
      // Refresh list
      const updated = myProps.map(p => p.id === id ? { ...p, ...editForm } : p);
      setMyProps(updated);
      setEditingId(null);
    } else {
      alert('Failed to update property.');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        Sell Your Property
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        List your property for sale and reach thousands of buyers. Fill in the details below and submit for admin approval.
      </Typography>
      {error && <p style={styles.error}>{error}</p>}
      <Grid container justifyContent="center">
        <Grid item xs={12} md={10} lg={8}>
          <Box sx={{ background: '#f5f7fa', borderRadius: 3, p: 4, boxShadow: 2 }}>
            <form onSubmit={handleSubmit} style={styles.form}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Property Name"
                    name="propertyName"
                    value={form.propertyName}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="dense"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="dense"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Price (RM)"
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="dense"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Size (sqft)"
                    name="size"
                    type="number"
                    value={form.size}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="dense"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Property Type"
                    name="propertyType"
                    value={form.propertyType}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="dense"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Listing Type"
                    name="listingType"
                    value={form.listingType || 'sell'}
                    onChange={handleChange}
                    fullWidth
                    required
                    SelectProps={{ native: true }}
                    margin="dense"
                  >
                    <option value="sell">Sell</option>
                    <option value="rent">Rent Out</option>
                  </TextField>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Bedrooms"
                    name="bedrooms"
                    type="number"
                    value={form.bedrooms}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="dense"
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <TextField
                    label="Bathrooms"
                    name="bathrooms"
                    type="number"
                    value={form.bathrooms}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="dense"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    fullWidth
                    required
                    margin="dense"
                    multiline
                    rows={3}
                    inputProps={{ maxLength: 1000 }}
                    placeholder="Describe your property (max 1000 chars, no special characters)"
                    sx={{
                      minWidth: 350, // Increase width
                      '& .MuiInputBase-root': { fontSize: 16 },
                      '& .MuiInputLabel-root': { fontSize: 15, background: '#f5f7fa', px: 0.5 }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <label style={styles.label}>Upload Image</label>
                  <input
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    style={styles.fileInput}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <label style={styles.label}>Upload Property Document (PDF)</label>
                  <input
                    name="doc"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFile}
                    style={styles.fileInput}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Submit Property
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Grid>
      </Grid>

      {/* My Submissions Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" color="primary" gutterBottom>
          My Submissions
        </Typography>
        <Grid container spacing={2}>
          {myProps.length === 0 && (
            <Grid item xs={12}>
              <Typography color="textSecondary">No submissions yet.</Typography>
            </Grid>
          )}
          {myProps.map((prop) => (
            <Grid item xs={12} md={6} lg={4} key={prop.id}>
              <Box sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                background: '#fff',
                boxShadow: 1,
                mb: 2,
                position: 'relative'
              }}>
                {editingId === prop.id ? (
                  <form onSubmit={e => { e.preventDefault(); handleEditSubmit(prop.id); }}>
                    <TextField
                      label="Property Name"
                      name="propertyName"
                      value={editForm.propertyName}
                      onChange={handleEditChange}
                      fullWidth
                      margin="dense"
                      required
                    />
                    <TextField
                      label="Address"
                      name="address"
                      value={editForm.address}
                      onChange={handleEditChange}
                      fullWidth
                      margin="dense"
                      required
                    />
                    <TextField
                      label="Price (RM)"
                      name="price"
                      type="number"
                      value={editForm.price}
                      onChange={handleEditChange}
                      fullWidth
                      margin="dense"
                      required
                    />
                    <TextField
                      label="Size (sqft)"
                      name="size"
                      type="number"
                      value={editForm.size}
                      onChange={handleEditChange}
                      fullWidth
                      margin="dense"
                      required
                    />
                    <TextField
                      label="Property Type"
                      name="propertyType"
                      value={editForm.propertyType}
                      onChange={handleEditChange}
                      fullWidth
                      margin="dense"
                      required
                    />
                    <TextField
                      label="Bedrooms"
                      name="bedrooms"
                      type="number"
                      value={editForm.bedrooms}
                      onChange={handleEditChange}
                      fullWidth
                      margin="dense"
                      required
                    />
                    <TextField
                      label="Bathrooms"
                      name="bathrooms"
                      type="number"
                      value={editForm.bathrooms}
                      onChange={handleEditChange}
                      fullWidth
                      margin="dense"
                      required
                    />
                    <TextField
                      label="Description"
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      fullWidth
                      margin="dense"
                      multiline
                      rows={2}
                      inputProps={{ maxLength: 1000 }}
                      required
                    />
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      <Button type="submit" variant="contained" color="primary" size="small">Save</Button>
                      <Button onClick={() => setEditingId(null)} variant="outlined" size="small">Cancel</Button>
                    </Box>
                  </form>
                ) : (
                  <>
                    <Typography variant="subtitle1" fontWeight={600}>{prop.name}</Typography>
                    {prop.status !== 'verified' && (
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1 }}>
                        <IconButton onClick={() => handleDelete(prop.id)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                        <IconButton onClick={() => startEdit(prop)} size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                      </Box>
                    )}
                    <Typography variant="body2" color="textSecondary">
                      Status: <b style={{ color: prop.status === 'verified' ? '#007961' : '#fbc02d' }}>
                        {prop.status === 'verified' ? 'Approved' : 'Pending'}
                      </b>
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

const styles = {
  form: {
    width: '100%',
    maxWidth: '100%',
  },
  label: {
    fontWeight: 600,
    color: '#1a237e',
    marginBottom: 4,
    display: 'block'
  },
  fileInput: {
    marginTop: 8,
    marginBottom: 8,
    display: 'block'
  },
  error: {
    color: '#d32f2f',
    marginBottom: 16,
    fontWeight: 500
  }
};

export default Sell;
