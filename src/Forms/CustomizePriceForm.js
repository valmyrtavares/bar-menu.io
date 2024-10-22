import React from "react";
import "../assets/styles/customizePriceForm.css";
import Input from "../component/Input.js";
import Title from "../component/title.js";
import PriceAndExpenseBuilder from "../component/Payment/PriceAndExpenseBuilder";
import { cardClasses } from "@mui/material";

function CustomizePrice({
  setShowPopupCustomizePrice,
  onPriceChange,
  customizedPriceObj,
}) {
  const [formPrice, setFormPrice] = React.useState({
    firstPrice: {
      price: 0,
      cost: 0,
      percentage: 0,
      label: "",
    },

    secondPrice: {
      price: 0,
      cost: 0,
      percentage: 0,
      label: "",
    },

    thirdPrice: {
      price: 0,
      cost: 0,
      percentage: 0,
      label: "",
    },
  });
  const [labelPrice, setLabelPrice] = React.useState("");
  const [showPopupCostPrice, setShowPopupCostAndPrice] = React.useState(false);

  React.useEffect(() => {
    if (customizedPriceObj) {
      setFormPrice((prevFormPrice) => ({
        ...prevFormPrice,
        firstPrice: {
          ...prevFormPrice.firstPrice,
          label: customizedPriceObj.firstLabel, // Atualiza apenas o campo label
        },
        secondPrice: {
          ...prevFormPrice.secondPrice,
          label: customizedPriceObj.secondLabel, // Atualiza apenas o campo label
        },
        thirdPrice: {
          ...prevFormPrice.thirdPrice,
          label: customizedPriceObj.thirdLabel, // Atualiza apenas o campo label
        },
      }));
    }
  }, []);

  const close = () => {
    setShowPopupCustomizePrice(false);
  };

  const handleChange = ({ target }) => {
    const { id, value } = target;

    if (id === "firstLabel") {
      setFormPrice((prevFormPrice) => ({
        ...prevFormPrice,
        firstPrice: {
          ...prevFormPrice.firstPrice,
          label: value, // Atualiza apenas o campo label
        },
      }));
    } else if (id === "secondLabel") {
      setFormPrice((prevFormPrice) => ({
        ...prevFormPrice,
        secondPrice: {
          ...prevFormPrice.secondPrice,
          label: value, // Atualiza apenas o campo label
        },
      }));
    } else if (id === "thirdLabel") {
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
    setLabelPrice(obj);
    setFormPrice({
      firstPrice: {
        price: customizedPriceObj ? customizedPriceObj.firstPrice : 0,
        cost: 0,
        percentage: 0,
        label: customizedPriceObj ? customizedPriceObj.firstLabel : "",
      },

      secondPrice: {
        price: customizedPriceObj ? customizedPriceObj.secondPrice : 0,
        cost: 0,
        percentage: 0,
        label: customizedPriceObj ? customizedPriceObj.secondLabel : "",
      },

      thirdPrice: {
        price: customizedPriceObj ? customizedPriceObj.thirdPrice : 0,
        cost: 0,
        percentage: 0,
        label: customizedPriceObj ? customizedPriceObj.secondLabel : "",
      },
    });

    setShowPopupCostAndPrice(true);
  };

  const addPriceObj = (priceAndCost) => {
    console.log(priceAndCost);
    setFormPrice({
      ...formPrice,
      [labelPrice]: priceAndCost,
    });
    console.log("FORM PRICE    ", formPrice);
  };
  React.useEffect(() => {
    console.log(formPrice);
  }, [formPrice]);

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
            sendPriceObj("firstPrice");
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
            sendPriceObj("secondPrice");
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
            sendPriceObj("thirdPrice");
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
      <button
        className="customized-price-btn"
        type="button"
        onClick={() => onPriceChange(formPrice)}
      >
        Enviar
      </button>
    </div>
  );
}
export default CustomizePrice;
