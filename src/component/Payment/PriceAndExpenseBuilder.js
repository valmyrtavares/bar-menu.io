import React from 'react';
import Input from '../Input';
import style from '../../assets/styles/PriceAndExpenseBuilder.module.scss';
import { cardClasses } from '@mui/material';
import CloseBtn from '../closeBtn';
import { calculateItemCost } from '../../Helpers/Helpers';
import { updateCollection } from '../../api/Api';

const PriceAndExpenseBuilder = ({
  setShowPopupCostAndPrice, //close and open popup
  addPriceObj,
  formPrice,
  labelPrice, //show what price will be change
  handleFatherChange,
  handleFatherBlur,
  objPriceCost,
  costProfitMarginCustomized,
  recipe,
  id,
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
    console.log('OBJETO DE RECEITA     ', recipe);
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
  const calculatedRecipeCost = async () => {
    try {
      console.log('costProfitMarginCustomized', costProfitMarginCustomized);
      const response = await calculateItemCost(recipe);
      debugger;
      if (response.default !== undefined) {
        // Atualiza o campo específico costPriceObj.cost
        await updateCollection('item', id, {
          'costPriceObj.cost': response.default,
        });
        console.log('Custo padrão atualizado com sucesso no Firestore!');
      } else if (
        costProfitMarginCustomized &&
        typeof costProfitMarginCustomized === 'object'
      ) {
        const updates = {};
        const costMap = response;
        debugger;
        ['firstPrice', 'secondPrice', 'thirdPrice'].forEach((priceKey) => {
          const priceData = costProfitMarginCustomized[priceKey];

          if (priceData && priceData.label && costMap[priceData.label]) {
            updates[`costProfitMarginCustomized.${priceKey}.cost`] =
              costMap[priceData.label];
          }
        });
        console.log('Updates to be made:', updates);
        debugger;
        if (Object.keys(updates).length > 0) {
          await updateCollection('item', id, updates);
          console.log(
            'Custos por tamanho atualizados com sucesso no Firestore!'
          );
        } else {
          console.warn('Nenhum campo para atualizar foi encontrado.');
        }
      } else {
        console.warn('formPrice está ausente ou malformado.');
      }
    } catch (error) {
      console.error(
        'Erro ao calcular ou atualizar o custo no Firestore:',
        error
      );
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
        <div className={style.buttonCostContainer}>
          <div className={style.btnContainer}>
            <button onClick={calculatedRecipeCost}>Calcular Custo</button>
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
    </div>
  );
};
export default PriceAndExpenseBuilder;
