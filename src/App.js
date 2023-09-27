import React from 'react';
import NestedBtn from './nestedBtn';
import Form from './form';
import Button from './component/Button';
import {getBtnData} from './api/buttonApi';
import Banner from  './component/banner';


function App() {

  const [displayForm, setDisplayForm] = React.useState(false);
   const [menuButton, setMenuButton] = React.useState([]);

 React.useEffect(() => {
   const fetchData = async() =>{
    try{
      const data = await getBtnData();
      console.log(data)      
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
      <Banner />   
      {menuButton.map((item, index) => (
        <div key={index}>
          <NestedBtn parent={"main"} item={item} menuButton={menuButton}  />
        </div>
      ))}
      <Button click={showForm} label="show form"/>
      {displayForm && <Form />}
    </div>
  );
}

export default App;