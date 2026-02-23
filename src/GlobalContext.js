import React from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from './config-firebase/firebase';

export const GlobalContext = React.createContext();

export const GlobalStorage = ({ children }) => {
  const [image, setImage] = React.useState('');
  const [id, setId] = React.useState('');
  const [isToten, setIsToten] = React.useState(null);
  const [authorizated, setAuthorizated] = React.useState(false);
  const [userNewRequest, setUserNewRequest] = React.useState({});
  const [pdvRequest, setPdvRequest] = React.useState(false);
  const [warningLowRawMaterial, setWarningLowRawMaterial] = React.useState([]);
  const [enableAutoNfce, setEnableAutoNfce] = React.useState(false);
  const [styles, setStyles] = React.useState({
    btnColor: '#b02121',
    secundaryBgColor: '#b02121',
    bgColor: '#b02121',
    fontColor: 'rgb(230, 235, 230)',
    titleFontColor: '#bd2828',
    titleFont: 'Arial',
    textFont: 'sans serif',
  });

  // Listen for global configuration changes
  React.useEffect(() => {
    if (!db) {
      console.warn('Firestore db instance not available in GlobalContext');
      return;
    }
    const unsubscribe = onSnapshot(doc(db, 'GlobalConfig', 'nfcSettings'), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data.enableAutoNfce !== undefined) {
          setEnableAutoNfce(data.enableAutoNfce);
          // Also sync with localStorage for backward compatibility or components not using context
          localStorage.setItem('enableAutoNfce', JSON.stringify(data.enableAutoNfce));
        }
      }
    });

    return () => unsubscribe();
  }, []);

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
        enableAutoNfce,
        setEnableAutoNfce,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
