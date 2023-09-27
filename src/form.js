import React from 'react';
import Input from './component/Input';

function Form(){
     const [form, setForm] = React.useState({
      title: "",
      category: "",
      parent: "",
      display: ""      
    })

    function handleSubmit(event) {
        event.preventDefault(); // Impede o comportamento padrão de recarregar a página

        fetch('https://react-bar-67f33-default-rtdb.firebaseio.com/button.json', {
            method: 'POST',
            body: JSON.stringify(form), // Converte o objeto form em JSON
            headers: {
            'Content-Type': 'application/json',
        },
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Erro ao enviar os dados para o Firebase.');
      }
      return response.json();
    })
    .then((data) => {
      console.log('Dados enviados com sucesso:', data);
    })
    .catch((error) => {
      console.error('Erro:', error);
    });
  }

    function handleChange({target}){
      const {id, value} = target;
      setForm({...form, [id]: value, [id]: value, [id]: value, [id]: value})
    }
   

    return (
      <form onSubmit={handleSubmit}>
        <Input id="title" label="title" value={form.title} type="text" onChange={handleChange} />
        <Input id="category" label="Category" value={form.category} type="text" onChange={handleChange} />
        <Input id="parent" label="Parent" value={form.parent} type="text" onChange={handleChange} />
        <Input id="display" label="Display" value={form.display} type="text" onChange={handleChange} />
        <button>Enviar</button>
      </form>

    )
}
export default Form