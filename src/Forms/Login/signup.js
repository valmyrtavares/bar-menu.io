import React from 'react';
import Input from '../../component/Input.js';
import '../../assets/styles/form.css';
import Title from '../../component/title.js';
import { auth } from '../../config-firebase/firebase.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    email: '',
    password: '',
  });

  function handleChange({ target }) {
    const { id, value } = target;
    setForm({ ...form, [id]: value, [id]: value });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      const user = userCredential.user;
      localStorage.setItem('token', JSON.stringify(user.accessToken));
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container mt-5 p-3 bg-body-tertiar">
      <Title title="Crie um novo Usuário e senha" />
      <form onSubmit={handleSubmit} className="m-1">
        <Input
          id="email"
          label="email"
          value={form.email}
          type="email"
          onChange={handleChange}
        />

        <Input
          id="password"
          label="Password"
          value={form.password}
          type="password"
          onChange={handleChange}
        />

        <button className="btn btn-primary">Enviar</button>
      </form>
    </div>
  );
}

export default Signup;
