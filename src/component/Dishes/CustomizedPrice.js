import React from 'react';
import '../../assets/styles/CustomizedPrice.css';

function CustomizedPrice({ item, onPriceChange, radioDisabled }) {
  const [formPriceOnScreen, setFormPriceOnScreen] = React.useState({});
  const [showCustomizedPrice, setShowCustomizedPrice] = React.useState(true);

  const handleChange = (e) => {
    const [price, label] = e.target.value.split('-');
    setFormPriceOnScreen(`${price}-${label}`);

    onPriceChange({ price, label });
  };

  React.useEffect(() => {
    console.log(item);
    if (!item.firstPrice) {
      setShowCustomizedPrice(false);
    }
  }, []);

  React.useEffect(() => {
    console.log(radioDisabled);
  }, [radioDisabled]);

  return (
    <div className="customized-price-container">
      {showCustomizedPrice && (
        <form>
          <div>
            <input
              disabled={radioDisabled}
              className="form-check-input"
              id={`radio-${item.firstLabel}`}
              value={`${item.firstPrice}-${item.firstLabel}`}
              name="options"
              type="radio"
              checked={
                formPriceOnScreen === `${item.firstPrice}-${item.firstLabel}`
              }
              onChange={handleChange}
            />
            <label className="form-check-label">{item.firstLabel}</label>
            <p>R${item.firstPrice}</p>
          </div>
          <div>
            <input
              disabled={radioDisabled}
              className="form-check-input"
              id={`radio-${item.secondLabel}`}
              name="options"
              value={`${item.secondPrice}-${item.secondLabel}`}
              checked={
                formPriceOnScreen === `${item.secondPrice}-${item.secondLabel}`
              }
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
              id={`radio-${item.thirdLabel}`}
              value={`${item.thirdPrice}-${item.thirdLabel}`}
              name="options"
              type="radio"
              checked={
                formPriceOnScreen === `${item.thirdPrice}-${item.thirdLabel}`
              }
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
