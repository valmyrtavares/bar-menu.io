import React from 'react';
import '../../assets/styles/CustomizedPrice.css';

function CustomizedPrice({ item, onPriceChange, radioDisabled }) {
  const [formPriceOnScreen, setFormPriceOnScreen] = React.useState({});
  const [showCustomizedPrice, setShowCustomizedPrice] = React.useState(true);

  const handleChange = (e) => {
    const [price, label, cost] = e.target.value.split('-');
    setFormPriceOnScreen(`${price}-${label}-${cost}`);

    onPriceChange({ price, label, cost });
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
            <label className="form-check-label">
              {item.firstLabel}
              <input
                disabled={radioDisabled}
                className="form-check-input"
                id={`radio-${item.firstLabel}`}
                value={`${item.firstPrice}-${item.firstLabel}-${item.firstCost}}`}
                name="options"
                type="radio"
                checked={
                  formPriceOnScreen ===
                  `${item.firstPrice}-${item.firstLabel}-${item.firstCost}`
                }
                onChange={handleChange}
              />
              R${item.firstPrice}
            </label>
          </div>
          <div>
            <label className="form-check-label">
              {item.secondLabel}
              <input
                disabled={radioDisabled}
                className="form-check-input"
                id={`radio-${item.secondLabel}`}
                name="options"
                value={`${item.secondPrice}-${item.secondLabel}-${item.secondCost}`}
                checked={
                  formPriceOnScreen ===
                  `${item.secondPrice}-${item.secondLabel}-${item.secondCost}`
                }
                type="radio"
                onChange={handleChange}
              />
              R$ {item.secondPrice}
            </label>
          </div>
          <div>
            <label className="form-check-label">
              {item.thirdLabel}
              <input
                disabled={radioDisabled}
                className="form-check-input"
                id={`radio-${item.thirdLabel}`}
                value={`${item.thirdPrice}-${item.thirdLabel}-${item.thirdCost}`}
                name="options"
                type="radio"
                checked={
                  formPriceOnScreen ===
                  `${item.thirdPrice}-${item.thirdLabel}-${item.thirdCost}`
                }
                onChange={handleChange}
              />
              R${item.thirdPrice}
            </label>
          </div>
        </form>
      )}
      ;
    </div>
  );
}
export default CustomizedPrice;
