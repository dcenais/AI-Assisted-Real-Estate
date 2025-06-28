import React, { createContext, useState } from 'react';

export const LikedContext = createContext();

export const LikedProvider = ({ children }) => {
  const [likedProperties, setLikedProperties] = useState([]);

  const addProperty = (property) => {
    setLikedProperties((prev) => {
      if (prev.find((p) => p.id === property.id)) return prev;
      return [...prev, property];
    });
  };

  const removeProperty = (id) => {
    setLikedProperties((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <LikedContext.Provider value={{ likedProperties, addProperty, removeProperty }}>
      {children}
    </LikedContext.Provider>
  );
};
