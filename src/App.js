import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainMenu from './Pages/MainMenu';
import Form from './form';
import FormItem from './formItem';
import Header from './component/header';
import MenuButton from './component/menuButton';

function App() {
  return (
    <BrowserRouter>
      {true && <Header />}
      <MenuButton />
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/admin/item" element={<FormItem />} />
        <Route path="/admin/category" element={<Form />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
