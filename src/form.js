import React from 'react';
import Input from './component/Input';
import { fetchCategories, fetchCategoriesItem } from './api/buttonApi';
import './assets/styles/form.css';
import Title from './component/title';

function Form() {
  const [form, setForm] = React.useState({
    title: '',
    category: '',
    parent: '',
    display: '',
  });
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    const fetchCategory = async () => {
      const grabCategory = await fetchCategories('button');
      grabCategory.unshift('Selecione uma categoria'); // Add a first option
      setCategories(grabCategory);
    };
    fetchCategory();
  }, []);

  function handleSubmit(event) {
    event.preventDefault(); // Impede o comportamento padrão de recarregar a página
    console.log(form);
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

  function handleChange({ target }) {
    const { id, value } = target;
    setForm({ ...form, [id]: value, [id]: value, [id]: value, [id]: value });
  }

  return (
    <div className="container mt-5 p-3 bg-body-tertiar">
      <Title title="Adicione um novo botão" />
      <form onSubmit={handleSubmit} className="m-1">
        <Input
          id="title"
          label="title"
          value={form.title}
          type="text"
          onChange={handleChange}
        />
        <div className="my-3">
          <label className="form-label">Categoria</label>
          <select
            id="category"
            className="form-select"
            value={form.category}
            onChange={handleChange}
          >
            {categories &&
              categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
          </select>
        </div>
        <Input
          id="parent"
          label="Parent"
          value={form.parent}
          type="text"
          onChange={handleChange}
        />
        <Input
          id="display"
          label="Display"
          value={form.display}
          type="text"
          onChange={handleChange}
        />
        <button className="btn btn-primary">Enviar</button>
      </form>
    </div>
  );
}
export default Form;
