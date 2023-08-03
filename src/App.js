import MockData from "./MockData";
import Btn from "./component/btn";
import React, {useState} from  'react'

function App(){ 

    if (MockData === null) return null;
    return (
        <div>
           {MockData.map((item, index)=>(
        <div key={index}>              
            <Btn item={item} />
        </div>
           ))}   
           </div>
    )
}
export default App;