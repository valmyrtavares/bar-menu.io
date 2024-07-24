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
import { cardClasses } from "@mui/material";

function AddSideDishesForm() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    price: 0,
    sideDishes: "",
  });
  const [noNavigate, setNoNavigate] = React.useState(false);

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
          if (!noNavigate) {
            navigate("/admin/editButton/sidedishes");
            console.log("Não Clicado");
          } else {
            setForm({ price: 0, sideDishes: "" });
            console.log("Clicado");
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
    alert("Os campos precisan ser integralmente preenchidos");
  }
  function changeUrl() {
    console.log("Funcionando");
    setNoNavigate(!noNavigate);
    console.log(noNavigate);
  }

  return (
    <div className="Edit-Add-Popup mt-5 p-3 bg-body-tertiar">
      <div className="close-btn">
        <Link to="/admin/admin">X</Link>
      </div>
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
      </form>{" "}
      <div className="form-check my-1">
        <input
          className="form-check-input"
          id="carrossel"
          type="checkbox"
          checked={noNavigate}
          onChange={changeUrl}
        />
        <label className="form-check-label">
          Mantenha clicado se não quiser mudar de tela
        </label>
      </div>
    </div>
  );
}
export default AddSideDishesForm;
