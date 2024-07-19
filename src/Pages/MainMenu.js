import React from 'react';
import CarrosselImages from '../component/carouselComponent';
import NestedBtn from '../component/nestedBtn';
import { getBtnData } from '../api/Api';
import MenuButton from '../component/menuHamburguerButton';
import RequestModal from '../component/requestModal.js';
import '../assets/styles/mainMenu.css';
import { common } from '@mui/material/colors';

function MainMenu() {
  // const [displayForm, setDisplayForm] = React.useState(false);
  const [menuButton, setMenuButton] = React.useState([]);
  const [dishes, setDishes] = React.useState([]);
  const [nameClient, serNameClient] = React.useState('');
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, dataItem] = await Promise.all([
          getBtnData('button'),
          getBtnData('item'),
        ]);
        setMenuButton(data);
        setDishes(dataItem);
        grabClient();
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    fetchData();
  }, []);

  function grabClient() {
    if (localStorage.hasOwnProperty('userMenu')) {
      const nameCustomer = JSON.parse(localStorage.getItem('userMenu'));
      let firstName = nameCustomer.split(' ')[0];
      firstName =
        firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      serNameClient(firstName);
    }
  }

  return (
    <>
      {showModal && <RequestModal setShowModal={setShowModal} />}
      <div>
        <MenuButton />
        {true && <CarrosselImages />}
        <div className="container-btn">
          {nameClient && (
            <section>
              <p>Bem vindo {nameClient}</p>
              <button onClick={() => setShowModal(!showModal)}>
                Seus Pedidos
              </button>
            </section>
          )}
          {menuButton &&
            dishes &&
            menuButton.map((item, index) => (
              <div key={index}>
                <NestedBtn
                  parent={'main'}
                  item={item}
                  menuButton={menuButton}
                  dishes={dishes}
                />
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
export default MainMenu;
