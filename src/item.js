import React from 'react';
import { getBtnData } from './api/buttonApi';
import './assets/styles/item.css';

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
          <div key={index} className="item-container container my-2 card">
            <div className="row">
              <div className="col-7">
                <h2 className="my-0">{item.title}</h2>
                <p className="comments">{item.comment}</p>
                <p className="price float-end fw-bold">R${item.price},00</p>
              </div>

              <img className="col-5 img-thumbnail" src={item.image} alt="123" />
            </div>
          </div>
        ))}
    </>
  );
}
export default Item;
