import React from 'react';
import Form from '../form';
import CarrosselImages from '../component/carrosselImages';
import Header from '../component/header';
import NestedBtn from '../nestedBtn';
import { getBtnData } from '../api/buttonApi';
import FormItem from '../formItem';
import Item from '../item';

function MainMenu() {
  const [displayForm, setDisplayForm] = React.useState(false);
  const [menuButton, setMenuButton] = React.useState([]);
  const [item, setItem] = React.useState([]);
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        //  const data = await getBtnData('button');
        //  const dataItem = await getBtnData('item');
        //  setMenuButton(data);
        //  setItem(dataItem);
        const [data, dataItem] = await Promise.all([
          getBtnData('button'),
          getBtnData('item'),
        ]);
        setMenuButton(data);
        setItem(dataItem);
        console.log(data);
        console.log(dataItem);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div>
        {false && <Header />}
        {true && <CarrosselImages />}
        {false && <Form />}
        {menuButton &&
          menuButton.map((item, index) => (
            <div key={index}>
              <NestedBtn parent={'main'} item={item} menuButton={menuButton} />
            </div>
          ))}
        <div>{false && <FormItem />}</div>
        <div>{true && <Item />}</div> //testing component item
      </div>
    </>
  );
}
export default MainMenu;
