import React from 'react';
import '../assets/styles/WelcomeSaluteForm.css';
import Title from '../component/title.js';
import { app } from '../config-firebase/firebase.js';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function WelcomeSaluteForm() {
  const db = getFirestore(app);
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    gift: '',
    salute: '',
  });

  function handleChange({ target }) {
    const { id, value } = target;
    setForm({ ...form, [id]: value, [id]: value });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setDoc(doc(db, 'welcomeCustomer', 'Zju4GZbnQFaq4fWjGch1'), form).then(
        (docRef) => {
          navigate('/');
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container mt-5 p-3 bg-body-tertiar">
      <Link to="/admin/admin">
        <Title mainTitle="Saudação inicial" />
      </Link>
      <Title title="Crie um novo Usuário e senha" />
      <form onSubmit={handleSubmit} className="m-1">
        <div className="container-textArea">
          <div>
            <label>Crie uma saudação para a tela inicial do seu Menu</label>
            <textarea
              id="gift"
              className="text-area"
              value={form.gift}
              onChange={handleChange}
            >
              Saudação
            </textarea>
          </div>
          <div>
            <label>
              Descreva aqui o brinde que vai oferecer ao seu cliente por se
              cadastrar
            </label>
            <textarea
              id="salute"
              className="text-area"
              value={form.salute}
              onChange={handleChange}
            >
              Saudação
            </textarea>
          </div>
        </div>

        <button className="btn btn-primary">Enviar</button>
      </form>
    </div>
  );
}

export default WelcomeSaluteForm;
