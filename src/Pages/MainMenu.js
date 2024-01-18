import React from 'react';
import CarrosselImages from '../component/carrosselImages';
import NestedBtn from '../nestedBtn';
import { getBtnData } from '../api/buttonApi';

function MainMenu() {
  const [displayForm, setDisplayForm] = React.useState(false);
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
        {true && <CarrosselImages />}
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
    </>
  );
}
export default MainMenu;
