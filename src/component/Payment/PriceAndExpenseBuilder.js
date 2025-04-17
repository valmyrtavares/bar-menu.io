import React from 'react';
import Input from '../Input';
import style from '../../assets/styles/PriceAndExpenseBuilder.module.scss';
import { cardClasses } from '@mui/material';
import CloseBtn from '../closeBtn';

const PriceAndExpenseBuilder = ({
  setShowPopupCostAndPrice, //close and open popup
  addPriceObj,
  formPrice,
  labelPrice, //show what price will be change
  handleFatherChange,
  handleFatherBlur,
  objPriceCost,
}) => {
  const [form, setForm] = React.useState({
    price: 0,
    cost: 0,
    percentage: 0,
  });

  const handleChange = (e) => {
    const { id, value } = e.target;

    // Atualiza o estado `form` com o novo valor do campo alterado.
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));

    // Se `handleFatherChange` estiver disponível, chama a função passando o evento
    // para atualizar `formPrice` no componente pai.
    if (handleFatherChange) {
      handleFatherChange({ target: { id, value } }, labelPrice);
    }
  };

  React.useEffect(() => {
    if (formPrice && labelPrice) {
      console.log('formPrice     ', formPrice);
      const selectedPriceObj = formPrice[labelPrice];
      if (selectedPriceObj && selectedPriceObj.price !== undefined) {
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
    if (objPriceCost) {
      setForm({
        price: objPriceCost.price,
        cost: objPriceCost.cost,
        percentage: objPriceCost.percentage,
      });
    }
  }, [objPriceCost]);

  React.useEffect(() => {
    console.log('FORM    ', form);
  }, [form]);

  React.useEffect(() => {
    if (labelPrice === undefined) {
      document.querySelector(`.${style.allInputsContainer}`).style.cssText = `
        background: #dad4d4;
        max-width: 700px;
        box-shadow: 6px 5px #8888889c;
        position: fixed;
        top: 31%;
        left: 35%;
        width: 86%;
        padding: 1%;
        border: solid 1px black;
      `;
    }
  }, []);

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
    <div className={style.container}>
      <div className={style.allInputsContainer}>
        {setShowPopupCostAndPrice && (
          <CloseBtn setClose={setShowPopupCostAndPrice} />
        )}
        <div className={style.inputContainer}>
          <Input
            id="price"
            label="Preço"
            value={form.price}
            type="number"
            onChange={
              handleFatherChange
                ? (e) => handleFatherChange(e, labelPrice)
                : handleChange
            }
            onBlur={
              handleFatherBlur
                ? (e) => handleFatherBlur(e, labelPrice)
                : handleBlur
            }
          />
          <Input
            id="cost"
            label="Custo"
            value={form.cost}
            type="number"
            onChange={
              handleFatherChange
                ? (e) => handleFatherChange(e, labelPrice)
                : handleChange
            }
            onBlur={
              handleFatherBlur
                ? (e) => handleFatherBlur(e, labelPrice)
                : handleBlur
            }
          />
          <Input
            id="percentage"
            label="Porcentagem"
            value={form.percentage}
            type="number"
            onChange={
              handleFatherChange
                ? (e) => handleFatherChange(e, labelPrice)
                : handleChange
            }
            onBlur={
              handleFatherBlur
                ? (e) => handleFatherBlur(e, labelPrice)
                : handleBlur
            }
          />
        </div>
        {addPriceObj && (
          <div className={style.btnContainer}>
            <button
              onClick={() => {
                addPriceObj(form);
              }}
            >
              Enviar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default PriceAndExpenseBuilder;
