import React, { useEffect } from 'react';
import Input from '../../Input';
import provider from '../../../assets/styles/RegisterProvider.module.css';
import CloseBtn from '../../closeBtn';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from '../../../config-firebase/firebase';
import { getBtnData, deleteData } from '../../../api/Api';

const RegisterProvider = ({ setShowPopup }) => {
  const [form, setForm] = React.useState({
    name: '',
    cnpj: '',
  });
  const [listProvider, setListProvider] = React.useState(null);
  const [refreshScreen, setRefreshScreen] = React.useState(false);

  const db = getFirestore(app);

  React.useEffect(() => {
    fetchProvider();
    renderTableItem();
  }, []);

  React.useEffect(() => {
    fetchProvider();
    renderTableItem();
  }, [refreshScreen]);

  const deleteItem = (item) => {
    deleteData('provider', item.id);
    setRefreshScreen((prev) => !prev);
  };

  const fetchProvider = async () => {
    const data = await getBtnData('provider');
    if (data && data.length > 0) {
      setListProvider(data);
    }
  };

  const renderTableItem = () => {
    if (listProvider && listProvider.length > 0) {
    }
    return (
      <table>
        <thead>
          <tr>
            <th>Fornecedor</th>
            <th>CNPJ</th>
            <th>Excluir</th>
          </tr>
        </thead>
        <tbody>
          {listProvider &&
            listProvider.length > 0 &&
            listProvider.map((requestItem, index) => (
              <tr key={index}>
                <td>{requestItem.name}</td>
                <td>{requestItem.cnpj}</td>
                <td onClick={() => deleteItem(requestItem)}>X</td>
              </tr>
            ))}
        </tbody>
      </table>
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    addDoc(collection(db, 'provider'), form).then(() => {
      setRefreshScreen((prev) => !prev);
      setForm({
        name: '',
        cnpj: '',
      });
    });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === 'cnpj') {
      // Remove caracteres não numéricos
      let numericValue = value.replace(/\D/g, '');

      // Limita o número de dígitos a 14 (formato do CNPJ)
      numericValue = numericValue.slice(0, 14);

      // Adiciona a formatação do CNPJ (XX.XXX.XXX/XXXX-XX)
      const formattedCNPJ = numericValue
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/\/(\d{4})(\d)/, '/$1-$2');

      setForm((prevForm) => ({
        ...prevForm,
        [id]: formattedCNPJ,
      }));
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        [id]: value,
      }));
    }
  };

  return (
    <div className={provider.ContainerAddProviderForm}>
      <CloseBtn setClose={setShowPopup} />

      <h1>Adicione um novo fornecedor</h1>

      <form onSubmit={handleSubmit} className="m-1">
        <div className={provider.containerInputs}>
          <Input
            id="name"
            autoComplete="off"
            required
            label="Nome"
            value={form.name}
            type="text"
            onChange={handleChange}
          />
          <Input
            id="cnpj"
            autoComplete="off"
            label="CNPJ"
            value={form.cnpj}
            type="text"
            onChange={handleChange}
          />
        </div>
        <div className={provider.containerBtn}>
          <button className={provider.btn}>Enviar</button>
        </div>
      </form>
      {listProvider && renderTableItem()}
    </div>
  );
};
export default RegisterProvider;
