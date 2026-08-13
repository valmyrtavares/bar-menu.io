import React from 'react';
import { getBtnData, deleteData } from '../api/Api';
import AddButtonForm from './AddButtonForm';
import AddDishesForm from './AddDishesForm';
import { useParams } from 'react-router-dom';
import '../assets/styles/ListToEditAndDelete.css';
import MenuButton from '../component/menuHamburguerButton';
import AddSideDishesForm from './AddSideDishesForm';
import { Link } from 'react-router-dom';
import Title from '../component/title';
//import CloseButton from 'react-bootstrap/CloseButton';

const EditFormButton = () => {
  const [menuButton, setMenuButton] = React.useState([]);
  const [dishes, setDishes] = React.useState([]);
  const [sideDishes, setSideDishes] = React.useState([]);
  const [modalEditButton, setModalEditButton] = React.useState(false); //Open and close Por-up Edit Button
  const [modalEditDishes, setModalEditDishes] = React.useState(false); //Open and close Por-up Edit Dishes
  const [modalEditSideDishes, setModalEditSideDishes] = React.useState(false); //Open and close Por-up Edit SideDishes
  const [dataObj, setDataObj] = React.useState({});
  const [itemToDelete, setItemToDelete] = React.useState(null); // Controls the delete confirmation popup
  const { id } = useParams();

  React.useEffect(() => {
    fetchDataCollection();
  }, []);

  const fetchDataCollection = async () => {
    try {
      const [data, dataItem, sideDishes] = await Promise.all([
        getBtnData('button'),
        getBtnData('item'),
        getBtnData('sideDishes'),
      ]);
      console.log('Dados carregados:', { data, dataItem, sideDishes });
      const sortedDataItem = dataItem.sort((a, b) =>
        (a.title || '').localeCompare(b.title || '')
      );
      const sortedData = data.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      const sortedSideDishes = sideDishes.sort((a, b) =>
        (a.sideDishes || '').localeCompare(b.sideDishes || '')
      );
      setMenuButton(sortedData);
      setDishes(sortedDataItem);
      setSideDishes(sortedSideDishes);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  const handleExcludeClick = (item) => {
    setItemToDelete(item);
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const item = itemToDelete;

    if (id === 'cat') {
      let res = item.title
        .replace(/\s/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

      let bastardChildrens = [
        ...menuButton.filter((i) => i.category === res),
        ...dishes.filter((i) => i.category === res),
      ];

      if (bastardChildrens.length > 0) {
        alert(
          `Você não pode deletar ${item.title} porque ele tem outros elementos vinculados que não podem ser excluídos juntos. Você precisa excluí-los primeiro.`
        );
        setItemToDelete(null);
        return;
      }
      await fetchData('button', item.id);
      await fetchDataCollection();
    } else if (id === 'dishes') {
      await fetchData('item', item.id);
      await fetchDataCollection();
    } else if (id === 'sidedishes') {
      await fetchData('sideDishes', item.id);
      await fetchDataCollection();
    }
    setItemToDelete(null);
  };

  const fetchData = async (collecton, n) => {
    const test = await deleteData(collecton, n);
  };

  //Open All Edit pop forms
  function openModal(item, type) {
    if (type === 'button') {
      setModalEditButton(true);
      setDataObj(item);
    } else if (type === 'dishes') {
      setModalEditDishes(true);
      console.log('ITEM   ', item);
      setDataObj(item);
    } else if (type === 'sidedishes') {
      setModalEditSideDishes(true);
      setDataObj(item);
    }
  }

  // CHECK THIS CODE LINES
  function closeModal() {
    setModalEditButton(false);
    setModalEditDishes(false);
  }

  const titles = {
    cat: 'Edite suas categorias',
    dishes: 'Edite seus Pratos',
    sidedishes: 'Edite seus acompanhamentos',
  };

  return (
    <div className="container" style={{ position: 'relative' }}>
      <Link to="/admin/admin" className="btnBack" title="Sair do Módulo">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </Link>
      {
        <Link to="/admin/admin" style={{ textDecoration: 'none' }}>
          <Title mainTitle={titles[id] || 'Título padrão'} />
        </Link>
      }
      <MenuButton />
      {modalEditButton && (
        <div className="form-position">
          <AddButtonForm
            dataObj={dataObj}
            EditButtonTitle="Edite o Botão"
            setModalEditButton={setModalEditButton}
            fetchDataCollection={fetchDataCollection}
          />
        </div>
      )}
      {menuButton &&
        id === 'cat' &&
        menuButton.map((item, index) => {
          return (
            <div key={index} className="row my-3">
              <h2 className="col-5">{item.title}</h2>
              <button
                className="btn btn-danger col-3 mx-1"
                onClick={() => handleExcludeClick(item)}
              >
                Excluir{' '}
              </button>
              <button
                className="btn btn-warning col-3"
                onClick={() => openModal(item, 'button')}
              >
                Editar{' '}
              </button>
            </div>
          );
        })}
      {modalEditDishes && (
        <div className="form-position">
          {/* <CloseButton onClick={() => closeModal()} /> */}
          <AddDishesForm
            dataObj={dataObj}
            mainTitle="Edite o Prato"
            setShowPopupSideDisehs={setModalEditDishes}
            closeModal={closeModal}
            fetchDataCollection={fetchDataCollection}
          />
        </div>
      )}
      {dishes &&
        id === 'dishes' &&
        dishes.map((item, index) => {
          return (
            <div key={index} className="row my-3">
              <h2 className="col-5 title-dishes">{item.title}</h2>
              <button
                className="btn btn-danger col-3 mx-1"
                onClick={() => handleExcludeClick(item)}
              >
                Excluir{' '}
              </button>
              <button
                className="btn btn-warning col-3"
                onClick={() => openModal(item, 'dishes')}
              >
                Editar{' '}
              </button>
            </div>
          );
        })}
      {/* IMPLEMENTING NEW EDIT POP-UP SIDE DISHES */}

      {modalEditSideDishes && (
        <div className="form-position">
          <AddSideDishesForm
            dataObj={dataObj}
            EditSideDishesTitle="Edite o Acompanhamento"
            setModalEditSideDishes={setModalEditSideDishes}
            fetchDataCollection={fetchDataCollection}
          />
        </div>
      )}

      {/* {************************************************} */}
      {sideDishes &&
        id === 'sidedishes' &&
        sideDishes.map((item, index) => {
          return (
            <div key={index} className="row my-3">
              <h2 className="col-5 title-dishes">{item.sideDishes}</h2>
              <button
                className="btn btn-danger col-3 mx-1"
                onClick={() => handleExcludeClick(item)}
              >
                Excluir{' '}
              </button>
              <button
                className="btn btn-warning col-3"
                onClick={() => openModal(item, 'sidedishes')}
              >
                Editar{' '}
              </button>
            </div>
          );
        })}

      {itemToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', maxWidth: '400px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <h3 style={{ color: '#d9534f', marginBottom: '15px' }}>Atenção</h3>
            <p style={{ fontSize: '1.1rem', marginBottom: '20px' }}>
              Você está prestes a deletar <strong>{itemToDelete.title || itemToDelete.sideDishes}</strong>. Tem certeza que quer fazer isso?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button className="btn btn-secondary" onClick={cancelDelete} style={{ padding: '8px 20px' }}>Não Excluir</button>
              <button className="btn btn-danger" onClick={confirmDelete} style={{ padding: '8px 20px' }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditFormButton;
