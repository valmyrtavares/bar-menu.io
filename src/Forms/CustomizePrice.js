import React from "react";
import "../assets/styles/customizePrice.css";
import Input from "../component/Input.js";
import Title from "../component/title.js";

function CustomizePrice({ setShowPopupCustomizePrice }) {
  const close = () => {
    setShowPopupCustomizePrice(false);
  };
  const handleChange = () => {
    console.log("Está funcionando");
  };
  return (
    <div className="container-custome-price">
      <div className="close-btn">
        <button onClick={close}>X</button>
      </div>
      <Title Preço mainTitle="Preço Customizado" />
      <form>
        <div className="wrapper-inputs">
          <Input
            id="FirstdescriptionPrice"
            label="Primeiro preço"
            type="text"
            onChange={handleChange}
          />
          <Input
            id="firstNewPrice"
            label="Descrição do primeiro preço"
            type="number"
            onChange={handleChange}
          />
        </div>
        <div className="wrapper-inputs">
          <Input
            id="FirstdescriptionPrice"
            label="Segundo preço"
            type="text"
            onChange={handleChange}
          />
          <Input
            id="firstNewPrice"
            label="Descrição do segundo preço"
            type="number"
            onChange={handleChange}
          />
        </div>
        <div className="wrapper-inputs">
          <Input
            id="FirstdescriptionPrice"
            label="Terceiro preço"
            type="text"
            onChange={handleChange}
          />
          <Input
            id="firstNewPrice"
            label="Descrição do terceiro preço"
            type="number"
            onChange={handleChange}
          />
        </div>
      </form>
    </div>
  );
}
export default CustomizePrice;
