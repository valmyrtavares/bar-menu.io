import React from 'react';

export const GlobalContext = React.createContext();

export const GlobalStorage = ({ children }) => {
  const [image, setImage] = React.useState('');
  const [id, setId] = React.useState('');
  const [isToten, setIsToten] = React.useState(null);
  const [authorizated, setAuthorizated] = React.useState(false);
  const [userNewRequest, setUserNewRequest] = React.useState({});
  const [styles, setStyles] = React.useState({
    btnColor: '#b02121',
    secundaryBgColor: '#b02121',
    bgColor: '#b02121',
    fontColor: 'rgb(230, 235, 230)',
    titleFontColor: '#bd2828',
    titleFont: 'Arial',
    textFont: 'sans serif',
  });

  return (
    <GlobalContext.Provider
      value={{
        image,
        setImage,
        id,
        setId,
        styles,
        setStyles,
        authorizated,
        setAuthorizated,
        setIsToten,
        isToten,
        userNewRequest,
        setUserNewRequest,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
