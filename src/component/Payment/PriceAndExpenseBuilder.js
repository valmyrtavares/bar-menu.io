import React from 'react';
import Input from '../Input';
import Title from '../title'; // Importando o Titulo para o modo standalone
import style from '../../assets/styles/PriceAndExpenseBuilder.module.scss';
import { cardClasses } from '@mui/material';
import CloseBtn from '../closeBtn';
import { calculateItemCost } from '../../Helpers/Helpers';
import { updateCollection } from '../../api/Api';
import { tooltips } from '../../constants/tooltips.js';

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
  hideHelpIcon,
}) => {
  const [form, setForm] = React.useState({
    price: 0,
    cost: 0,
    percentage: 0,
  });

  const isStandalone = labelPrice === undefined;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [id]: value,
    }));

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

  const handleBlur = (e) => {
    const { id, value } = e.target;
    const cost = parseFloat(formPrice ? formPrice.cost : form.cost) || 0;
    const percentage = parseFloat(formPrice ? formPrice.percentage : form.percentage) || 0;
    const price = parseFloat(formPrice ? formPrice.price : form.price) || 0;

    if (id === 'percentage' && cost > 0) {
      const calculatedPrice = cost + (cost * percentage) / 100;
      setForm((prevForm) => ({
        ...prevForm,
        price: calculatedPrice.toFixed(2),
      }));
    }

    if (id === 'price' && cost > 0) {
      const calculatedPercentage = ((price - cost) / cost) * 100;
      setForm((prevForm) => ({
        ...prevForm,
        percentage: calculatedPercentage.toFixed(2),
      }));
    }

    if (id === 'cost' || id === 'price') {
      if (price > 0 && cost > 0) {
        const calculatedPercentage = ((price - cost) / cost) * 100;
        setForm((prevForm) => ({
          ...prevForm,
          percentage: calculatedPercentage.toFixed(2),
        }));
      }
    }
  };

  const calculatedRecipeCost = async () => {
    try {
      if (!recipe || (typeof recipe === 'object' && Object.keys(recipe).length === 0)) {
        alert('Esse produto não tem receita criada, por isso é impossível calcular o custo.');
        return;
      }

      if (typeof recipe.finalingridientsList === 'object' && !Array.isArray(recipe.finalingridientsList)) {
        const lists = Object.values(recipe.finalingridientsList);
        const allEmpty = lists.every((arr) => Array.isArray(arr) && arr.length === 0);
        if (allEmpty) {
          alert('Esse produto não tem receita criada, por isso é impossível calcular o custo. Atualize a receita para que o custo possa ser preenchido corretamente pelo sistema.');
          return;
        }
      }

      const response = await calculateItemCost(recipe);
      if (response.default !== undefined) {
        await updateCollection('item', id, { 'costPriceObj.cost': response.default });
      } else if (costProfitMarginCustomized && typeof costProfitMarginCustomized === 'object') {
        const updates = {};
        const costMap = response;
        ['firstPrice', 'secondPrice', 'thirdPrice'].forEach((priceKey) => {
          const priceData = costProfitMarginCustomized[priceKey];
          if (priceData && priceData.label && costMap[priceData.label]) {
            updates[`costProfitMarginCustomized.${priceKey}.cost`] = costMap[priceData.label];
          }
        });
        if (Object.keys(updates).length > 0) {
          await updateCollection('item', id, updates);
        }
      }
    } catch (error) {
      console.error('Erro ao calcular ou atualizar o custo no Firestore:', error);
    }
  };

  return (
    <div className={`${style.builderContainer} ${isStandalone ? style.standalone : ''}`}>
      <div className={style.allInputsContainer}>
        {/* Header no modo standalone */}
        {isStandalone && (
          <div className={style.standaloneHeader}>
            <Title Preço mainTitle="Definição de Preço" />
          </div>
        )}

        {!hideHelpIcon && (
          <div className={style.helpIconHeader}>
            <div className={style.helpIconContainer}>
              <a
                href="https://docs.google.com/document/d/1JO_71SmMvI_lkzAerER1YuuM_F-0Sdp6-dJrdy7E1oQ/edit?tab=t.dfeq79e0w14f#heading=h.puvs80k9k97o"
                target="_blank"
                rel="noopener noreferrer"
                title="Abrir documentação"
              >
                <span>?</span>
              </a>
            </div>
          </div>
        )}
        
        {setShowPopupCostAndPrice && (
          <div className={isStandalone ? style.standaloneClose : style.closeContainer}>
            <CloseBtn setClose={setShowPopupCostAndPrice} />
          </div>
        )}

        <div className={style.inputRow}>
          <div className={style.field}>
            <Input
              id="price"
              label="Preço R$"
              value={form.price}
              type="number"
              onChange={handleFatherChange ? (e) => handleFatherChange(e, labelPrice) : handleChange}
              onBlur={handleFatherBlur ? (e) => handleFatherBlur(e, labelPrice) : handleBlur}
              title={tooltips.priceBuilder.price}
            />
          </div>
          <div className={style.field}>
            <Input
              id="cost"
              label="Custo R$"
              value={form.cost}
              type="number"
              onChange={handleFatherChange ? (e) => handleFatherChange(e, labelPrice) : handleChange}
              onBlur={handleFatherBlur ? (e) => handleFatherBlur(e, labelPrice) : handleBlur}
              title={tooltips.priceBuilder.cost}
            />
          </div>
          <div className={style.field}>
            <Input
              id="percentage"
              label="Margem (%)"
              value={form.percentage}
              type="number"
              onChange={handleFatherChange ? (e) => handleFatherChange(e, labelPrice) : handleChange}
              onBlur={handleFatherBlur ? (e) => handleFatherBlur(e, labelPrice) : handleBlur}
              title={tooltips.priceBuilder.percentage}
            />
          </div>
        </div>

        <div className={style.actionsContainer}>
          <button
            type="button"
            className={style.calcButton}
            onClick={calculatedRecipeCost}
            title={tooltips.priceBuilder.calculate}
          >
            Calcular Custo
          </button>
          
          {addPriceObj && (
            <button
              type="button"
              className={style.sendButton}
              onClick={() => addPriceObj(form)}
              title={tooltips.priceBuilder.send}
            >
              Confirmar Preço
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default PriceAndExpenseBuilder;
