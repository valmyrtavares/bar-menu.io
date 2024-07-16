import React from 'react';
import CarrosselImages from '../component/carouselComponent';
import NestedBtn from '../component/nestedBtn';
import { getBtnData } from '../api/Api';
import MenuButton from '../component/menuHamburguerButton';
import '../assets/styles/mainMenu.css';

function MainMenu() {
  // const [displayForm, setDisplayForm] = React.useState(false);
  const [menuButton, setMenuButton] = React.useState([]);
  const [dishes, setDishes] = React.useState([]);
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

  return (
    <>
      <div>
        <MenuButton />
        {true && <CarrosselImages />}
        <div className="container-btn">
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
