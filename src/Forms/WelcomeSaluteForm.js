import React from 'react';
import style from '../assets/styles/WelcomeSaluteForm.module.scss';
import Title from '../component/title.js';
import { db } from '../config-firebase/firebase.js';
import { setDoc, doc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

function WelcomeSaluteForm() {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    welcomeMessage: '',
    rewardDescription: '',
  });

  function handleChange({ target }) {
    const { id, value } = target;
    setForm({ ...form, [id]: value });
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
    <div className={style.containerWelcomeSalute}>
      <div className={style.containerIcon}>
        <a
          href="https://docs.google.com/document/d/1JO_71SmMvI_lkzAerER1YuuM_F-0Sdp6-dJrdy7E1oQ/edit?tab=t.24804x2kn895"
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir documentação"
        >
          <span>?</span>
        </a>
      </div>
      <Link to="/admin/admin">
        <Title mainTitle="Saudação Inicial e Brinde" />
      </Link>
      <Title title="Configurações de Boas-Vindas" />
      <form onSubmit={handleSubmit} className="m-1">
        <div className={style.containerTextArea}>
          <div>
            <label>Mensagem de Saudação</label>
            <textarea
              id="welcomeMessage"
              className={style.textArea}
              value={form.welcomeMessage}
              onChange={handleChange}
              placeholder="Ex: Seja bem-vindo ao nosso restaurante!"
              title="Esta mensagem aparecerá no topo da tela de login/cadastro para todos os clientes."
            />
          </div>
          <div>
            <label>Descrição do Brinde (Incentivo ao Cadastro)</label>
            <textarea
              id="rewardDescription"
              className={style.textArea}
              value={form.rewardDescription}
              onChange={handleChange}
              placeholder="Ex: Faça seu cadastro agora e ganhe uma sobremesa grátis!"
              title="Use este campo para oferecer um presente ao cliente em troca dos dados dele. Isso aumenta muito a taxa de cadastro."
            />
          </div>
        </div>

        <button className="btn btn-primary">Salvar Configurações</button>
      </form>
    </div>
  );
}

export default WelcomeSaluteForm;
