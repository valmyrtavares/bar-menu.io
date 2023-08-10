import MockData from "./MockData";
import React, {useState} from  'react'


function App(){ 

   const [data, setData] = useState(MockData);

   const toggleDisplay = (index) => () => {     
         setData((prevData) => {
        const newData = [...prevData];
        newData[index].display = !newData[index].display;      
        return newData;
      });
   }

    if (MockData === null) return null;
    return (
        <div>
           {MockData.map((item, index)=>(
        <div key={index}>            
        {item.category === "main" ? (  
           <><button onClick={toggleDisplay(index)} >{item.title}</button>   
             <p>{`${item.display}`}</p>
             {item.map((subItem, index) => (
             {subItem.ChildCategory === item.category ?(<p key={index}>estou aqui</p>):null}
        )}
              </>
        ) : null}
        </div>
           ))}   
           </div>
    )
}
export default App;