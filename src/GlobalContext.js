import React from 'react';

export const GlobalContext = React.createContext();

export const GlobalStorage = ({ children }) => {
  const [image, setImage] = React.useState('');
  return (
    <GlobalContext.Provider value={{ image, setImage }}>
      {children}
    </GlobalContext.Provider>
  );
};
