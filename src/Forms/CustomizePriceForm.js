import React from 'react';
import style from '../assets/styles/customizePriceForm.module.scss';
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
  const [showPopupCostPrice, setShowPopupCostAndPrice] = React.useState(true);

  React.useEffect(() => {
    if (customizedPriceObj) {
      console.log('customizedPriceObj     ', customizedPriceObj);
      if (
        customizedPriceObj &&
        Object.keys(customizedPriceObj).length > 0 &&
        customizedPriceObj.firstPrice.price
      ) {
        setFormPrice(customizedPriceObj);
      }
    }
  }, [customizedPriceObj]);

  React.useEffect(() => {
    console.log('FORM ATUALIZADO NO USEEFFCTS    ', formPrice);
  }, [formPrice]);

  // const onPriceChange = (obj) => {
  //   console.log(obj);
  // };

  const close = () => {
    setShowPopupCustomizePrice(false);
  };

  const handleChange = (e, priceType) => {
    const { id, value } = e.target;

    setFormPrice((prevFormPrice) => ({
      ...prevFormPrice,
      [priceType]: {
        ...prevFormPrice[priceType],
        [id]: value, // Atualiza apenas o campo específico (como "label", "price", etc.)
      },
    }));
  };

  const sendPriceObj = (obj) => {
    setLabelPrice(obj);
    setShowPopupCostAndPrice(true);
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

  const handleFatherBlur = (e, priceType) => {
    const { id, value } = e.target;
    // Pega os valores atuais de cost, percentage e price da coleção especificada (ex.: firstPrice, secondPrice)
    const cost = parseFloat(formPrice[priceType].cost) || 0;
    const percentage = parseFloat(formPrice[priceType].percentage) || 0;
    const price = parseFloat(formPrice[priceType].price) || 0;

    // Cenário 1: Se preencher o custo e a porcentagem, calcula o preço
    if (id === 'percentage' && cost > 0) {
      const calculatedPrice = cost + (cost * percentage) / 100;
      setFormPrice((prevForm) => ({
        ...prevForm,
        [priceType]: {
          ...prevForm[priceType],
          price: calculatedPrice.toFixed(2), // Calcula e atualiza o preço
        },
      }));
    }

    // Cenário 2: Se preencher o custo e o preço, calcula a porcentagem correta
    if (id === 'price' && cost > 0) {
      const calculatedPercentage = ((price - cost) / cost) * 100;
      setFormPrice((prevForm) => ({
        ...prevForm,
        [priceType]: {
          ...prevForm[priceType],
          percentage: calculatedPercentage.toFixed(2), // Calcula e atualiza a porcentagem
        },
      }));
    }

    // Mantém a lógica anterior para cálculo básico de porcentagem com base em preço e custo
    if (id === 'cost' || id === 'price') {
      if (price > 0 && cost > 0) {
        const calculatedPercentage = ((price - cost) / cost) * 100;
        setFormPrice((prevForm) => ({
          ...prevForm,
          [priceType]: {
            ...prevForm[priceType],
            percentage: calculatedPercentage.toFixed(2), // Calcula e atualiza a porcentagem correta de lucro
          },
        }));
      }
    }
  };

  //  HTML++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  return (
    <div className={style.containerCustomePrice}>
      {
        <div className="close-btn">
          <button onClick={close}>X</button>
        </div>
      }
      <Title Preço mainTitle="Preço Customizado" />

      <div className="wrapperInputs">
        {
          <PriceAndExpenseBuilder
            formPrice={formPrice}
            labelPrice="firstPrice"
            handleFatherChange={handleChange}
            handleFatherBlur={handleFatherBlur}
          />
        }
        <Input
          id="label"
          label="Descrição do primeiro preço"
          value={formPrice.firstPrice.label}
          type="text"
          onChange={(e) => handleChange(e, 'firstPrice')}
        />
      </div>
      <div className="wrapperInputs">
        {showPopupCostPrice && (
          <PriceAndExpenseBuilder
            formPrice={formPrice}
            labelPrice="secondPrice"
            handleFatherChange={handleChange}
            handleFatherBlur={handleFatherBlur}
          />
        )}
        <Input
          id="label"
          value={formPrice.secondPrice.label}
          label="Descrição do segundo preço"
          type="text"
          onChange={(e) => handleChange(e, 'secondPrice')}
        />
      </div>
      <div className="wrapperInputs">
        {showPopupCostPrice && (
          <PriceAndExpenseBuilder
            formPrice={formPrice}
            labelPrice="thirdPrice"
            handleFatherChange={handleChange}
            handleFatherBlur={handleFatherBlur}
          />
        )}
        <Input
          id="label"
          value={formPrice.thirdPrice.label}
          label="Descrição do terceiro preço"
          type="text"
          onChange={(e) => handleChange(e, 'thirdPrice')}
        />
      </div>
      <div className={style.formButtonSubmit}>
        <button
          className="customizedPriceBtn"
          type="button"
          onClick={() => onPriceChange(formPrice)}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
export default CustomizePriceForm;
