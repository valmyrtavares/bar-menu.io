import React from "react";
import useFormValidation from "../../Hooks/useFormValidation.js";
import Input from "../../component/Input.js";
import "../../assets/styles/createCustomer.css";
import { useNavigate } from "react-router-dom";
import { getBtnData } from "../../api/Api.js";
import { GlobalContext } from "../../GlobalContext";
// import useLocalStorage from "../../Hooks/useLocalStorage.js";

const NoLog = () => {
  const navigate = useNavigate();
  const global = React.useContext(GlobalContext);
  //   const [recoveredClientStore, setRecoveredClientStore] = useLocalStorage(
  //     "userMenu",
  //     null
  //   );
  const { form, setForm, error, handleChange } = useFormValidation({
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
  //   React.useEffect(() => {
  //     if (recoveredClientStore !== null) {
  //       console.log("RecoveredClientStore atualizado:", recoveredClientStore);
  //     }
  //   }, [recoveredClientStore]);

  return (
    <div className="welcome-message">
      <p>
        {" "}
        Não achamos o seu registro neste celular, pode ser que esteja com um
        aparelho novo ou ou simplesmente perdido o nosso registro. Digite o seu
        aproveitar o seu antigo cadastro e CPF ou se é um novo cliente faça o
        seu registro para que possamos melhor serví-lo
      </p>
      <div className="cpf-input">
        <Input
          id="cpf"
          required
          label="CPF"
          value={form.cpf}
          type="text"
          onChange={handleChange}
        />
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
