import React from "react";
import "../../assets/styles/dishes.css";

const DishesModal = ({ item, openmodal }) => {
  const [totalPrice, setTotalPrice] = React.useState(Number(item.price));

  function handleChange(e) {
    const additionalPrice = Number(e.target.value);
    if (e.target.checked) {
      // Adiciona o preço do acompanhamento se o checkbox for marcado
      setTotalPrice((prevTotal) => prevTotal + additionalPrice);
    } else {
      // Subtrai o preço do acompanhamento se o checkbox for desmarcado
      setTotalPrice((prevTotal) => prevTotal - additionalPrice);
    }
  }
  return (
    <div className="content-modal-dishes">
      <div className="close-btn">
        <button onClick={openmodal}>X</button>
      </div>
      <h1>{item.title}</h1>
      <img src={item.image} alt="img" />
      <p>{item.comment}</p>
      <h4>Valor: R${totalPrice.toFixed(2)}</h4>
      <form className="my-3">
        <h4>Selecione o seu acompanhamento</h4>
        <div className="side-dishes-list">
          {item.sideDishesElementList &&
            item.sideDishesElementList.map((sideDishItem, index) => (
              <div key={index}>
                <input
                  className="form-check-input"
                  id="carrossel"
                  value={sideDishItem.price}
                  type="checkbox"
                  onChange={handleChange}
                />
                <label className="form-check-label">
                  {sideDishItem.sideDishes}
                </label>
              </div>
            ))}
        </div>
        <button className="request-client">Faça o seu pedido</button>
      </form>
    </div>
  );
};
export default DishesModal;
