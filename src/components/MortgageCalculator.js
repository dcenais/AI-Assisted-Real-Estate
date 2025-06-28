import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';

const MortgageCalculator = () => {
  const [principal, setPrincipal] = useState('');
  const [years, setYears] = useState('');
  const [rate, setRate] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleInput = (setter) => (e) => {
    setter(e.target.value.replace(/[^0-9.]/g, ''));
    setError('');
  };

  const calculate = () => {
    setError('');
    setResult(null);

    // Input validation
    if (!principal || !years || !rate) {
      setError('Please fill in all fields.');
      return;
    }
    const P = parseFloat(principal);
    const n = parseInt(years) * 12;
    const r = parseFloat(rate) / 100 / 12;

    if (isNaN(P) || isNaN(n) || isNaN(r) || P <= 0 || n <= 0 || r <= 0) {
      setError('Please enter valid positive numbers.');
      return;
    }

    // Malaysian loan logic: standard reducing balance formula
    const monthly = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setResult(monthly.toFixed(2));
    setPrincipal('');
    setYears('');
    setRate('');
  };

  const handleRecalculate = () => {
    setResult(null);
    setError('');
  };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      {!result && (
        <>
          <TextField
            label="Loan Amount (RM)"
            type="number"
            value={principal}
            onChange={handleInput(setPrincipal)}
            size="small"
            sx={{ mr: 1, mb: 1 }}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Loan Tenure (Years)"
            type="number"
            value={years}
            onChange={handleInput(setYears)}
            size="small"
            sx={{ mr: 1, mb: 1 }}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Interest Rate (%)"
            type="number"
            value={rate}
            onChange={handleInput(setRate)}
            size="small"
            sx={{ mr: 1, mb: 1 }}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <Button variant="contained" onClick={calculate} sx={{ mb: 1 }}>
            Calculate
          </Button>
        </>
      )}
      {result && (
        <Box>
          <Typography sx={{ mt: 1 }}>
            Monthly Payment: <b>RM {result}</b>
          </Typography>
          <Button variant="outlined" onClick={handleRecalculate}>
            Recalculate
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default MortgageCalculator;