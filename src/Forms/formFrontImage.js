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
    </div>
    </>
  );
};

export default FormFrontImage;
