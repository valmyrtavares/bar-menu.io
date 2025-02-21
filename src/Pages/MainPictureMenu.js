import React from 'react';
import style from '../assets/styles/MainPictureMenu.module.scss';
import { getBtnData, getOneItemColleciton, deleteData } from '../api/Api';

const MainPictureMenu = () => {
  const [dishes, setDishes] = React.useState([]);
  const [menuButton, setMenuButton] = React.useState([]);
  const [dishesFiltered, setDishesFiltered] = React.useState([]);
  const [categorySelected, setCategorySelected] = React.useState('');

  React.useState(() => {
    const fetchData = async () => {
      try {
        const [data, dataItem] = await Promise.all([
          getBtnData('button'),
          getBtnData('item'),
        ]);
        setMenuButton(data);
        setDishes(dataItem);
      } catch (error) {
        console.error('Erro fetching data', error);
      }
    };
    fetchData();
  });

  const chooseCategory = (parent, title) => {
    console.log('Essa é a minha categoria   ', parent);
    if (dishes && dishes.length > 0) {
      const filtered = dishes.filter((item) => item.category === parent);
      setDishesFiltered(filtered);
      setCategorySelected(title);
    }
  };

  return (
    <div className={style.containerPictureMenu}>
      <div className={style.submenu}>
        <nav className={style.categories}>
          {menuButton &&
            menuButton.length > 0 &&
            menuButton.map((item, index) => (
              <div
                className={style.categoryItem}
                onClick={() => chooseCategory(item.parent, item.title)}
              >
                <h3>{item.title}</h3>
                <img
                  src="https://i.pinimg.com/736x/fe/23/38/fe2338260fb041d8d94999fe48cb218f.jpg"
                  alt=""
                />
              </div>
            ))}
        </nav>
        <section className={style.dishes}>
          <h3>{categorySelected}</h3>
          <div className={style.subContainer}>
            {dishesFiltered &&
              dishesFiltered.length > 0 &&
              dishesFiltered.map((item, index) => (
                <div className={style.itemContainer}>
                  <div className={style.text}>
                    <h3>{item.title}</h3>
                    <p>{item.comment}</p>
                    <button>Faça o seu pedido</button>
                  </div>
                  <div className={style.image}>
                    <img src={item.image} alt="" />
                  </div>
                </div>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
};
export default MainPictureMenu;
