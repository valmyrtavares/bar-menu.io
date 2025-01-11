import React from 'react';
import Title from '../component/title';
import Input from '../component/Input';
import { app } from '../config-firebase/firebase.js';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getBtnData } from '../api/Api';
import { Link } from 'react-router-dom';

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
  const db = getFirestore(app);
  const navigate = useNavigate();

  React.useEffect(() => {
    async function getSytylesData() {
      const data = await getBtnData('styles');
      console.log(data);
      setForm(data[1]);
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

  return (
    <>
      <Link to="/admin/admin">
        <Title mainTitle="Gerenciando Estilos" />
      </Link>
      <form onSubmit={handleSubmit} className="m-1">
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
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
export default ScreenStylesForm;
