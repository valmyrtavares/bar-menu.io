import React from "react";
import Input from "../../component/Input.js";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../../config-firebase/firebase.js";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../../GlobalContext";
import "../../assets/styles/createCustomer.css";
import useFormValidation from "../../Hooks/useFormValidation.js";
// import { Link } from "react-router-dom";
// import { getBtnData } from "../../api/Api.js";
// import { FormControlLabel } from "@mui/material";
import { CheckUser } from "../../Helpers/Helpers.js";

const CreateCustomer = () => {
  const navigate = useNavigate();
  const global = React.useContext(GlobalContext);
  const anonymousClient = React.useRef(null);

  const { form, setForm, error, handleChange } = useFormValidation({
    name: "",
    phone: "",
    birthday: "",
    email: "",
  });

  // const [form, setForm] = React.useState({
  //   name: "",
  //   phone: phone,
  //   birthday: "",
  //   email: "",
  // });

  const [welcome, setWelcome] = React.useState({
    salute: "",
    gift: "",
  });

  React.useEffect(() => {
    if (form.name === "") {
      // Ativa o botão de "não quero deixar meus dados" quando o nome está vazio

      anonymousClient.current.disabled = false;
    } else {
      // Desativa o botão quando há dados no nome

      anonymousClient.current.disabled = true;
    }
  }, [form]);

  // FIRESTORE
  const db = getFirestore(app);

  React.useEffect(() => {
    async function CheckLogin() {
      const userId = await CheckUser("userMenu");
      if (userId === "/") {
        global.setAuthorizated(true);
        navigate(userId);
      }
    }
    CheckLogin();
  }, []);

  function handleSubmit(event) {
    event.preventDefault();

    // Preenche o formulário com dados default se o nome estiver vazio
    const formToSubmit =
      form.name === ""
        ? {
            name: "anonimo",
            phone: "777",
            birthday: "77",
            email: "anonimo@anonimo.com",
          }
        : form;

    // Envia o formulário para o Firestore
    addDoc(collection(db, "user"), formToSubmit)
      .then((docRef) => {
        global.setId(docRef.id); // Pega o id do cliente criado e manda para o meu useContext para vincular os pedidos ao cliente que os fez
        const currentUser = {
          id: docRef.id,
          name: formToSubmit.name,
        };
        localStorage.setItem("userMenu", JSON.stringify(currentUser));
        setForm({
          name: "",
          phone: "",
          birthday: "",
          email: "",
        });
      })
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // function handleChange({ target }) {
  //   const { id, value } = target;

  //   // Chama handlePhoneChange para formatar e validar em tempo real
  //   if (id === "phone") {
  //     handlePhoneChange(value); // Formata o telefone em tempo real
  //     setForm((prevForm) => ({
  //       ...prevForm,
  //       [id]: value, // Atualiza o valor de phone no estado do formulário, se necessário
  //     }));
  //   }

  //   // Atualiza o estado do formulário com o valor formatado
  //   setForm((prevForm) => ({
  //     ...prevForm,
  //     [id]: value,
  //   }));
  // }

  function handleAnonymousSubmit(event) {
    event.preventDefault();

    // Define dados default e envia para o Firestore
    const formWithDefaults = {
      name: "anonimo",
      phone: "777",
      birthday: "77",
      email: "anonimo@anonimo.com",
    };

    addDoc(collection(db, "user"), formWithDefaults)
      .then((docRef) => {
        global.setId(docRef.id); // Pega o id do cliente criado e manda para o meu useContext para vincular os pedidos ao cliente que os fez
        const currentUser = {
          id: docRef.id,
          name: formWithDefaults.name,
        };
        localStorage.setItem("userMenu", JSON.stringify(currentUser));
        setForm({
          name: "",
          phone: "",
          birthday: "",
          email: "",
        });
      })
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <section className="welcome-message">
      <main>
        <h1>Seja bem vindo</h1>
        <p>{welcome.salute}</p>
        <p>{welcome.gift}</p>
      </main>
      <form onSubmit={handleSubmit} className="m-1">
        <Input
          id="name"
          required
          label="Nome"
          value={form.name}
          type="text"
          onChange={handleChange}
        />

        <Input
          id="phone"
          required
          label="Celular"
          value={form.phone}
          type="text"
          onChange={handleChange}
        />

        {error.phone && <div>{error.phone}</div>}
        <Input
          id="birthday"
          required
          label="Aniversário"
          value={form.birthday}
          type="date"
          onChange={handleChange}
        />
        {error.birthday && <div>{error.birthday}</div>}
        <Input
          id="email"
          required
          label="Email"
          value={form.email}
          type="email"
          onChange={handleChange}
        />
        <div className="create-new-customer-btns">
          <button type="submit" className="btn btn-primary">
            Enviar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAnonymousSubmit}
            ref={anonymousClient}
          >
            Não quero deixar meus dados
          </button>
        </div>
      </form>
      {/* <Link to="/menu" className="btn btn-warning">
        Não quero deixar meus dados
      </Link> */}
    </section>
  );
};

export default CreateCustomer;
