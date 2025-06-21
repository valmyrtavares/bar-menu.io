import React from 'react';
import CloseBtn from '../../closeBtn';
import style from '../../../assets/styles/RegisterExpenses.module.scss';
import WarningMessage from '../../WarningMessages';
import Input from '../../Input';
import {
  deleteData,
  addItemToCollection,
  getBtnData,
  replaceDocument,
} from '../../../api/Api';

function RegisterExpenses({ setShowPopup }) {
  const [form, setForm] = React.useState({
    name: '',
  });
  const [listExpenses, setListExpenses] = React.useState(null);
  const [refreshScreen, setRefreshScreen] = React.useState(false);
  const [editForm, setEditForm] = React.useState(false);
  const [id, setId] = React.useState(null);
  const [oldName, setOldName] = React.useState('');
  const [warningMsg, setWarningMsg] = React.useState(false);
  const [productSelectedToExclude, setProductSelectedToExclude] =
    React.useState(null);

  React.useEffect(() => {
    fetchExpenses();
    renderTableItem();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));
  };

  const fetchExpenses = async () => {
    const data = await getBtnData('expenses');
    const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
    if (sortedData && sortedData.length > 0) {
      setListExpenses(sortedData);
    }
  };

  const EditItem = (item) => {
    console.log('EditItem', item);
    setEditForm(true);
    setId(item.id);

    setForm({
      name: item.name,
    });
  };

  const renderTableItem = () => {
    if (listExpenses && listExpenses.length > 0) {
    }
    return (
      <div className={style.containerExpensesRegisterTable}>
        <table>
          <thead>
            <tr>
              <th>Nome da categoria de despesa</th>
              <th>Editar</th>
              <th>Excluir</th>
            </tr>
          </thead>
          <tbody>
            {listExpenses &&
              listExpenses.length > 0 &&
              listExpenses.map((requestItem, index) => (
                <tr key={index}>
                  <td>{requestItem.name}</td>
                  <td
                    className={style.edit}
                    onClick={() => EditItem(requestItem)}
                  >
                    Editar
                  </td>
                  <td
                    className={style.exclude}
                    onClick={() => deleteItem(requestItem)}
                  >
                    X
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  };

  const deleteItem = (item, permissionToExclude = false) => {
    setProductSelectedToExclude(item);
    setWarningMsg(true);
    if (permissionToExclude) {
      deleteData('expenses', item.id);
      fetchExpenses();
      setWarningMsg(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editForm) {
        if (form.name === undefined) return;
        await replaceDocument('expenses', id, form);
        setEditForm(false);
      } else {
        const res = await addItemToCollection('expenses', form);
        if (res) {
          console.log('Item added successfully', res);
          fetchExpenses();
        }
      }
      setForm({ name: '' });
      fetchExpenses();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };
  return (
    <div className={style.ContainerAddExpensesForm}>
      <CloseBtn setClose={setShowPopup} />
      <div className={style.containerWaringMessage}>
        {warningMsg && (
          <WarningMessage
            setWarningMsg={setWarningMsg}
            message={`Você está prestes a excluir ${productSelectedToExclude.name}`}
            sendRequestToKitchen={() =>
              deleteItem(productSelectedToExclude, true)
            }
          />
        )}
      </div>
      <h1>Adicione uma nova categoria de despesa</h1>

      <form onSubmit={handleSubmit} className="m-1">
        <div className={style.containerInputs}>
          <Input
            id="name"
            autoComplete="off"
            required
            label="Nome"
            value={form.name}
            type="text"
            onChange={handleChange}
          />
        </div>
        <div className={style.containerBtn}>
          <button className={style.btn}>
            {editForm ? 'Mandar alterações' : 'Enviar'}
          </button>
        </div>
      </form>
      {listExpenses && renderTableItem()}
    </div>
  );
}

export default RegisterExpenses;
