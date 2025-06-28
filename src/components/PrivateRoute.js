// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const PrivateRoute = ({ allowedRoles, children }) => {
  const { user } = useUser(); // Get the user from UserContext

  // Check if the user is logged in and has an allowed role
  if (!user) {
    return <Navigate to="/login" />;  // Redirect to login if no user is logged in
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;  // Redirect to home if role is not allowed
  }

  return children;  // If user has valid role, render the children (the component inside the route)
};

export default PrivateRoute;
