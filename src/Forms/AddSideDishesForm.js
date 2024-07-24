import React from "react";
import Input from "../component/Input.js";
import Title from "../component/title.js";
import { app, storage } from "../config-firebase/firebase.js";
import MenuButton from "../component/menuHamburguerButton.js";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
} from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import "../assets/styles/form.css";

function AddSideDishesForm() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    price: 0,
    sideDishes: "",
  });

  //FIRESTORE
  const db = getFirestore(app);

  function handleChange({ target }) {
    const { id, value, type, checked } = target;

    setForm({
      ...form,
      [id]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (form.price && form.sideDishes) {
      addDoc(collection(db, "sideDishes"), form)
        .then((docRef) => {
          navigate("/");
        })
        .catch((error) => {
          console.log(error);
        });
    }
    alert("Os campos precisan ser integralmente preenchidos");
  }

  return (
    <div className="Edit-Add-Popup mt-5 p-3 bg-body-tertiar">
      <Title mainTitle="Adicione um novo Acompanhamento " />
      <form onSubmit={handleSubmit} className="m-1">
        <Input
          id="sideDishes"
          label="Acompanhamento"
          value={form.sideDishes}
          type="text"
          onChange={handleChange}
        />
        <Input
          id="price"
          label="Valor"
          value={form.price}
          type="text"
          onChange={handleChange}
        />
        <button className="btn btn-primary">Enviar</button>
      </form>
    </div>
  );
}
export default AddSideDishesForm;
