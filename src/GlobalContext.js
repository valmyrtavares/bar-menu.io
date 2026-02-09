import React from 'react';

export const GlobalContext = React.createContext();

export const GlobalStorage = ({ children }) => {
  const [image, setImage] = React.useState('');
  const [id, setId] = React.useState('');
  const [isToten, setIsToten] = React.useState(null);
  const [authorizated, setAuthorizated] = React.useState(false);
  const [userNewRequest, setUserNewRequest] = React.useState({});
  const [pdvRequest, setPdvRequest] = React.useState(false);
  const [warningLowRawMaterial, setWarningLowRawMaterial] = React.useState([]);
  const [styles, setStyles] = React.useState({
    btnColor: '#b02121',
    secundaryBgColor: '#b02121',
    bgColor: '#b02121',
    fontColor: 'rgb(230, 235, 230)',
    titleFontColor: '#bd2828',
    titleFont: 'Arial',
    textFont: 'sans serif',
  });

  // [NOVO] Ref global para evitar disparos duplicados de NFC-e em toda a aplicação
  const processedOrdersGlobal = React.useRef(new Set());

  return (
    <GlobalContext.Provider
      value={{
        image,
        setImage,
        warningLowRawMaterial,
        setWarningLowRawMaterial,
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
        setPdvRequest,
        pdvRequest,
        processedOrdersGlobal,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
