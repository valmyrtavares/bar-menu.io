import React from "react";
import { fetchCategoriesItem } from "../api/Api.js";
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
import IncludeSideDishesForm from "./IncludeSideDishesForm.js";
import "../assets/styles/form.css";
//import { cardClasses } from "@mui/material";

function AddDishesForm({ dataObj, mainTitle, setModalEditDishes }) {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    title: "",
    category: "",
    comment: "",
    price: 0,
    image: "",
    display: false,
    carrossel: false,
    sideDishesElementList: [],
    maxLimitSideDishes: 0,
  });
  const [categories, setCategories] = React.useState([]);
  const [url, setUrl] = React.useState("");
  const [progress, setProgress] = React.useState(0);
  const [showPopupSideDishes, setShowPopupSideDisehs] = React.useState(false);
  const [newSideDishesList, setNewSideDishesList] = React.useState([]);
  const [maxLimitSideDishes, setMaxLimitSideDishes] = React.useState([]);

  //FIRESTORE
  const db = getFirestore(app);

  //Update the new side dishes that come from noNameDishesInDishes
  React.useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      sideDishesElementList: newSideDishesList,
      maxLimitSideDishes: maxLimitSideDishes,
    }));
  }, [newSideDishesList, maxLimitSideDishes]);

  React.useEffect(() => {
    fetchCategories();
  }, []);

  React.useEffect(() => {
    if (dataObj) {
      setForm(dataObj);
    }
  }, [dataObj]);

  React.useEffect(() => {
    console.log("Novos Acompanhamentos   ", newSideDishesList);
  });

  const fetchCategories = async () => {
    const categories = await fetchCategoriesItem("button");
    categories.unshift("Selecione uma categoria"); // Add a first option
    setCategories(categories);
  };

  function handleChange({ target }) {
    const { id, value, type, checked } = target;

    if (type === "checkbox") {
      setForm({
        ...form,
        [id]: checked, // Use checked diretamente, que já é um booleano
      });
    } else {
      setForm({
        ...form,
        [id]: value,
      });
    }
  }

  const onfileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const path = `dishes/${file.name}`;
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Progress function (optional)
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error(error);
        },
        async () => {
          // Handle successful uploads
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUrl(downloadURL);
          form.image = downloadURL;
        }
      );
    }
  };

  function handleSubmit(event) {
    event.preventDefault();
    if (!dataObj) {
      addDoc(collection(db, "item"), form)
        .then((docRef) => {
          navigate("/");
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      setDoc(doc(db, "item", dataObj.id), form)
        .then(() => {
          console.log("FORM   ", form);
          navigate("/");
          console.log("Document successfully updated !");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  return (
    <div className="Edit-Add-Popup mt-5 p-3 bg-body-tertiar">
      <div className="close-btn">
        {setModalEditDishes ? (
          <button onClick={() => setModalEditDishes(false)}>X</button>
        ) : (
          <Link to="/admin/admin">X</Link>
        )}
      </div>
      <Title mainTitle={mainTitle ? mainTitle : "Adicione um novo prato"} />
      <form onSubmit={handleSubmit} className="m-1">
        <Input
          id="title"
          label="Titulo"
          value={form.title}
          type="text"
          onChange={handleChange}
        />
        <div className="my-3">
          <label className="form-label">Categoria</label>
          <select
            id="category"
            value={form.category}
            className="form-select"
            onChange={handleChange}
          >
            {categories &&
              categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
          </select>
        </div>
        <Input
          id="comment"
          label="Comentário"
          value={form.comment}
          type="text"
          onChange={handleChange}
        />
        <Input
          id="price"
          label="Preço"
          value={form.price}
          type="number"
          onChange={handleChange}
        />
        <Input
          id="image"
          label="Image"
          value={form.image}
          type="text"
          onChange={handleChange}
        />
        <Input
          id="sideDishesElementList"
          label="Image"
          value={form.sideDishesElementList}
          type="hidden"
          onChange={handleChange}
        />
        <Input
          id="maxLimitSideDishes"
          value={form.maxLimitSideDishes}
          type="hidden"
          onChange={handleChange}
        />

        <input type="file" onChange={onfileChange} />
        <progress value={progress} max="100" />
        {url && <img className="image-preview" src={url} alt="Uploaded file" />}
        <div className="form-check my-1">
          <input
            className="form-check-input"
            id="carrossel"
            type="checkbox"
            checked={form.carrossel}
            onChange={handleChange}
          />
          <label className="form-check-label">
            Adicionar item ao carrossel
          </label>
        </div>
        <button className="btn btn-primary">Enviar</button>
      </form>
      {showPopupSideDishes && (
        <div className="container-new-sideDishes">
          <IncludeSideDishesForm
            setShowPopupSideDisehs={setShowPopupSideDisehs}
            setNewSideDishesList={setNewSideDishesList}
            setMaxLimitSideDishes={setMaxLimitSideDishes}
          />
        </div>
      )}
      <div>
        <button
          className="btn btn-success m-5"
          onClick={() => setShowPopupSideDisehs(true)}
        >
          {" "}
          Acrescente acompanhamentos opcionais ao prato
        </button>
      </div>
    </div>
  );
}
export default AddDishesForm;
