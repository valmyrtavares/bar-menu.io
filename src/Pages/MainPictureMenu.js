import React from 'react';
import style from '../assets/styles/MainPictureMenu.module.scss';
import { getBtnData, getOneItemColleciton, deleteData } from '../api/Api';

const MainPictureMenu = () => {
  const [dishes, setDishes] = React.useState([]);
  const [menuButton, setMenuButton] = React.useState([]);
  const [dishesFiltered, setDishesFiltered] = React.useState([]);

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

  const chooseCategory = (parent) => {
    console.log('Essa é a minha categoria   ', parent);
    if (dishes && dishes.length > 0) {
      const filtered = dishes.filter((item) => item.category === parent);
      setDishesFiltered(filtered);
    }
  };

  return (
    <div className={style.containerPictureMenu}>
      <h1>Novo layout menu</h1>
      <div className={style.submenu}>
        <nav className={style.categories}>
          {menuButton &&
            menuButton.length > 0 &&
            menuButton.map((item, index) => (
              <div
                className={style.categoryItem}
                onClick={() => chooseCategory(item.parent)}
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
          {dishesFiltered &&
            dishesFiltered.length > 0 &&
            dishesFiltered.map((item, index) => (
              <div className={style.itemContainer}>
                <div className={style.text}>
                  <h3>{item.title}</h3>
                  <p>
                    A nossa super segestão de um prato que combina a delicadesa
                    do vinho com o sabor do açai de do cupuaçu.
                  </p>
                  <button>Faça o seu pedido</button>
                </div>
                <div className={style.image}>
                  <img
                    src="https://i.pinimg.com/736x/30/03/b0/3003b05e468c7ae52d1fbe4861077a8a.jpg"
                    alt=""
                  />
                </div>
              </div>
            ))}
        </section>
      </div>
    </div>
  );
};
export default MainPictureMenu;
