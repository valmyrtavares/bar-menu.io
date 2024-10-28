import React from 'react';
import '../assets/styles/customizePriceForm.css';
import Input from '../component/Input.js';
import Title from '../component/title.js';
import PriceAndExpenseBuilder from '../component/Payment/PriceAndExpenseBuilder';
import { cardClasses } from '@mui/material';

function CustomizePriceForm({
  setShowPopupCustomizePrice,
  onPriceChange,
  customizedPriceObj,
}) {
  const [formPrice, setFormPrice] = React.useState({
    firstPrice: {
      price: 0,
      cost: 0,
      percentage: 0,
      label: '',
    },
    secondPrice: {
      price: 0,
      cost: 0,
      percentage: 0,
      label: '',
    },
    thirdPrice: {
      price: 0,
      cost: 0,
      percentage: 0,
      label: '',
    },
  });
  const [labelPrice, setLabelPrice] = React.useState('');
  const [showPopupCostPrice, setShowPopupCostAndPrice] = React.useState(false);

  React.useEffect(() => {
    if (customizedPriceObj) {
      if (
        customizedPriceObj &&
        Object.keys(customizedPriceObj).length > 0 &&
        customizedPriceObj.firstPrice.price
      ) {
        setFormPrice(customizedPriceObj);
      }
    }
    setFormPrice({
      firstPrice: {
        price: 0,
        cost: 0,
        percentage: 0,
        label: '',
      },

      secondPrice: {
        price: 0,
        cost: 0,
        percentage: 0,
        label: '',
      },

      thirdPrice: {
        price: 0,
        cost: 0,
        percentage: 0,
        label: '',
      },
    });
  }, []);

  const CheckonPriceChange = (obj) => {
    console.log(obj);
  };

  const close = () => {
    setShowPopupCustomizePrice(false);
  };

  const handleChange = ({ target }) => {
    const { id, value } = target;

    if (id === 'firstLabel') {
      setFormPrice((prevFormPrice) => ({
        ...prevFormPrice,
        firstPrice: {
          ...prevFormPrice.firstPrice,
          label: value, // Atualiza apenas o campo label
        },
      }));
    } else if (id === 'secondLabel') {
      setFormPrice((prevFormPrice) => ({
        ...prevFormPrice,
        secondPrice: {
          ...prevFormPrice.secondPrice,
          label: value, // Atualiza apenas o campo label
        },
      }));
    } else if (id === 'thirdLabel') {
      setFormPrice((prevFormPrice) => ({
        ...prevFormPrice,
        thirdPrice: {
          ...prevFormPrice.thirdPrice,
          label: value, // Atualiza apenas o campo label
        },
      }));
    }
  };

  const sendPriceObj = (obj) => {
    debugger;
    setLabelPrice(obj);

    setShowPopupCostAndPrice(true);
  };

  const addPriceObj = (priceAndCost) => {
    console.log('COMO CHEGA A DATA DO COMP   ', priceAndCost);
    console.log('formPrice antes da atualização   ', formPrice);
    setFormPrice({
      ...formPrice,
      [labelPrice]: priceAndCost,
    });
    console.log('FORM PRICE    ', formPrice);
  };

  React.useEffect(() => {
    if (customizedPriceObj && Object.keys(customizedPriceObj).length > 0) {
      setFormPrice({
        firstPrice: {
          price: customizedPriceObj.firstPrice?.price || 0,
          cost: customizedPriceObj.firstPrice?.cost || 0,
          percentage: customizedPriceObj.firstPrice?.percentage || 0,
          label: customizedPriceObj.firstPrice?.label || '',
        },
        secondPrice: {
          price: customizedPriceObj.secondPrice?.price || 0,
          cost: customizedPriceObj.secondPrice?.cost || 0,
          percentage: customizedPriceObj.secondPrice?.percentage || 0,
          label: customizedPriceObj.secondPrice?.label || '',
        },
        thirdPrice: {
          price: customizedPriceObj.thirdPrice?.price || 0,
          cost: customizedPriceObj.thirdPrice?.cost || 0,
          percentage: customizedPriceObj.thirdPrice?.percentage || 0,
          label: customizedPriceObj.thirdPrice?.label || '',
        },
      });
    }
  }, [customizedPriceObj]);

  const testando = () => {
    console.log('FORM PRICE   ', formPrice);
  };

  //  HTML++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  return (
    <div className="container-custome-price">
      <div className="close-btn">
        <button onClick={close}>X</button>
      </div>
      <Title Preço mainTitle="Preço Customizado" />

      {showPopupCostPrice && (
        <PriceAndExpenseBuilder
          objPriceCost={formPrice}
          setShowPopupCostAndPrice={setShowPopupCostAndPrice}
          labelPrice={labelPrice}
          addPriceObj={addPriceObj}
        />
      )}
      <div className="wrapper-inputs">
        <button
          onClick={() => {
            sendPriceObj('firstPrice');
          }}
        >
          Preço/Custo
        </button>
        <Input
          id="firstLabel"
          label="Descrição do primeiro preço"
          value={formPrice?.firstPrice?.label}
          type="text"
          onChange={handleChange}
        />
      </div>
      <div className="wrapper-inputs">
        <button
          onClick={() => {
            sendPriceObj('secondPrice');
          }}
        >
          Preço/Custo
        </button>
        <Input
          id="secondLabel"
          value={formPrice?.secondPrice?.label}
          label="Descrição do segundo preço"
          type="text"
          onChange={handleChange}
        />
      </div>
      <div className="wrapper-inputs">
        <button
          onClick={() => {
            sendPriceObj('thirdPrice');
          }}
        >
          Preço/Custo
        </button>
        <Input
          id="thirdLabel"
          value={formPrice?.thirdPrice?.label}
          label="Descrição do terceiro preço"
          type="text"
          onChange={handleChange}
        />
      </div>
      <button onClick={testando}>Botão de teste</button>
      <button
        className="customized-price-btn"
        type="button"
        onClick={() => CheckonPriceChange(formPrice)}
      >
        Enviar
      </button>
    </div>
  );
}
export default CustomizePriceForm;
