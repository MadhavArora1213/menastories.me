import React, { createContext, useState, useContext } from 'react';

const TransitionContext = createContext();

export const TransitionProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  return (
    <TransitionContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </TransitionContext.Provider>
  );
};

export const useTransition = () => useContext(TransitionContext);