import React from "react";
import CarrosselImages from "../component/carouselComponent";
import NestedBtn from "../component/nestedBtn";
import { getBtnData, getOneItemColleciton, deleteData } from "../api/Api";
import MenuButton from "../component/menuHamburguerButton";
import RequestModal from "../component/Request/requestModal.js";
import { Link, useNavigate } from "react-router-dom";
import "../assets/styles/mainMenu.css";
import { common } from "@mui/material/colors";
import { GlobalContext } from "../GlobalContext";
import { CheckUser, updatingSideDishes } from "../Helpers/Helpers.js";
import WarningMessage from "../component/WarningMessages";

function MainMenu() {
  // const [displayForm, setDisplayForm] = React.useState(false);
  const [menuButton, setMenuButton] = React.useState([]);
  const [dishes, setDishes] = React.useState([]);
  const [nameClient, setNameClient] = React.useState("");
  const containerRef = React.useRef(null);
  const global = React.useContext(GlobalContext);
  const [logoutAdminPopup, setLogoutAdminPopup] = React.useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    if (!global.authorizated) {
      CheckLogin();
    }
    const fetchData = async () => {
      try {
        const [data, dataItem] = await Promise.all([
          getBtnData("button"),
          getBtnData("item"),
        ]);
        setMenuButton(data);
        setDishes(dataItem);
        grabClient();
      } catch (error) {
        console.error("Erro fetching data", error);
      }
    };   
    fetchData();
  }, []);

  const logoutCustomer = () => {
    if (global.isToten) {
      if (logoutAdminPopup) {
        localStorage.removeItem("userMenu");
        global.setAuthorizated(false);
        CheckLogin();
      }
      setLogoutAdminPopup(true);
    }
  };
  async function CheckLogin() {
    const userId = await CheckUser("userMenu");
    navigate(userId);
  }

  function grabClient() {
    if (localStorage.hasOwnProperty("userMenu")) {
      const nameCustomer = JSON.parse(localStorage.getItem("userMenu"));
      console.log("nameCustomer   ", nameCustomer);
      if (nameCustomer.name === "anonimo") {
        deleteAnonymousWithnoItem(nameCustomer.id);
      }

      let firstName = nameCustomer.name.split(" ")[0];
      firstName =
        firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      setNameClient(firstName);
    }
  }

  const deleteAnonymousWithnoItem = (id) => {
    //Delete customer loged as anonimo and during 2 minutes does not have requestlog like anonimo and during 2 min does not have request
    setTimeout(async () => {
      try {
        const data = await getOneItemColleciton("user", id);
        if (!data?.request || data?.request.length === 0) {
          await deleteData("user", id);
          localStorage.removeItem("userMenu");
          global.setAuthorizated(false);
          CheckLogin();
        }
      } catch (error) {
        console.error("Erro ao buscar e deletar dados", error);
      }
    }, 120000);
  };

  return (
    <>
      <div className="WarningMessage-container">
        {logoutAdminPopup && (
          <WarningMessage
            message="Você está prestes a sair do sistema"
            setWarningMsg={setLogoutAdminPopup}
            sendRequestToKitchen={logoutCustomer}
          />
        )}
      </div>

      <div ref={containerRef} style={{ height: "80vh", overflowY: "auto" }}>
        {true && <CarrosselImages />}
        <div className="container-btn">
          {nameClient && (
            <section>
              <div>
                <p onClick={logoutCustomer}>
                  Bem vindo <span>{nameClient}</span>
                </p>
              </div>
              <button>
                <Link to="/request">Seus Pedidos</Link>
              </button>
              <button>
                <Link to="/orderqueue">Fila de pedidos</Link>
              </button>
            </section>
          )}
          {menuButton &&
            dishes &&
            menuButton.map((item, index) => (
              <div key={index}>
                <NestedBtn
                  containerRef={containerRef}
                  parent={"main"}
                  item={item}
                  menuButton={menuButton}
                  dishes={dishes}
                />
              </div>
            ))}
        </div>
      </div>
      <Link to="/admin/admin">
        <div className="footer"></div>
      </Link>
    </>
  );
}
export default MainMenu;
