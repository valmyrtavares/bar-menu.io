import React from 'react'
import Input from "../../component/Input.js";
import "../../assets/styles/NameForm.css"

const NameForm = ({justNameFantasy})=>{
    const [nameFantasey, setNameFantasy] = React.useState("")
   const  handleInput = (e) =>{
        setNameFantasy(e.target.value);
    }
    return (
        <div className='container-nameform'>
            <h3>COMO PODEMOS TE CHAMAR...</h3>
            <Input
          id="fantasyName"
          autocomplete="off"
          required
          label="Nome"
          value={nameFantasey}
          type="text"     
          onChange={handleInput}   
        />
        <button onClick={() =>justNameFantasy(nameFantasey) }>Continue</button>
        </div>
    )
}
export default NameForm