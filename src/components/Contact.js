import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Accordion, AccordionSummary, AccordionDetails, Link, Grid, TextField, Button } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
  {
    question: "How do I list my property for sale or rent?",
    answer: "Sign up as a seller, go to the Sell page, and fill in the property details form. Your listing will be reviewed by an admin before going live."
  },
  {
    question: "How does the AI price prediction work?",
    answer: "Our AI uses recent market data and property features to estimate a fair price for your property. Try it on the AI Prediction page!"
  },
  {
    question: "How can I contact a seller or buyer?",
    answer: "Once you find a property or receive interest, use the built-in chat feature to communicate securely within the platform."
  },
  {
    question: "Can I switch between buyer and seller roles?",
    answer: "Yes! Visit your Profile page to switch your role at any time."
  },
  {
    question: "Does the application have a multilingual chatbot?",
    answer: "Yes! Our AI chatbot can understand and respond in multiple languages to assist a wider range of users."
  },
  {
    question: "Who do I contact for technical support?",
    answer: "You can reach our support team using the contact details below or email us directly."
  },
];

const Contact = () => {
  const [expanded, setExpanded] = useState(false);
  const [enquiry, setEnquiry] = useState({ name: '', email: '', message: '' });
  const [enquirySent, setEnquirySent] = useState(false);

  const handleAccordion = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleEnquiryChange = e => setEnquiry({ ...enquiry, [e.target.name]: e.target.value });

  const handleEnquirySubmit = async e => {
    e.preventDefault();
    await fetch('http://127.0.0.1:5000/api/enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiry)
    });
    setEnquirySent(true);
    setEnquiry({ name: '', email: '', message: '' });
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={4} sx={{ borderRadius: 4, p: { xs: 2, md: 4 }, background: '#f5faff' }}>
        <Typography variant="h4" align="center" color="primary" gutterBottom>
          Contact Us
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="h6" color="primary" gutterBottom>
                Customer Support
              </Typography>
              <Typography sx={{ mb: 1 }}>
                Email: <Link href="mailto:support@realestate.com" color="primary" fontWeight="bold">support@realestate.com</Link>
              </Typography>
              <Typography sx={{ mt: 2, fontWeight: 'bold' }}>Follow us:</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Link href="https://www.facebook.com/profile.php?id=100011188244726" target="_blank" rel="noopener" color="primary" fontWeight="bold">Facebook</Link>
                <Link href="https://twitter.com/yourpage" target="_blank" rel="noopener" color="primary" fontWeight="bold">Twitter</Link>
                <Link href="https://www.instagram.com/de_nice_boyy/" target="_blank" rel="noopener" color="primary" fontWeight="bold">Instagram</Link>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="primary" gutterBottom>
              Frequently Asked Questions
            </Typography>
            {faqs.map((faq, idx) => (
              <Accordion
                key={idx}
                expanded={expanded === idx}
                onChange={handleAccordion(idx)}
                sx={{ background: '#e3f2fd', mb: 1, borderRadius: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon color="primary" />}>
                  <Typography fontWeight="bold" color="primary">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" color="primary" gutterBottom>Send an Enquiry</Typography>
              {enquirySent && <Typography color="success.main">Your enquiry has been sent!</Typography>}
              <Box component="form" onSubmit={handleEnquirySubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField label="Name" name="name" value={enquiry.name} onChange={handleEnquiryChange} required />
                <TextField label="Email" name="email" value={enquiry.email} onChange={handleEnquiryChange} required />
                <TextField label="Message" name="message" value={enquiry.message} onChange={handleEnquiryChange} required multiline rows={3} />
                <Button type="submit" variant="contained" color="primary">Send</Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Contact;
