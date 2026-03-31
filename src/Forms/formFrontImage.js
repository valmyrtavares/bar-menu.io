import React from 'react';
import Input from '../component/Input';

import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, db, getFirestore } from '../config-firebase/firebase';
import { setDoc, doc, updateDoc } from 'firebase/firestore';

import { GlobalContext } from '../GlobalContext.js';
import '../assets/styles/form.css';
import Title from '../component/title.js';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
//import { cardClasses } from "@mui/material";
import useLocalStorage from '../Hooks/useLocalStorage.js';

const FormFrontImage = () => {
  const global = React.useContext(GlobalContext);
  const [publicStatement, setPublicStatement] = useLocalStorage(
    'isToten',
    false
  );
  const [modePictureMobilePhone, setModePictureMobilePhone] = useLocalStorage(
    'modePictureMobile',
    false
  );
  const [pdv, setPdv] = useLocalStorage('pdv', false);
  const [autoPaymentMachineOn, setautoPaymentMachineOn] = useLocalStorage(
    'autoPaymentMachineOn',
    false
  );
  // Removed local useLocalStorage for enableAutoNfce, now using global.enableAutoNfce
  
  // Local state for delivery settings
  const [localCep, setLocalCep] = React.useState('');
  const [localDistance, setLocalDistance] = React.useState(1);
  const [isSavingDelivery, setIsSavingDelivery] = React.useState(false);

  // Sync local state when global values load initially
  React.useEffect(() => {
    if (global.establishmentCep) setLocalCep(global.establishmentCep);
    if (global.maxDeliveryDistance !== undefined) setLocalDistance(global.maxDeliveryDistance);
  }, [global.establishmentCep, global.maxDeliveryDistance]);

  //Navigate
  const navigate = useNavigate();

  //FIRESTORE

  React.useEffect(() => {
    if (publicStatement && modePictureMobilePhone) {
      if (publicStatement) {
        setModePictureMobilePhone(false);
        alert(
          'O aplicativo está em modo Totem, ele não pode ser usado em um celular.'
        );
      } else if (modePictureMobilePhone) {
        setPublicStatement(false);
        alert(
          'O aplicativo está em modo de imagem de celular, ele não pode ser usado como Totem.'
        );
      }
    }
    if (pdv && publicStatement) {
      if (publicStatement) {
        setPublicStatement(false);
        alert(
          'O aplicativo está em modo Totem, ele não pode ser usado em PDV.'
        );
      } else if (pdv) {
        setPdv(false);
        alert(
          'O aplicativo está em modo PDV, ele não pode ser usado como Totem.'
        );
      }
    }
  }, [publicStatement, modePictureMobilePhone, pdv]);

  const changePublicStatement = () => {
    setPublicStatement((prev) => !prev);
  };

  const changeModePdv = () => {
    setPdv((prev) => !prev);
  };

  const changeAutoPayment = () => {
    setautoPaymentMachineOn((prev) => !prev);
  };

  const changeAutomaticFiscalIssuance = async () => {
    const newValue = !global.enableAutoNfce;
    try {
      const docRef = doc(db, 'GlobalConfig', 'nfcSettings');
      await setDoc(docRef, { enableAutoNfce: newValue }, { merge: true });
      console.log('Global configuration updated!');
    } catch (error) {
      console.error('Error updating global configuration: ', error);
    }
  };

  const handleCepChange = (value) => {
    let cepValue = value.replace(/\D/g, '');
    if (cepValue.length > 8) cepValue = cepValue.slice(0, 8);
    
    let formattedCep = cepValue;
    if (cepValue.length > 5) {
      formattedCep = cepValue.slice(0, 5) + '-' + cepValue.slice(5);
    } else {
      formattedCep = cepValue;
    }
    setLocalCep(formattedCep);
  };

  const saveDeliverySettings = async () => {
    if (isSavingDelivery) return;
    setIsSavingDelivery(true);
    
    let cepValue = localCep.replace(/\D/g, '');
    let coords = global.establishmentCoords || null;

    try {
      const docRef = doc(db, 'GlobalConfig', 'deliverySettings');
      
      // Update coordinates only if CEP is valid 8 digits
      if (cepValue.length === 8) {
        const viaCepRes = await fetch(`https://viacep.com.br/ws/${cepValue}/json/`);
        const viaCepData = await viaCepRes.json();
        
        if (!viaCepData.erro) {
          const addressParams = `street=${encodeURIComponent(viaCepData.logradouro)}&city=${encodeURIComponent(viaCepData.localidade)}&state=${encodeURIComponent(viaCepData.uf)}&country=Brasil`;
          const nominatimRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&${addressParams}&limit=1`, {
            headers: { 'User-Agent': 'bar-menu-admin-app' }
          });
          const nominatimData = await nominatimRes.json();
          
          if (nominatimData && nominatimData.length > 0) {
            coords = {
              lat: parseFloat(nominatimData[0].lat),
              lng: parseFloat(nominatimData[0].lon)
            };
          }
        }
      }

      await setDoc(docRef, { 
        maxDeliveryDistance: Number(localDistance),
        establishmentCep: localCep,
        establishmentCoords: coords
      }, { merge: true });

      alert('Configurações de entrega salvas com sucesso!');
    } catch (error) {
      console.error('Error saving delivery settings:', error);
      alert('Erro ao salvar configurações de entrega.');
    } finally {
      setIsSavingDelivery(false);
    }
  };

  const changeModePicture = () => {
    const isChecked = document.getElementById('modePicture').checked;
    console.log('Fui chamado', isChecked);
    const updateMenuPictureMode = async (value) => {
      try {
        const docRef = doc(db, 'PictureMode', '7OQE7SP75uGlSokNrpNE');
        await updateDoc(docRef, { menuPictureMode: value });
        console.log('Document successfully updated!');
      } catch (error) {
        console.error('Error updating document: ', error);
      }
    };

    updateMenuPictureMode(isChecked);
    setModePictureMobilePhone((prev) => !prev);
  };

  React.useState(() => {
    console.log('publicStatement   ', publicStatement);
  }, [publicStatement]);

  return (
    <>
      <Link to="/admin/admin">
        <Title mainTitle="Configurações do Terminal" />
      </Link>

      <div className="p-1">
        <p className="text-secondary mb-4">
          Defina como este computador deve se comportar no sistema. 
          As opções marcadas abaixo afetam apenas este terminal (exceto a emissão de notas).
        </p>

      {global.canConfigToten && (
        <div className="form-check my-1">
          <input
            className="form-check-input"
            id="carrossel"
            type="checkbox"
            checked={publicStatement}
            onChange={changePublicStatement}
          />
          <label className="form-check-label">
            <b>Toten</b>: Manter selecionado para entrar no modo Toten que
            faráque o cliente seja deslogado logo após o envio do pedido e o
            sistema retornará para a tela inicial.
          </label>
        </div>
      )}

      {/*} <div className="form-check my-1">
        <input
          className="form-check-input"
          id="modePicture"
          type="checkbox"
          checked={modePictureMobilePhone}
          onChange={changeModePicture}
        />
        <label className="form-check-label">
          Para acionar o modo de imagem de celular, mantenha selecionado. node
          os botões serão substituidos por imagens.
        </label>
      </div>*/}

      <div className="form-check my-1">
        <input
          className="form-check-input"
          id="autoPaymentMachineOn"
          type="checkbox"
          checked={autoPaymentMachineOn}
          onChange={changeAutoPayment}
        />
        <label className="form-check-label">
          <b>Auto Pagamento</b>: Manter clicado para usar a maquina de auto
          pagamento
        </label>
      </div>

      <div className="form-check my-1">
        <input
          className="form-check-input"
          id="pdv"
          type="checkbox"
          checked={pdv}
          onChange={changeModePdv}
        />
        <label className="form-check-label">
          <b>PDV</b>: Manter clicado para entrar no modo PDV (Ponto de Venda)
          que habilita a tela para uso em caixas de restaurantes.
        </label>
      </div>

      <div className="form-check my-1">
        <input
          className="form-check-input"
          id="automaticFiscalIssuance"
          type="checkbox"
          checked={global.enableAutoNfce}
          onChange={changeAutomaticFiscalIssuance}
        />
        <label className="form-check-label">
          <b>Emissão de Notas Automática</b>: Quando selecionado, o sistema emite
          automaticamente a NFC-e após a confirmação do pagamento.
        </label>
      </div>

      {global.hasClients && (
        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <h5 className="mb-3">Configurações de Entrega</h5>
          <div className="form-check my-2 d-flex align-items-center">
            <label className="form-check-label flex-grow-1">
              <b>CEP do Estabelecimento</b> (Origem da rota):
            </label>
            <input
              type="text"
              className="form-control form-control-sm ms-2"
              style={{ width: '110px', padding: '2px 5px', height: 'auto' }}
              value={localCep}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
            />
          </div>

          <div className="form-check my-2 d-flex align-items-center">
            <label className="form-check-label flex-grow-1">
              <b>Distancia máxima</b> permitida para entrega:
            </label>
            <input
              type="number"
              className="form-control form-control-sm ms-2"
              style={{ width: '60px', padding: '2px 5px', height: 'auto' }}
              value={localDistance}
              onChange={(e) => setLocalDistance(e.target.value)}
              min="0"
              step="0.1"
            />
            <span className="ms-1 form-check-label">Km</span>
          </div>

          <div className="mt-3 d-flex justify-content-end">
            <button 
              className="btn btn-primary btn-sm"
              onClick={saveDeliverySettings}
              disabled={isSavingDelivery}
            >
              {isSavingDelivery ? 'Salvando...' : 'Salvar Configurações de Entrega'}
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default FormFrontImage;
