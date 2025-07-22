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
    numberOfTimes: undefined,
    recurrent: '',
    multiply: '',
    description: '',
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
    // Verifica se o item já tem um humanId
    const updatedItem = setIdKey(item);

    setEditForm(true);
    setId(item.id);

    setForm({
      name: item.name,
      numberOfTimes: updatedItem.numberOfTimes,
      recurrent: updatedItem.recurrent,
      multiply: updatedItem.multiply,
      description: updatedItem.description,
      humanId: updatedItem.humanId,
    });
  };

  const setIdKey = (item) => {
    if (!item.humanId) {
      const existingIds = listExpenses
        .map((exp) => exp.humanId)
        .filter(Boolean);
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
      const newHumanId = maxId + 1;
      item.humanId = newHumanId;
    }
    return item;
  };

  const renderTableItem = () => {
    if (listExpenses && listExpenses.length > 0) {
    }
    return (
      <div className={style.containerExpensesRegisterTable}>
        <table>
          <thead>
            <tr>
              <th>Identificador</th>
              <th>Nome </th>
              <th>Regularidade </th>
              <th>Simples/Composta </th>
              <th>Editar</th>
              <th>Excluir</th>
            </tr>
          </thead>
          <tbody>
            {listExpenses &&
              listExpenses.length > 0 &&
              listExpenses.map((requestItem, index) => (
                <tr key={index}>
                  <td>{requestItem.humanId}</td>
                  <td>{requestItem.name}</td>
                  <td>
                    {requestItem.recurrent === 'various'
                      ? 'Recorrente'
                      : 'Mensal'}
                  </td>
                  <td>{requestItem.multiply}</td>
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
    const updatedForm = setIdKey({ ...form });
    try {
      if (editForm) {
        if (form.name === undefined) return;
        await replaceDocument('expenses', id, updatedForm);
        setEditForm(false);
      } else {
        const res = await addItemToCollection('expenses', updatedForm);
        if (res) {
          console.log('Item added successfully', res);
          fetchExpenses();
        }
      }
      setForm({
        name: '',
        numberOfTimes: 0,
        recurrent: '',
        multiply: '',
        description: '',
      });
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
          <div
            className={style.inputGroup}
            title="Preencha o titulo de um tipo de despesa recorrente, como Feira, Supermercado, Aluguel. Essa
          lista de despesas aparecerão como opções de despesas na hora de adicionar. Essa é a forma de padronizar tipos de despesas recorrentes.
          Caso tenha um tipo de despesa eventual que não se encaixa em nenhum padrão, cadastre uma despesa com o nome de eventual"
          >
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

          <div
            className={style.inputGroup}
            title="Esse é um importante campo, onde o administrador decide se a despesa tem ou não itens
          Se tem um único valor preenchido, ou se o valor final da despesa é uma soma de todos os itens adicioandos. Esse campo é o que 
          disponibiliza ter ou não o forumlário de itens no tipo de despesa selecionado"
          >
            <label htmlFor="multiply">
              A despesa é composta (vários itens) ou é uma despesa simples
              (único valor)?
            </label>
            <select
              id="multiply"
              required
              value={form.multiply}
              onChange={handleChange}
              className={style.selectInput}
            >
              <option value="">Selecione seu tipo de despesa</option>
              <option value="simples">Simples</option>
              <option value="composto">Composto</option>
            </select>
          </div>

          <div className={style.inputGroup}>
            <label htmlFor="multiply">
              A despesa é mensal ou ocorre várias vezes no mesmo mês?
            </label>
            <select
              id="recurrent"
              required
              onChange={handleChange}
              value={form.recurrent}
              className={style.selectInput}
            >
              <option value="">Selecione a regularidade</option>
              <option value="monthly">Mensal</option>
              <option value="various">Recorrente</option>
            </select>
          </div>
          <div className={style.inputGroup}>
            <Input
              disabled={!form.recurrent}
              id="numberOfTimes"
              autoComplete="off"
              required
              label="Quantidade de parcelas"
              value={form.numberOfTimes}
              type="text"
              onChange={handleChange}
            />
          </div>
          <div
            className={style.inputGroup}
            title="Preencha um texto com uma breve descrição que explique futuramente a um novo administrador 
          o motive de existir e para que serve esse tipo de despesa"
          >
            <Input
              id="description"
              autoComplete="off"
              required
              label="Breve descrição da despesa"
              value={form.description}
              type="text"
              onChange={handleChange}
            />
          </div>
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
