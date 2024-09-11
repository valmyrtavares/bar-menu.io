import React from "react";
import useFormValidation from "../../Hooks/useFormValidation.js";
import Input from "../../component/Input.js";
import "../../assets/styles/createCustomer.css";
import { useNavigate } from "react-router-dom";
import { getBtnData } from "../../api/Api.js";
import { GlobalContext } from "../../GlobalContext";
import Keyboard from "../../component/Keyboard";
// import useLocalStorage from "../../Hooks/useLocalStorage.js";

const NoLog = () => {
  const navigate = useNavigate();
  const global = React.useContext(GlobalContext);
  const [showCpfKeyboard, setShowCpfKeyboard] = React.useState(false);
  //   const [recoveredClientStore, setRecoveredClientStore] = useLocalStorage(
  //     "userMenu",
  //     null
  //   );
  const { form, setForm, error, handleChange, handleBlur } = useFormValidation({
    name: "",
    phone: "",
    cpf: "",
    birthday: "",
    email: "",
  });
  const createNewCustomer = () => {
    navigate("/create-customer");
  };

  const checkCustomer = async () => {
    const data = await getBtnData("user");
    const recoveredClient = data.filter((item) => item.cpf === form.cpf);
    if (recoveredClient.length > 0) {
      global.setId(recoveredClient[0].id);
      global.setAuthorizated(true);
      const currentUser = {
        id: recoveredClient[0].id,
        name: recoveredClient[0].name,
      };
      localStorage.setItem("userMenu", JSON.stringify(currentUser));

      navigate("/");
    } else {
      navigate("/create-customer");
    }
  };

  const handleFocus = (e) => {
    const { id, value } = e.target;
    if (id === "cpf") {
      setShowCpfKeyboard(true);
    }
  };

  // Função chamada quando um número é clicado no teclado
  const addCharacter = (char, id) => {
    if (char === "clearField") {
      // Limpar o campo CPF
      setForm((prev) => ({ ...prev, id: "" }));

      // Criar e passar o evento sintético para handleChange com o campo vazio
      const syntheticEvent = {
        target: {
          id: id,
          value: "", // Campo vazio
        },
      };
      handleChange(syntheticEvent); // Disparar o handleChange com o campo limpo
      return; // Evitar adicionar mais caracteres após limpar o campo
    }

    const newValue = form.cpf + char;

    // Criar e passar o evento sintético para handleChange com o novo valor
    const syntheticEvent = {
      target: {
        id: id,
        value: newValue,
      },
    };

    handleChange(syntheticEvent);
  };

  const closeKeyboard = (cpfValue, id) => {
    if (id === "cpf") {
      setShowCpfKeyboard(false);
      const syntheticEvent = {
        target: {
          id: "cpf",
          value: cpfValue,
        },
      };
      handleBlur(syntheticEvent);
    }
  };

  return (
    <div className="welcome-message">
      <h3> Não achamos o seu registro. Digite o seu CPF</h3>
      <div className="cpf-input">
        <Input
          id="cpf"
          required
          label="CPF"
          value={form.cpf}
          type="text"
          onChange={handleChange}
          onFocus={handleFocus}
          // onBlur={handleBlur}
        />
        {showCpfKeyboard && (
          <Keyboard
            // handleBlur={handleBlur}
            addCharacter={addCharacter}
            closeKeyboard={() => closeKeyboard(form.cpf, "cpf")}
            id="cpf"
          />
        )}
      </div>
      {error.cpf && <div className="error-form">{error.cpf}</div>}
      <div className="create-new-customer-btns">
        <button
          type="submit"
          className="btn btn-primary"
          onClick={checkCustomer}
        >
          Recupere seu cadastro
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={createNewCustomer}
        >
          Essa é minha primeira vez
        </button>
      </div>
    </div>
  );
};
export default NoLog;