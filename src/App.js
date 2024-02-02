import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainMenu from './Pages/MainMenu';
import Form from './form';
import FormItem from './formItem';
import Header from './component/header';
import MenuButton from './component/menuButton';
import Signup from './Login/signup';
import Login from './Login/login';
import Admin from './Pages/FormMenu';
import Protected from './component/Protected';
import EditFormButton from './EditFormButton';

function App() {
  return (
    <BrowserRouter>
      {true && <Header />}
      <MenuButton />
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/admin/editButton" element={<EditFormButton />} />
        <Route path="/admin/EditButton/:id" element={<EditFormButton />} />
        <Route path="/admin/item" element={<FormItem />} />
        <Route path="/admin/category" element={<Form />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/signup" element={<Signup />} />
        <Route path="/admin" element={<Protected />} />
        <Route path="/admin/admin" element={<Admin />} />
        <Route />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
