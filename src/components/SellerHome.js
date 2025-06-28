import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Button, Container, CircularProgress, TextField } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const MarketAnalytics = ({ data, loading }) => (
  <Box sx={{ width: '100%', height: 280, borderRadius: 2, boxShadow: 3, backgroundColor: '#fff' }}>
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    ) : (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" minTickGap={30} tick={{ fontSize: 10 }} />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="index" stroke="#1976d2" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    )}
  </Box>
);

const LoanCalculator = () => (
  <Box>
    <TextField label="Loan Amount (RM)" variant="outlined" fullWidth sx={{ mb: 2 }} />
    <TextField label="Loan Tenure (Years)" variant="outlined" fullWidth sx={{ mb: 2 }} />
    <TextField label="Interest Rate (%)" variant="outlined" fullWidth sx={{ mb: 2 }} />
    <Button variant="contained" color="primary">Calculate</Button>
  </Box>
);

const SellerHome = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('http://127.0.0.1:5000/api/market-analytics')
      .then(r => r.json())
      .then(data => {
        setMarketData(data);
        setLoading(false);
      })
      .catch(() => {
        setMarketData([]);
        setLoading(false);
      });
  }, []);

  return (
    <Container
      maxWidth="lg"
      disableGutters
      sx={{
        minHeight: '100vh',
        bgcolor: '#f4f7fc',
        py: 4,
        paddingTop: { xs: 6, sm: 8 }
      }}
    >
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start'
        }}
      >
        {/* PAGE TITLE */}
        <Typography
          variant="h3"
          fontWeight={800}
          color="primary"
          gutterBottom
          sx={{ mb: 4, textAlign: 'center', fontFamily: 'Arial, sans-serif', fontSize: '2rem' }}
        >
          Sell Properties
        </Typography>

        {/* WHY SELL WITH US */}
        <Grid container spacing={2} sx={{ mb: 6 }} justifyContent="center">
          <Grid item xs={12}>
            <Paper sx={{ p: 4, borderRadius: 2, boxShadow: 2, backgroundColor: '#ffffff' }}>
              <Typography
                variant="h5"
                fontWeight={700}
                color="primary"
                sx={{ mb: 3, textAlign: 'center', letterSpacing: 0.5, fontSize: '1.4rem' }}
              >
                Why Choose Us?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  textAlign: 'left',
                  color: 'text.secondary',
                  fontSize: '1rem',
                  lineHeight: 1.5
                }}
              >
                Our platform offers an unparalleled property-selling experience. Here’s why selling through us is the best choice for you:
                <ul>
                  <li><strong>Verified Buyers:</strong> Reach a large pool of verified and serious buyers for your property.</li>
                  <li><strong>AI-Powered Price Predictions:</strong> Benefit from advanced AI technology that provides instant, data-driven price estimates and recommendations based on current market trends.</li>
                  <li><strong>Easy Listing Management:</strong> Manage your listings, documents, and buyer chats all in one place.</li>
                </ul>
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* MARKET ANALYTICS & LOAN CALCULATOR */}

        <Grid item xs={12} md={8}> {/* Market Analytics takes 70% width */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%'
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: "#1976d2", fontSize: '1.1rem' }}>
              Market Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Real Residential Property Prices for Malaysia (1988-2024)
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <MarketAnalytics data={marketData} loading={loading} />
            </Box>
          </Paper>
        </Grid>
        {/* Real Residential Property Prices for Malaysia (Graph Explanation) */}
        <Grid item xs={12} md={8}> {/* Market Analytics (Graph) Explanation */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: "#1976d2", fontSize: '1.1rem' }}>
              Real Residential Property Prices for Malaysia
            </Typography>
            <Typography
              variant="body1"
              sx={{ textAlign: 'left', color: 'text.secondary', fontSize: '1rem', lineHeight: 1.5 }}
            >
              The graph above displays the historical trend of residential property prices in Malaysia.
              It provides an overview of the market's performance, with key data points showing how property
              prices have fluctuated over time.
              <br /><br />
              Key insights from the graph:
              <ul>
                <li><strong>Upward trend:</strong> The graph indicates an increase in property prices over time, reflecting rising demand and growth in the market.</li>
                <li><strong>Fluctuations:</strong> Notice the periodic fluctuations, which may be influenced by economic conditions, supply-demand dynamics, and government policies.</li>
                <li><strong>Market Recovery:</strong> A sharp increase in the recent months shows a potential market recovery, likely influenced by post-pandemic growth and urban development.</li>
              </ul>
              Understanding these trends can help investors make informed decisions about the right time to buy, sell, or hold properties.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}> {/* Loan Calculator takes 30% width */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%'
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: "#1976d2", fontSize: '1.1rem' }}>
              Loan Calculator
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <LoanCalculator />
            </Box>
          </Paper>
        </Grid>

        {/* Loan Calculator Explanation */}
        <Grid item xs={12} md={4}> {/* Loan Calculator Explanation */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: 2,
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: "#1976d2", fontSize: '1.1rem' }}>
              Loan Calculator: Calculate Your Mortgage
            </Typography>
            <Typography
              variant="body1"
              sx={{ textAlign: 'left', color: 'text.secondary', fontSize: '1rem', lineHeight: 1.5 }}
            >
              The loan calculator helps you determine the monthly payments on your mortgage based on the loan amount, tenure, and interest rate.
              <br /><br />
              <ul>
                <li><strong>Loan Amount (RM):</strong> This is the total amount you plan to borrow from the bank. It typically depends on the property price and your down payment.</li>
                <li><strong>Loan Tenure (Years):</strong> This is the number of years over which you plan to repay the loan. The longer the tenure, the lower the monthly payment, but more interest is paid over time.</li>
                <li><strong>Interest Rate (%):</strong> The interest rate is the cost of borrowing money from the bank. It’s usually annual and can significantly affect the total repayment amount.</li>
              </ul>
              <br />
              Simply enter the loan details and click "Calculate" to view your estimated monthly payments. Use this tool to compare different loan options and find the best fit for your budget.
            </Typography>
          </Paper>
        </Grid>

      </Box>
    </Container>
  );
};

export default SellerHome;
