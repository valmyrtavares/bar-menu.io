import React from "react";
import Input from "../../component/Input.js";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../../config-firebase/firebase.js";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from "../../GlobalContext";
import "../../assets/styles/createCustomer.css";
import { Link } from "react-router-dom";
import { getBtnData } from "../../api/Api.js";

const CreateCustomer = () => {
  const navigate = useNavigate();
  const global = React.useContext(GlobalContext);

  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    birthday: "",
    email: "",
  });

  const [welcome, setWelcome] = React.useState({
    salute: "",
    gift: "",
  });

  //FIRESTORE
  const db = getFirestore(app);

  React.useEffect(() => {
    const fetchDatafunction = async () => {
      const data = await getBtnData("welcomeCustomer");
      if (data) {
        setWelcome(data[0]);
      }
    };
    fetchDatafunction();
  });

  function handleSubmit(event) {
    event.preventDefault();
    addDoc(collection(db, "user"), form)
      .then((docRef) => {
        global.setId(docRef.id); //Pego o id do cliente criado e mando para o meu useContext para vincular os pedidos ao cliente que os fez
        const currentUser = {
          id: docRef.id,
          name: form.name,
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

  function handleChange({ target }) {
    const { id, value } = target;
    setForm({ ...form, [id]: value, [id]: value, [id]: value, [id]: value });
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
          label="Nome"
          value={form.name}
          type="text"
          onChange={handleChange}
        />

        <Input
          id="phone"
          label="Celular"
          value={form.phone}
          type="text"
          onChange={handleChange}
        />
        <Input
          id="birthday"
          label="Aniversário"
          value={form.birthday}
          type="text"
          onChange={handleChange}
        />
        <Input
          id="email"
          label="Email"
          value={form.email}
          type="email"
          onChange={handleChange}
        />
        <button className="btn btn-primary">Enviar</button>
      </form>
      <Link to="/menu" className="btn btn-warning">
        Não quero deixar meus dados
      </Link>
    </section>
  );
};
export default CreateCustomer;
