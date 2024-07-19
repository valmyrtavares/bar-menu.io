import React from 'react';

export const GlobalContext = React.createContext();

export const GlobalStorage = ({ children }) => {
  const [image, setImage] = React.useState('');
  const [id, setId] = React.useState('');
  return (
    <GlobalContext.Provider value={{ image, setImage, id, setId }}>
      {children}
    </GlobalContext.Provider>
  );
};
