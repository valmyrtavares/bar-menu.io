import React from 'react';
import { getBtnData } from '../../api/Api';
import '../../assets/styles/item.css';
import DishesModal from './dishesModal';

function Dishes({ newItem }) {
  const [item, setItem] = React.useState([]);
  const [modal, setModal] = React.useState(false);

  React.useEffect(() => {
    setItem(newItem);
  }, []);
  //stating to styling the component item
  const openmodal = () => {
    setModal(!modal);
  };
  return (
    <>
      {modal && <DishesModal item={item} openmodal={openmodal} />}
      {item && (
        <div onClick={openmodal} className="item-container container my-2 card">
          <div className="row">
            <div className="col-7">
              <h2 className="my-0">{item.title}</h2>
              <p className="comments">{item.comment}</p>
              <p className="price float-end fw-bold">R${item.price},00</p>
            </div>
            <img className="col-5 img-thumbnail" src={item.image} alt="123" />
          </div>
        </div>
      )}
    </>
  );
}
export default Dishes;
