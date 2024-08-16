import React from "react";
import "../assets/styles/menuButton.css";
import { Link, useNavigate } from "react-router-dom";

const MenuButton = () => {
  const [modal, setModal] = React.useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setModal(!modal);
  };

  React.useEffect(() => {
    setModal(false);
  }, [navigate]);

  return (
    <>
      <button data-menu="button" onClick={toggleMenu}></button>
      {modal && (
        <div className="modal_menu">
          <div className="close-btn">
            <button onClick={toggleMenu}>X</button>
          </div>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              {" "}
              <Link to="/admin">Admin</Link>
            </li>
            {/* <Link to="/admin/category">form categoria</Link>
            <li>
              <Link to="/admin/item">form pratos</Link>
            </li> */}
          </ul>
        </div>
      )}
    </>
  );
};
export default MenuButton;
