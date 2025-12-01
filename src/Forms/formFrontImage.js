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
  const [url, setUrl] = React.useState('');
  const [progress, setProgress] = React.useState('');
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

  //Navigate
  const navigate = useNavigate();

  //FIRESTORE
  // const db = getFirestore(app);

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

  const onfileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const path = `frontImage/${file.name}`;
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error('Erro no upload:', error.code, error.message);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUrl(downloadURL);
          global.setImage(downloadURL);
          setDoc(doc(db, 'frontImage', 'oIKq1AHF4cHMkqgOcz1h'), {
            image: downloadURL,
          })
            .then(() => {
              console.log('Document successfully updated !');
              console.log('formFrontImage  85');
              navigate('/');
            })
            .catch((error) => {
              console.log(error);
            });
        }
      );
    }
  };
  return (
    <>
      <Link to="/admin/admin">
        <Title mainTitle="Adicione sua marca" />
      </Link>
      <Input
        id="uploadImage"
        label="Upload image"
        type="file"
        onChange={onfileChange}
      />
      <progress value={progress} max="100" />
      {url && <img className="image-preview" src={url} alt="Uploaded file" />}

      <div className="form-check my-1">
        <input
          className="form-check-input"
          id="carrossel"
          type="checkbox"
          checked={publicStatement}
          onChange={changePublicStatement}
        />
        <label className="form-check-label">
          <b>Toten</b>: Manter selecionado para entrar no modo Toten que faráque
          o cliente seja deslogado logo após o envio do pedido e o sistema
          retornará para a tela inicial.
        </label>
      </div>

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
    </>
  );
};

export default FormFrontImage;
