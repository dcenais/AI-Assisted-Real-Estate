import React from 'react';
import { Typography, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MarketAnalytics = ({ data }) => {
  // Convert ISO date string to Date object for recharts
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).getTime() // convert to number
  }));

  const tickFormatter = (tick) => {
    const date = new Date(tick);
    if (isNaN(date)) return tick;
    return date.toLocaleDateString();
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
        Malaysia Real Residential Property Price Index (2010=100)
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        <b>What is the Property Price Index?</b> The Property Price Index (PPI) tracks changes in residential property prices over time. This chart uses <b>real</b> prices, which are adjusted for inflation, giving a more accurate picture of property value and affordability in Malaysia.
        <br /><br />
        <b>How can you use this?</b> Understanding real property prices helps you judge whether property values are truly rising, stable, or falling after considering inflation. This is crucial for making informed decisions about when to buy or invest in property, as a rising nominal price may not always mean better value.
      </Typography>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            minTickGap={20}
            tickFormatter={tickFormatter}
            type="number"
            domain={['auto', 'auto']}
            scale="time"
          />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip
            formatter={v => v && v.toFixed ? v.toFixed(2) : v}
            labelFormatter={l => `Quarter: ${new Date(l).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })}`}
          />
          <Legend />
          <Line type="monotone" dataKey="index" name="Price Index" stroke="#1565c0" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <Typography variant="body2" sx={{ mt: 2 }}>
        Data source: Uploaded CSV. Index, 2010=100. Data is quarterly, real (inflation-adjusted), and not seasonally adjusted.
      </Typography>
    </Box>
  );
};

export default MarketAnalytics;