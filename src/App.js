import React from "react";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import MainMenu from "./Pages/MainMenu";
import AddButtonForm from "./Forms/AddButtonForm";
import AddSideDishesForm from "./Forms/AddSideDishesForm";
import FormItem from "./Forms/AddDishesForm";
import Header from "./component/header";
import Signup from "./Forms/Login/signup";
import Login from "./Forms/Login/login";
import Admin from "./Pages/FormMenu";
import Protected from "./component/Protected";
import FormFrontImage from "./Forms/formFrontImage";
import ListToEditAndDelete from "./Forms/ListToEditAndDelete";
import ProtectedUser from "./component/ProtectedUser";
import CreateCustomer from "./Forms/Login/createCustomer";
import RequestModal from "./component/Request/requestModal";
import ScreenStylesForm from "./Forms/ScreenStylesForm";
import WelcomeSaluteForm from "./Forms/WelcomeSaluteForm";
import RequestListToBePrepared from "./component/Request/RequestListToBePrepared";

import "./style.css";

function App() {
  const basename = "/bar-menu.io";
  //const basename = "/";
  return (
    <div className="ultra-wrapper">
      <BrowserRouter basename={basename}>
        {true && <Header />}

        <Routes>
          <Route path="/menu" element={<MainMenu />} />
          <Route path="/" element={<ProtectedUser />} />
          <Route path="/create-customer" element={<CreateCustomer />} />
          <Route path="/request" element={<RequestModal />} />

          {/* <Route path="/admin/editButton" element={<EditFormButton />} /> */}
          <Route
            path="/requestlist/:id"
            element={<RequestListToBePrepared />}
          />
          <Route
            path="/admin/EditButton/:id"
            element={<ListToEditAndDelete />}
          />
          <Route path="/admin/item" element={<FormItem />} />
          <Route path="/admin/category" element={<AddButtonForm />} />
          {/* <Route
            path="/admin/SideDisehsInDishes"
            element={<NoNameSideDisehsInDishes />}
          /> */}
          <Route path="/admin/sidedishes" element={<AddSideDishesForm />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/signup" element={<Signup />} />
          <Route path="/admin" element={<Protected />} />
          <Route path="/admin/signup" element={<Signup />} />
          <Route path="/admin/admin" element={<Admin />} />
          <Route path="/admin/frontimage" element={<FormFrontImage />} />
          <Route path="/admin/styles" element={<ScreenStylesForm />} />
          <Route path="/admin/welcome" element={<WelcomeSaluteForm />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

//MainMenu    tela principal       /
//EditFormButton sem dia não existe
//EditFormButton   editar ambas telas de pratos e botões
//FormItem adicionar um novo prato
//Form   Adicionar um novo botão
//Login é a tela igual a de singup protegida
// Signup Não existe link diponivel mas a tela já existe
//Protected vai para a escolha entre o menu administrador e a tela de login
//Admin vai para menu do administrador
