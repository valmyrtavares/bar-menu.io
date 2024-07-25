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

function AddSideDishesForm({
  dataObj,
  EditSideDishesTitle,
  setModalEditSideDishes,
}) {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    price: 0,
    sideDishes: "",
  });
  const [noNavigate, setNoNavigate] = React.useState(false);
  const [hideShowCheckForm, setHideShowCheckForm] = React.useState(true);

  //FIRESTORE
  const db = getFirestore(app);

  React.useEffect(() => {
    if (dataObj) {
      setHideShowCheckForm(false);
    }
  });

  function handleChange({ target }) {
    const { id, value } = target;
    setForm({
      ...form,
      [id]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!dataObj) {
      if (form.price && form.sideDishes) {
        addDoc(collection(db, "sideDishes"), form)
          .then((docRef) => {
            if (!noNavigate) {
              navigate("/admin/editButton/sidedishes");
            } else {
              setForm({ price: 0, sideDishes: "" });
            }
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } else {
      setDoc(doc(db, "sideDishes", dataObj.id), form)
        .then(() => {
          console.log("Document successfully updated !");
          setModalEditSideDishes(false);
        })
        .catch((error) => {
          console.log(error);
        });
      return;
    }
  }
  function changeUrl() {
    setNoNavigate(!noNavigate);
  }
  // Bring the data from listToEditAndDelete to form local
  React.useEffect(() => {
    if (dataObj) {
      setForm(dataObj);
    }
  }, [dataObj]);

  return (
    <div className="Edit-Add-Popup mt-5 p-3 bg-body-tertiar">
      <div className="close-btn">
        <Link to="/admin/admin">X</Link>
      </div>
      <Title
        mainTitle={
          EditSideDishesTitle
            ? EditSideDishesTitle
            : "Adicione um novo Acompanhamento 123"
        }
      />
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
      {hideShowCheckForm && (
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
      )}
    </div>
  );
}
export default AddSideDishesForm;
