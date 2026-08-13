import React from 'react';
import Input from '../Input';
import Title from '../title'; // Importando o Titulo para o modo standalone
import style from '../../assets/styles/PriceAndExpenseBuilder.module.scss';
import Tooltip from '../Tooltip';
import { cardClasses } from '@mui/material';
import CloseBtn from '../closeBtn';
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
            <Tooltip text="Este campo será preenchido a partir do custo das receitas, que refletem o que foi pago em cada matéria prima.">
              <Input
                id="cost"
                label="Custo R$"
                value={form.cost}
                type="number"
                onChange={handleFatherChange ? (e) => handleFatherChange(e, labelPrice) : handleChange}
                onBlur={handleFatherBlur ? (e) => handleFatherBlur(e, labelPrice) : handleBlur}
                readOnly={true}
                style={{ cursor: 'help', backgroundColor: '#f5f5f5', pointerEvents: 'none' }}
              />
            </Tooltip>
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
