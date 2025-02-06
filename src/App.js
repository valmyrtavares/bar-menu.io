import React from 'react';
import {
  BrowserRouter,
  HashRouter,
  Route,
  useLocation,
  Routes,
  Navigate,
} from 'react-router-dom';
import MainMenu from './Pages/MainMenu';
import AddButtonForm from './Forms/AddButtonForm';
import AddSideDishesForm from './Forms/AddSideDishesForm';
import FormItem from './Forms/AddDishesForm';
import Header from './component/header';
import Signup from './Forms/Login/signup';
import Login from './Forms/Login/login';
import Admin from './Pages/FormMenu';
import AdminMainMenu from './Pages/AdminMainMenu';
import Protected from './component/Protected';
import OperationCostRegister from './component/Request/OperationCostRegister';
import FormFrontImage from './Forms/formFrontImage';
import ListToEditAndDelete from './Forms/ListToEditAndDelete';
// import ProtectedUser from "./component/ProtectedUser";
import CreateCustomer from './Forms/Login/createCustomer';
import RequestModal from './component/Request/requestModal';
import ScreenStylesForm from './Forms/ScreenStylesForm';
import WelcomeSaluteForm from './Forms/WelcomeSaluteForm';
import RequestListToBePrepared from './component/Request/RequestListToBePrepared';
import OrderQueue from './component/orderQueue';
import RequestList from './component/Request/RequestList';
import Promotions from './component/Promotions/CreatePromotions';
import RecipeDish from './Forms/recipeDishForm';
import CustomerList from './component/Customers/customerList';
import ExpensesManegementList from './component/Payment/ExpensesManegementList/ExpensesManegementList';
import TrackStockProduct from './component/Stock/TrackStockProduct';
import NoLog from './Forms/Login/NoLog';
import PrintRequestCustomer from './component/Request/PrintRequestCustomer';
import RequestManagementModule from './component/Request/requestManagementModule';
import SellFlowMangement from './component/Request/SellFlowMangement';
import FiscalAttributes from './component/Request/FiscalAttributes';

import './style.css';
import ManagementRecipes from './component/Recipes/ManagementRecipes';

function App() {
  const [showHeader, setShowHeader] = React.useState(true);
  const location = useLocation();

  React.useEffect(() => {
    // Verifica se a URL atual é exatamente "/admin"
    if (location.pathname.startsWith('/admin')) {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }
  }, [location.pathname]); // Reexecuta sempre que a URL muda

  return (
    <div className="ultra-wrapper">
      {showHeader && <Header />}

      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/create-customer" element={<CreateCustomer />} />
        <Route path="/request" element={<RequestModal />} />
        <Route path="/orderqueue" element={<OrderQueue />} />

        <Route path="/nfce" element={<FiscalAttributes />} />
        <Route path="/print" element={<PrintRequestCustomer />} />
        {/* <Route path="/admin/editButton" element={<EditFormButton />} /> */}

        <Route path="/admin/recipedish" element={<RecipeDish />} />

        {/* <Route
            path="/admin/SideDisehsInDishes"
            element={<NoNameSideDisehsInDishes />}
            /> */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/check-customer-nolog" element={<NoLog />} />
        <Route path="/admin/signup" element={<Signup />} />
        <Route path="/admin" element={<Protected />} />
        <Route path="/admin/signup" element={<Signup />} />
        {/* <Route path="/admin/admin" element={<Admin />} /> */}
        <Route path="/admin/*" element={<AdminMainMenu />}>
          <Route path="expenses" element={<ExpensesManegementList />} />
          <Route path="sell-flow" element={<SellFlowMangement />} />
          <Route path="request" element={<RequestManagementModule />} />
          <Route path="stock" element={<TrackStockProduct />} />
          <Route path="requestlist" element={<RequestListToBePrepared />} />
          <Route path="item" element={<FormItem />} />
          <Route path="EditButton/:id" element={<ListToEditAndDelete />} />
          <Route path="category" element={<AddButtonForm />} />
          <Route path="customer" element={<CustomerList />} />
          <Route path="sidedishes" element={<AddSideDishesForm />} />
          <Route path="frontimage" element={<FormFrontImage />} />
          <Route path="styles" element={<ScreenStylesForm />} />
          <Route path="operationCost" element={<OperationCostRegister />} />
          <Route path="promotions" element={<Promotions />} />
          <Route path="welcome" element={<WelcomeSaluteForm />} />
          <Route path="requestlistcheck" element={<RequestList />} />
          <Route path="managementRecipes" element={<ManagementRecipes />} />
        </Route>

        <Route path="*" element={<Navigate to="/bar-menu.io" replace />} />
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    </div>
  );
}

export default App;
//"homepage": "https://valmyrtavares.github.io/bar-menu.io",
