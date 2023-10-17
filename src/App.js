import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainMenu from './Pages/MainMenu';
// import NestedBtn from './nestedBtn';
// import Form from './form';
// import Button from './component/Button';
// import { getBtnData } from './api/buttonApi';
import FormItem from './formItem';
import Header from './component/header';
// import CarrosselImages from './component/carrosselImages';

function App() {
  // const [displayForm, setDisplayForm] = React.useState(false);
  // const [menuButton, setMenuButton] = React.useState([]);
  // React.useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const data = await getBtnData();
  //       setMenuButton(data);
  //     } catch (error) {
  //       console.error('Error fetching data', error);
  //     }
  //   };
  //   fetchData();
  // }, []);
  //Show for now the form
  // function showForm() {
  //   setDisplayForm(!displayForm);
  // }
  //butons collections
  // if (menuButton === null) return null;
  return (
    <>
      {true && <Header />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/admin/item" element={<FormItem />} />
        </Routes>
      </BrowserRouter>
    </>
    //   <div>
    //     {false && <CarrosselImages />}
    //     {false && <Form />}
    //     {menuButton.map((item, index) => (
    //       <div key={index}>
    //         <NestedBtn parent={'main'} item={item} menuButton={menuButton} />
    //       </div>
    //     ))}
    //     <div>{true && <FormItem />}</div>
    //   </div>
  );
}

export default App;
