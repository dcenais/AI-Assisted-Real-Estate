import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './contexts/UserContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Buy from './components/Buy';
import Sell from './components/Sell';
import Rent from './components/Rent';
import Liked from './components/Liked';
import AskAI from './components/AskAI';
import Contact from './components/Contact';
import Chatbot from './components/Chatbot';
import PrivateRoute from './components/PrivateRoute';
import RentPropertyDetails from './components/RentPropertyDetails';


// Admin pages
import AdminRequest from './components/AdminRequest';
import AdminVerifiedListings from './components/AdminVerifiedListings';

// Import PropertyDetails for displaying property details
import PropertyDetails from './components/PropertyDetails';
import Profile from './components/Profile';
import ChatSeller from './components/ChatSeller';
import ChatBuyer from './components/ChatBuyer';

function App() {
  return (
    <UserProvider> {/* Wrap the app inside UserProvider */}
      <Router>
        <Navbar />  {/* Navbar Component */}
        <div style={{ padding: '1rem' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes (PrivateRoute) */}
            <Route path="/buy" element={<PrivateRoute allowedRoles={['buyer']}><Buy /></PrivateRoute>} />
            <Route path="/sell" element={<PrivateRoute allowedRoles={['seller']}><Sell /></PrivateRoute>} />
            <Route path="/rent" element={<PrivateRoute allowedRoles={['buyer', 'seller',]}><Rent /></PrivateRoute>} />
            <Route path="/liked" element={<PrivateRoute allowedRoles={['buyer', 'seller']}><Liked /></PrivateRoute>} />
            <Route path="/ask-ai" element={<PrivateRoute allowedRoles={['buyer', 'seller']}><AskAI /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute allowedRoles={['buyer', 'seller', 'admin']}><Profile /></PrivateRoute>} />
            <Route path="/chat-seller" element={<PrivateRoute allowedRoles={['buyer']}><ChatSeller /></PrivateRoute>} />
            <Route path="/chat-buyer" element={<PrivateRoute allowedRoles={['seller']}><ChatBuyer /></PrivateRoute>} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Admin Specific Routes */}
            <Route path="/request" element={<PrivateRoute allowedRoles={['admin']}><AdminRequest /></PrivateRoute>} />
            <Route path="/verified" element={<PrivateRoute allowedRoles={['admin']}><AdminVerifiedListings /></PrivateRoute>} />

            {/* Route for Property Details */}
            <Route path="/buy/property/:propertyId" element={<PropertyDetails />} />
            <Route path="/rent/property/:propertyId" element={<RentPropertyDetails />} />

            {/* Redirect all unknown routes to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
      <Chatbot />  {/* Chatbot Component */}
    </UserProvider>
  );
}

export default App;


