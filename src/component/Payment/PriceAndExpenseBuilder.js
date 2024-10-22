import React from "react";
import Input from "../Input";
import "../../assets/styles/PriceAndExpenseBuilder.css";
import { cardClasses } from "@mui/material";
import CloseBtn from "../closeBtn";

const PriceAndExpenseBuilder = ({
  setShowPopupCostAndPrice,
  addPriceObj,
  objPriceCost,
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

    // Converte os valores de form para números para garantir que não sejam strings
    const cost = parseFloat(form.cost) || 0;
    const percentage = parseFloat(form.percentage) || 0;
    const price = parseFloat(form.price) || 0;

    // Cenário 1: Se preencher o custo e a porcentagem, calcula o preço
    if (id === "percentage" && cost > 0) {
      const calculatedPrice = cost + (cost * percentage) / 100;
      setForm((prevForm) => ({
        ...prevForm,
        price: calculatedPrice.toFixed(2), // Calcula o preço
      }));
    }

    // Cenário 2: Se preencher o custo e o preço, calcula a porcentagem correta
    if (id === "price" && cost > 0) {
      const calculatedPercentage = ((price - cost) / cost) * 100;
      setForm((prevForm) => ({
        ...prevForm,
        percentage: calculatedPercentage.toFixed(2), // Calcula a porcentagem correta
      }));
    }

    // Mantém a lógica anterior para cálculo básico de porcentagem com base em preço e custo
    if (id === "cost" || id === "price") {
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
      <CloseBtn setClose={setShowPopupCostAndPrice} />
      <div className="inputs-container">
        <Input
          id="price"
          label="Preço"
          value={form.price}
          type="number"
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <Input
          id="cost"
          label="Custo"
          value={form.cost}
          type="number"
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <Input
          id="percentage"
          label="Porcentagem"
          value={form.percentage}
          type="number"
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>
      <div className="container-add-btn">
        <button onClick={() => addPriceObj(form)} className=" btn btn-success">
          Adicionar
        </button>
      </div>
    </div>
  );
};
export default PriceAndExpenseBuilder;
