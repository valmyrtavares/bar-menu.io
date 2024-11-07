import React from 'react';
import Input from '../Input';
import '../../assets/styles/PriceAndExpenseBuilder.css';
import { cardClasses } from '@mui/material';
import CloseBtn from '../closeBtn';

const PriceAndExpenseBuilder = ({
  setShowPopupCostAndPrice, //close and open popup
  addPriceObj,
  formPrice,
  labelPrice, //show what price will be change
  handleFatherChange,
  handleFatherBlur,
}) => {
  const [form, setForm] = React.useState({
    price: 0,
    cost: 0,
    percentage: 0,
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm({
      ...form,
      [id]: value,
    });
  };
  React.useEffect(() => {
    if (formPrice && labelPrice) {
      const selectedPriceObj = formPrice[labelPrice];
      if (selectedPriceObj.price !== 0) {
        setForm({
          price: selectedPriceObj.price,
          cost: selectedPriceObj.cost,
          percentage: selectedPriceObj.percentage,
          label: selectedPriceObj.label,
        });
      }
    }
  }, [formPrice, labelPrice]);

  React.useEffect(() => {
    console.log('FORM    ', form);
  }, [form]);

  const handleBlur = (e) => {
    const { id, value } = e.target;

    // Converte os valores de form para números para garantir que não sejam strings
    const cost = parseFloat(formPrice ? formPrice.cost : form.cost) || 0;
    const percentage =
      parseFloat(formPrice ? formPrice.percentage : form.percentage) || 0;
    const price = parseFloat(formPrice ? formPrice.price : form.price) || 0;

    // Cenário 1: Se preencher o custo e a porcentagem, calcula o preço
    if (id === 'percentage' && cost > 0) {
      const calculatedPrice = cost + (cost * percentage) / 100;
      setForm((prevForm) => ({
        ...prevForm,
        price: calculatedPrice.toFixed(2), // Calcula o preço
      }));
    }

    // Cenário 2: Se preencher o custo e o preço, calcula a porcentagem correta
    if (id === 'price' && cost > 0) {
      const calculatedPercentage = ((price - cost) / cost) * 100;
      setForm((prevForm) => ({
        ...prevForm,
        percentage: calculatedPercentage.toFixed(2), // Calcula a porcentagem correta
      }));
    }

    // Mantém a lógica anterior para cálculo básico de porcentagem com base em preço e custo
    if (id === 'cost' || id === 'price') {
      if (price > 0 && cost > 0) {
        const calculatedPercentage = ((price - cost) / cost) * 100;
        setForm((prevForm) => ({
          ...prevForm,
          percentage: calculatedPercentage.toFixed(2), // Calcula a porcentagem correta de lucro
        }));
      }
    }
  };

  return (
    <div className="Price-cost-container">
      {setShowPopupCostAndPrice && (
        <CloseBtn setClose={setShowPopupCostAndPrice} />
      )}
      <div className="inputs-container">
        <Input
          id="price"
          label="Preço"
          value={formPrice ? formPrice.price : form.price}
          type="number"
          onChange={
            handleFatherChange
              ? (e) => handleFatherChange(e, labelPrice)
              : handleChange
          }
          onBlur={handleFatherBlur ? handleFatherBlur : handleBlur}
        />
        <Input
          id="cost"
          label="Custo"
          value={formPrice ? formPrice.cost : form.cost}
          type="number"
          onChange={
            handleFatherChange
              ? (e) => handleFatherChange(e, labelPrice)
              : handleChange
          }
          onBlur={handleFatherBlur ? handleFatherBlur : handleBlur}
        />
        <Input
          id="percentage"
          label="Porcentagem"
          value={formPrice ? formPrice.percentage : form.percentage}
          type="number"
          onChange={
            handleFatherChange
              ? (e) => handleFatherChange(e, labelPrice)
              : handleChange
          }
          onBlur={handleFatherBlur ? handleFatherBlur : handleBlur}
        />
      </div>
      {addPriceObj && (
        <button
          onClick={() => {
            addPriceObj(form);
          }}
        >
          Enviar
        </button>
      )}
    </div>
  );
};
export default PriceAndExpenseBuilder;
