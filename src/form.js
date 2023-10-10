import React from 'react';
import Input from './component/Input';
import {fetchCategories, fetchCategoriesItem} from './api/buttonApi';
import './styles/form.css';

function Form(){
     const [form, setForm] = React.useState({
      title: "",
      category: "",
      parent: "",
      display: ""      
    })
    const [categories, setCategories] = React.useState([]);

    React.useEffect(()=>{
      const fetchCategory = async () => {
        const categories = await fetchCategories();
        setCategories(categories)
      }
      fetchCategory();
      console.log(categories);

      //    const fetchCategoryItem = async () => {
      //   const cat = await fetchCategoriesItem();
      //   setCategories(categories)
      // }
      // fetchCategoryItem();
      // console.log(categories);
      
    },[])

    function handleSubmit(event) {
        event.preventDefault(); // Impede o comportamento padrão de recarregar a página
console.log(form)
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
      <form onSubmit={handleSubmit} className="form-position">
        <Input id="title" label="title" value={form.title} type="text" onChange={handleChange} />
           <select id="category" value={form.category} onChange={handleChange}>
           { categories.map((category)=>(
              <option value={category}>{category}</option>
            )
            )}
             
            </select>      
        <Input id="parent" label="Parent" value={form.parent} type="text" onChange={handleChange} />
        <Input id="display" label="Display" value={form.display} type="text" onChange={handleChange} />
        <button>Enviar</button>
      </form>

    )
}
export default Form