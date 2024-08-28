import React from "react";
import { getBtnData } from "../../api/Api";
import "../../assets/styles/dishes.css";
import DishesModal from "./dishesModal";

function Dishes({ newItem }) {
  const [item, setItem] = React.useState([]);
  const [modal, setModal] = React.useState(false);

  React.useEffect(() => {
    setItem(newItem);
  }, []);

  const openmodal = () => {
    setModal(true);
  };

  const formatPrice = (price) => {
    price = typeof price === "number" ? price.toString() : price;

    if (price.toString().indexOf(".") !== -1) {
      return `R$${price.toString().replace(".", ",")}`;
    } else {
      return `R$${price},00`;
    }
  };

  return (
    <>
      {modal && <DishesModal item={item} setModal={setModal} />}
      {item && (
        <div onClick={openmodal} className="item-container container my-2 card">
          <div className="row">
            <div className="col-7">
              <h2 className="my-0">{item.title}</h2>
              <p className="comments">{item.comment}</p>
            </div>
            <img
              className="col-5 img-thumbnail img-customize"
              src={item.image}
              alt="123"
            />
          </div>
          <div className="container-request-button">
            <button className="request-client">Faça o seu pedido</button>
            {item && (
              <p className="price float-end fw-bold">R${item.price},00</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
export default Dishes;
