import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Box, TextField, MenuItem, Button, CircularProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AskAI = () => {
  const [formData, setFormData] = useState({
    propertyType: '',
    size: '',
    bedrooms: '',
    bathrooms: '',
    carparks: '',
    description: '',
    state: '',
    price_per_sqft: '',
    location_score_capped: '',
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [avgPriceByState, setAvgPriceByState] = useState({});
  const [hdiByState, setHdiByState] = useState({});
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [shapChartData, setShapChartData] = useState([]);

  useEffect(() => {
    fetch('/avg_price_per_sqft_by_state.json')
      .then((response) => response.json())
      .then((data) => setAvgPriceByState(data))
      .catch((error) => console.error('Error loading state price data:', error));

    const hdiData = {
      "Kuala Lumpur": 0.890, "Putrajaya": 0.890, "Labuan": 0.843, "Penang": 0.839, "Selangor": 0.837,
      "Malacca": 0.822, "Negeri Sembilan": 0.820, "Sarawak": 0.813, "Pahang": 0.801, "Johor": 0.796,
      "Perak": 0.790, "Terengganu": 0.782, "Kedah": 0.770, "Perlis": 0.766, "Sabah": 0.766, "Kelantan": 0.755,
    };
    setHdiByState(hdiData);
  }, []);

  const calculateLocationScore = (hdi) => {
    if (hdi >= 0.890) return 10;
    if (hdi >= 0.840) return 8;
    if (hdi >= 0.800) return 6;
    if (hdi >= 0.760) return 4;
    return 2;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'state') {
      const price = avgPriceByState[value] || 0;
      const hdi = hdiByState[value] || 0;
      const score = calculateLocationScore(hdi);
      setFormData(prev => ({
        ...prev,
        price_per_sqft: price,
        state: value,
        location_score_capped: score,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);

    const payload = {
      model: 'xgboost',
      "Bedroom(s)_clean": formData.bedrooms,
      "Bathroom(s)_clean": formData.bathrooms,
      "Builtup_area_capped": formData.size,
      "CarParks_capped": formData.carparks,
      "price_per_sqft": formData.price_per_sqft,
      "Property type": formData.propertyType,
      "description": formData.description,
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Prediction failed');
      const data = await response.json();
      setPrediction({
        price: data.predicted_price,
        explanation: data.explanation,
        recommendation: data.recommendation,
      });
      setShapChartData(data.shap_chart_data || []);
    } catch (error) {
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    setAiLoading(true);
    setError('');
    setAiResponse('');
    const questionPayload = {
      question: userQuery,
      predicted_price: prediction?.price,
      explanation: prediction?.explanation,
      recommendation: prediction?.recommendation,
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/api/ask-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionPayload),
      });

      if (!response.ok) throw new Error('Failed to get answer from AI');
      const data = await response.json();
      setAiResponse(data.answer);
    } catch (error) {
      setError(`Error: ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Chart data for analytics
  const chartData = Object.keys(avgPriceByState).map(state => ({
    state,
    price: avgPriceByState[state]
  }));

  // Helper function to sanitize and format AI response
  const sanitizeResponse = (text) => {
    if (!text) return '';
    return text.replace(/[!@#$%^&*()_+=\[\]{}|\\<>/~`]/g, '');
  };
  const formatResponse = (text) => {
    if (!text) return '';
    return sanitizeResponse(text)
      .split(/(?:\r?\n|\.\s)/)
      .filter(Boolean)
      .map((line, idx) => <p key={idx}>{line.trim()}{line.trim().endsWith('.') ? '' : '.'}</p>);
  };

  // Custom tooltip for Analytics chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ background: '#fff', border: '1px solid #1976d2', p: 1, borderRadius: 1 }}>
          <Typography variant="body2" color="primary"><b>{label}</b></Typography>
          <Typography variant="body2">RM {Number(payload[0].value).toFixed(2)}</Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom>
        AI Property Price Prediction & Analytics
      </Typography>
      {error && <p style={{ color: 'red', fontSize: '1rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
      <Grid container spacing={3}>
        {/* Left Panel: Property Input Form */}
        <Grid item xs={12} md={4}>
          <Box sx={{ background: '#f5f7fa', borderRadius: 3, p: 3, boxShadow: 2, minHeight: 600, maxHeight: 700, overflowY: 'auto' }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Property Details
            </Typography>
            <form id="propertyForm" onSubmit={handleSubmit}>
              <TextField
                label="Bedrooms"
                name="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Bathrooms"
                name="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Built-up Area (sqft)"
                name="size"
                type="number"
                value={formData.size}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Car Parks"
                name="carparks"
                type="number"
                value={formData.carparks}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                select
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              >
                <MenuItem value="">Select State</MenuItem>
                {Object.keys(avgPriceByState).map((state) => (
                  <MenuItem key={state} value={state}>{state}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Property Type"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
              />
              <TextField
                label="Property Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
       
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Get Prediction'}
              </Button>
            </form>
          </Box>
        </Grid>

        {/* Middle Panel: Prediction, Explanation, Analytics */}
        <Grid item xs={12} md={4}>
          <Box sx={{ background: '#fff', borderRadius: 3, p: 3, boxShadow: 2, minHeight: 600, maxHeight: 700, overflowY: 'auto' }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Prediction & Analytics
            </Typography>
            {prediction ? (
              <>
                <Typography variant="h5" sx={{ color: '#007961', mb: 2 }}>
                  Predicted Price: RM {prediction.price?.toLocaleString()}
                </Typography>
                {/* Accordion for Explanation */}
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1"><b>Explanation of Prediction</b></Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {formatResponse(prediction.explanation)}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
                {/* Analytics/Visualization */}
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    <b>Average Price per Square Feet by State</b>
                  </Typography>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData}>
                      <XAxis dataKey="state" fontSize={10} />
                      <YAxis fontSize={10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="price" fill="#1976d2" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Fill in the property details and click "Get Prediction" to see results here.
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Right Panel: Ask AI */}
        <Grid item xs={12} md={4}>
          <Box sx={{ background: '#f5f7fa', borderRadius: 3, p: 3, boxShadow: 2, minHeight: 600, maxHeight: 700, overflowY: 'auto' }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Ask AI About This Property
            </Typography>
            <TextField
              label="Ask a question"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              fullWidth
              multiline
              rows={3}
              margin="normal"
              placeholder='E.g. "Why is the price this value?", "Is this a good investment?", "How much will the value be in 5 years?"'
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleAskQuestion}
              disabled={aiLoading || !prediction}
            >
              {aiLoading ? <CircularProgress size={24} color="inherit" /> : 'Get Answer'}
            </Button>
            {aiResponse && (
              <Box sx={{ mt: 3, background: '#fff', borderRadius: 2, p: 2 }}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                  AI's Answer:
                </Typography>
                <div>{formatResponse(aiResponse)}</div>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
      {/* Disclaimer */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          Disclaimer: AI predictions and explanations may not always be accurate. Please verify important information independently.
        </Typography>
      </Box>
    </Container>
  );
};

export default AskAI;
