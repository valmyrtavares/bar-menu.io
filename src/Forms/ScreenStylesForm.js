import React from 'react';
import Title from '../component/title';
import Input from '../component/Input';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config-firebase/firebase.js';
import {
  setDoc,
  doc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getOneItemColleciton } from '../api/Api';
import { Link } from 'react-router-dom';
import { GlobalContext } from '../GlobalContext.js';
import style from '../assets/styles/ScreenStylesForm.module.scss';

function ScreenStylesForm() {
  const [form, setForm] = React.useState({
    btnColor: '',
    bgColor: '',
    fontColor: '',
    titleFontColor: '',
    titleFont: '',
    textFont: '',
    secundaryBgColor: '',
  });
  const [url, setUrl] = React.useState('');
  const [progress, setProgress] = React.useState('');
  const global = React.useContext(GlobalContext);

  const navigate = useNavigate();

  React.useEffect(() => {
    async function getSytylesData() {
      try {
        const data = await getOneItemColleciton('styles', 'Ka5eQA5um9W3vA5gyV70');
        console.log(data);
        setForm(data);
      } catch (error) {
        console.error('Error fetching styles:', error);
      }
    }
    getSytylesData();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();
    setDoc(doc(db, 'styles', 'Ka5eQA5um9W3vA5gyV70'), form)
      .then((docRef) => {
        navigate('/');
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function handleChange({ target }) {
    const { id, value } = target;
    setForm({
      ...form,
      [id]: value,
    });
  }
  
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
              console.log('Logo successfully updated !');
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
        <Title mainTitle="Marca e Estilo" />
      </Link>
      <div className="m-1">
        <div className="logo-upload-section mb-4 p-3 border rounded shadow-sm">
          <h5 className="mb-3">Logotipo do Restaurante</h5>
          <Input
            id="uploadImage"
            label="Carregar nova logomarca"
            type="file"
            onChange={onfileChange}
          />
          <progress className="w-100" value={progress} max="100" />
          {(url || global.image) && (
            <div className="mt-2 text-center">
              <img 
                className="image-preview" 
                src={url || global.image} 
                alt="Logo Atual" 
                style={{ maxHeight: '100px', objectFit: 'contain' }}
              />
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit}>
        <Input
          id="btnColor"
          label="Cor dos botões"
          value={form.btnColor}
          type="color"
          onChange={handleChange}
        />
        <Input
          id="bgColor"
          label="Cor de Fundo geral"
          value={form.bgColor}
          type="color"
          onChange={handleChange}
        />
        <Input
          id="secundaryBgColor"
          label="Cor de Fundo secundário"
          value={form.secundaryBgColor}
          type="color"
          onChange={handleChange}
        />
        <Input
          id="fontColor"
          label="Cor de Texto"
          value={form.fontColor}
          type="color"
          onChange={handleChange}
        />
        <Input
          id="titleFontColor"
          label="Cor dos Títulos"
          value={form.titleFontColor}
          type="color"
          onChange={handleChange}
        />
        <div className="my-3">
          <label className="form-label">Fontes de Títulos</label>
          <select
            id="titleFont"
            value={form.titleFont}
            className="form-select"
            onChange={handleChange}
          >
            <option disabled value="">
              Selecione sua fonte
            </option>
            <option value="Arial">Arial</option>
            <option value="impact">Impact</option>
            <option value="sans serif ">Snas Serif</option>
          </select>
        </div>
        <div className="my-3">
          <label className="form-label">Fontes de Textos</label>
          <select
            id="textFont"
            value={form.textFont}
            className="form-select"
            onChange={handleChange}
          >
            <option disabled value="">
              Selecione sua fonte
            </option>
            <option value="impact">Impact</option>
            <option value="Arial">Arial</option>
            <option value="sans serif ">Snas Serif</option>
          </select>
        </div>
        <div className={style.formButtonSubmit}>
          <button type="submit">Salve suas modificações</button>
        </div>
      </form>
    </div>
    </>
  );
}
export default ScreenStylesForm;
