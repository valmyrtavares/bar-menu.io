import React from 'react';
import { getBtnData } from './api/buttonApi';

function Item() {
  const [item, setItem] = React.useState([]);

  React.useEffect(() => {
    const itemData = async () => {
      try {
        const data = await getBtnData('item');
        setItem(data);
        console.log(data);
      } catch (error) {
        console.log('Error fetching data', error);
      }
    };
    itemData();
  }, []);
  //stating to styling the component item
  return (
    <>
      {item &&
        item.map((item, index) => (
          <div key={index}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <p>{item.price}</p>
            <p>{item.category}</p>
            <p>{item.parent}</p>
            <p>{item.image}</p>
            <p>{item.carrossel}</p>
          </div>
        ))}
    </>
  );
}
export default Item;
