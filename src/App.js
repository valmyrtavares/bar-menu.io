import React from 'react';
import NestedBtn from './nestedBtn';
import Form from './form';
import Button from './component/Button';
import {getBtnData} from './api/buttonApi';
import FormItem from  './formItem';
import Header from './component/header';
import  CarrosselImages from './component/carrosselImages';


function App() {

  const [displayForm, setDisplayForm] = React.useState(false);
   const [menuButton, setMenuButton] = React.useState([]);

 React.useEffect(() => {
   const fetchData = async() =>{
    try{
      const data = await getBtnData();         
      setMenuButton(data)
    }catch(error) {
      console.error("Error fetching data", error);
    }
   };
   fetchData();
   
  },[]);


  //Show for now the form
  function  showForm(){
  setDisplayForm(!displayForm);
  }

//butons collections
  if (menuButton === null) return null;
  return (
    <div> 
      {false &&<Header />   } 
      {true && <CarrosselImages/>}        
      {false && <Form />}
     
      {menuButton.map((item, index) => (
        <div key={index}>
          <NestedBtn parent={"main"} item={item} menuButton={menuButton}  />
        </div>
      ))}
      <div>
        {false && <FormItem/>}
      </div>
    </div>
  );
}

export default App;