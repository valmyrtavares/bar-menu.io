import React from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from './config-firebase/firebase';

export const GlobalContext = React.createContext();

export const GlobalStorage = ({ children }) => {
  const [image, setImage] = React.useState('');
  const [id, setId] = React.useState('');
  const [isToten, setIsToten] = React.useState(() => {
    return JSON.parse(localStorage.getItem('isToten') || 'false');
  });
  const [authorizated, setAuthorizated] = React.useState(false);
  const [userNewRequest, setUserNewRequest] = React.useState({});
  const [pdvRequest, setPdvRequest] = React.useState(false);
  const [orderBeingEdited, setOrderBeingEdited] = React.useState(null);
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

  const [isInitialLoad, setIsInitialLoad] = React.useState(true);
  const [packageTier, setPackageTier] = React.useState(1);
  const [hasClients, setHasClients] = React.useState(false);
  const [hasRawMaterial, setHasRawMaterial] = React.useState(false);
  const [hasFinancial, setHasFinancial] = React.useState(false);
  const [canConfigToten, setCanConfigToten] = React.useState(false);

  // Listen for global configuration changes
  React.useEffect(() => {
    if (!db) {
      console.warn('Firestore db instance not available in GlobalContext');
      return;
    }
    const unsubscribeNfc = onSnapshot(doc(db, 'GlobalConfig', 'nfcSettings'), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data.enableAutoNfce !== undefined) {
          setEnableAutoNfce(data.enableAutoNfce);
          localStorage.setItem('enableAutoNfce', JSON.stringify(data.enableAutoNfce));
        }
      }
    });

    const unsubscribePackage = onSnapshot(doc(db, 'GlobalConfig', 'packageSettings'), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        if (data.packageTier !== undefined) {
          setPackageTier(Number(data.packageTier));
        }
        setHasClients(!!data.hasClients);
        setHasRawMaterial(!!data.hasRawMaterial);
        setHasFinancial(!!data.hasFinancial);
        setCanConfigToten(!!data.canConfigToten);
      } else {
        // Se não existir, assume o básico por segurança
      }
    });

    return () => {
      unsubscribeNfc();
      unsubscribePackage();
    };
  }, []);

  // Pre-cachear imagens desativado devido a bloqueio de CORS do Firebase Storage
  React.useEffect(() => {
    // const toten = JSON.parse(localStorage.getItem('isToten') || 'false');
    // if (toten && db) {
    //   import('./util/imageCache').then((m) => {
    //     m.precacheAllImages(db);
    //   });
    // }
  }, [db]);

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
        orderBeingEdited,
        setOrderBeingEdited,
        processedOrdersGlobal,
        enableAutoNfce,
        setEnableAutoNfce,
        isInitialLoad,
        setIsInitialLoad,
        packageTier,
        hasClients,
        hasRawMaterial,
        hasFinancial,
        canConfigToten,
        setPackageTier,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
