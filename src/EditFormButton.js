import React from 'react';
import { getBtnData, deleteData } from './api/buttonApi';
import Form from './form';

const EditFormButton = () => {
  const [menuButton, setMenuButton] = React.useState([]);
  const [dishes, setDishes] = React.useState([]);
  const [modalEdit, setModalEdit] = React.useState(false);
  const [dataObj, setDataObj] = React.useState({});

  // React.useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const fetchButton = await getBtnData('button');
  //       setMenuButton(fetchButton);
  //     } catch (error) {
  //       console.error('Error fetching data', error);
  //     }
  //   };
  //   fetchData();
  // }, []);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, dataItem] = await Promise.all([
          getBtnData('button'),
          getBtnData('item'),
        ]);
        setMenuButton(data);
        setDishes(dataItem);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    fetchData();
  }, []);

  async function grabItem(item) {
    alert(
      `Você está prestes a deletar ${item.title} tem certeza que quer fazer isso?`
    );
    let res = item.title
      .replace(/\s/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    //let bastardChildrens = menuButton.filter((item) => item.category === res).dishes.filter((item) => item.category === res);
    let bastardChildrens = [
      ...menuButton.filter((item) => item.category === res),
      ...dishes.filter((item) => item.category === res),
    ];
    console.log(bastardChildrens);

    if (bastardChildrens.length > 0) {
      alert(
        `Você não pode deletar ${item.title} porque ele outros elementos que não podem ser excluidos. Você precisa exclui-los`
      );
      return;
    }
    await fetchData(item.id);
  }

  const fetchData = async (n) => {
    const test = await deleteData('button', n);
  };

  function openModal(item) {
    setModalEdit(true);
    setDataObj(item);
  }

  return (
    <div className="container">
      {modalEdit && <Form dataObj={dataObj} />}
      {menuButton &&
        menuButton.map((item, index) => {
          return (
            <div key={index} className="row my-3">
              <h2 className="col-5">{item.title}</h2>
              <button
                className="btn btn-danger col-3 mx-1"
                onClick={() => grabItem(item)}
              >
                Excluir{' '}
              </button>
              <button
                className="btn btn-warning col-3"
                onClick={() => openModal(item)}
              >
                Editar{' '}
              </button>
            </div>
          );
        })}
    </div>
  );
};

export default EditFormButton;
