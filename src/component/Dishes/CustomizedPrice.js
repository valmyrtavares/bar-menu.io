import React from "react";
import "../../assets/styles/dishes.css";

function CustomizedPrice({ item, onPriceChange, radioDisabled }) {
  const [formPriceOnScreen, setFormPriceOnScreen] = React.useState({});
  const [showCustomizedPrice, setShowCustomizedPrice] = React.useState(true);

  const handleChange = (e) => {
    const price = e.target.value;
    setFormPriceOnScreen(price);
    console.log(price);
    onPriceChange(price);
  };

  React.useEffect(() => {
    if (!item.firstPrice) {
      setShowCustomizedPrice(false);
    }
  }, []);
  return (
    <div className="customized-price-container">
      {showCustomizedPrice && (
        <form>
          <div>
            <input
              disabled={radioDisabled}
              className="form-check-input"
              id="carrossel"
              value={item.firstPrice}
              name="options"
              type="radio"
              checked={formPriceOnScreen === item.firstPrice}
              onChange={handleChange}
            />
            <label className="form-check-label">{item.firstLabel}</label>
            <p>R${item.firstPrice}</p>
          </div>
          <div>
            <input
              disabled={radioDisabled}
              className="form-check-input"
              id="carrossel"
              name="options"
              value={item.secondPrice}
              checked={formPriceOnScreen === item.secondPrice}
              type="radio"
              onChange={handleChange}
            />
            <label className="form-check-label">{item.secondLabel}</label>
            <p>R$ {item.secondPrice}</p>
          </div>
          <div>
            <input
              disabled={radioDisabled}
              className="form-check-input"
              id="carrossel"
              value={item.thirdPrice}
              name="options"
              type="radio"
              checked={formPriceOnScreen === item.thirdPrice}
              onChange={handleChange}
            />
            <label className="form-check-label">{item.thirdLabel}</label>
            <p>R${item.thirdPrice}</p>
          </div>
        </form>
      )}
      ;
    </div>
  );
}
export default CustomizedPrice;
