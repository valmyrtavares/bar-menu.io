import React from "react";
import { getBtnData, deleteData } from "../api/Api";
import AddButtonForm from "./AddButtonForm";
import AddDishesForm from "./AddDishesForm";
import { useParams } from "react-router-dom";
import "../assets/styles/ListToEditAndDelete.css";
import MenuButton from "../component/menuHamburguerButton";
import AddSideDishesForm from "./AddSideDishesForm";
//import CloseButton from 'react-bootstrap/CloseButton';

const EditFormButton = () => {
  const [menuButton, setMenuButton] = React.useState([]);
  const [dishes, setDishes] = React.useState([]);
  const [sideDishes, setSideDishes] = React.useState([]);
  const [modalEditButton, setModalEditButton] = React.useState(false); //Open and close Por-up Edit Button
  const [modalEditDishes, setModalEditDishes] = React.useState(false); //Open and close Por-up Edit Dishes
  const [modalEditSideDishes, setModalEditSideDishes] = React.useState(false); //Open and close Por-up Edit SideDishes
  const [dataObj, setDataObj] = React.useState({});
  const { id } = useParams();
  const EditDishesTitle = "Edite o Prato";
  const EditButtonTitle = "Edite o Botão";
  const EditSideDishesTitle = "Edite o Acompanhamento";

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, dataItem, sideDishes] = await Promise.all([
          getBtnData("button"),
          getBtnData("item"),
          getBtnData("sideDishes"),
        ]);
        setMenuButton(data);
        setDishes(dataItem);
        console.log(dataItem);
        setSideDishes(sideDishes);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);

  async function grabItem(item) {
    alert(
      `Você está prestes a deletar ${item.title} tem certeza que quer fazer isso?`
    );
    if (id === "cat") {
      let res = item.title
        .replace(/\s/g, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

      let bastardChildrens = [
        ...menuButton.filter((item) => item.category === res),
        ...dishes.filter((item) => item.category === res),
      ];

      if (bastardChildrens.length > 0) {
        alert(
          `Você não pode deletar ${item.title} porque ele outros elementos que não podem ser excluidos. Você precisa exclui-los`
        );
        return;
      }
      await fetchData("button", item.id);
    } else if (id === "dishes") {
      await fetchData("item", item.id);
    } else if (id === "sidedishes") {
      await fetchData("sideDishes", item.id);
    }
  }

  const fetchData = async (collecton, n) => {
    const test = await deleteData(collecton, n);
  };

  //Open All Edit pop forms
  function openModal(item, type) {
    console.log(item);
    if (type === "button") {
      setModalEditButton(true);
      setDataObj(item);
    } else if (type === "dishes") {
      setModalEditDishes(true);
      console.log("ITEM   ", item);
      setDataObj(item);
    } else if (type === "sidedishes") {
      setModalEditSideDishes(true);
      setDataObj(item);
    }
  }

  // CHECK THIS CODE LINES
  function closeModal() {
    setModalEditButton(false);
    setModalEditDishes(false);
  }

  return (
    <div className="container">
      <MenuButton />
      {modalEditButton && (
        <div className="form-position">
          <AddButtonForm
            dataObj={dataObj}
            EditButtonTitle={EditButtonTitle}
            setModalEditButton={setModalEditButton}
          />
        </div>
      )}
      {menuButton &&
        id === "cat" &&
        menuButton.map((item, index) => {
          return (
            <div key={index} className="row my-3">
              <h2 className="col-5">{item.title}</h2>
              <button
                className="btn btn-danger col-3 mx-1"
                onClick={() => grabItem(item)}
              >
                Excluir{" "}
              </button>
              <button
                className="btn btn-warning col-3"
                onClick={() => openModal(item, "button")}
              >
                Editar{" "}
              </button>
            </div>
          );
        })}
      {modalEditDishes && (
        <div className="form-position">
          {/* <CloseButton onClick={() => closeModal()} /> */}
          <AddDishesForm
            dataObj={dataObj}
            mainTitle={EditDishesTitle}
            setModalEditDishes={setModalEditDishes}
          />
        </div>
      )}
      {menuButton && // Why manuButton again ???
        id === "dishes" &&
        dishes.map((item, index) => {
          return (
            <div key={index} className="row my-3">
              <h2 className="col-5 title-dishes">{item.title}</h2>
              <button
                className="btn btn-danger col-3 mx-1"
                onClick={() => grabItem(item)}
              >
                Excluir{" "}
              </button>
              <button
                className="btn btn-warning col-3"
                onClick={() => openModal(item, "dishes")}
              >
                Editar{" "}
              </button>
            </div>
          );
        })}
      {/* IMPLEMENTING NEW EDIT POP-UP SIDE DISHES */}

      {modalEditSideDishes && (
        <div className="form-position">
          <AddSideDishesForm
            dataObj={dataObj}
            EditSideDishesTitle={EditSideDishesTitle}
            setModalEditSideDishes={setModalEditSideDishes}
          />
        </div>
      )}

      {/* {************************************************} */}
      {sideDishes &&
        id === "sidedishes" &&
        sideDishes.map((item, index) => {
          return (
            <div key={index} className="row my-3">
              <h2 className="col-5 title-dishes">{item.sideDishes}</h2>
              <button
                className="btn btn-danger col-3 mx-1"
                onClick={() => grabItem(item)}
              >
                Excluir{" "}
              </button>
              <button
                className="btn btn-warning col-3"
                onClick={() => openModal(item, "sidedishes")}
              >
                Editar{" "}
              </button>
            </div>
          );
        })}
    </div>
  );
};

export default EditFormButton;
