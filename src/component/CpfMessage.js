import React from 'react';
import '../assets/styles/cpfMessage.css';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../GlobalContext';

const CpfMessage = ({ clientFinded, cpf, setCpfModal, pdv }) => {
  const navigate = useNavigate();
  const global = React.useContext(GlobalContext);

  const startService = () => {
    global.setId(clientFinded[0].id);
    global.setAuthorizated(true);
    const currentUser = {
      id: clientFinded[0].id,
      name: clientFinded[0].name,
    };
    localStorage.setItem('userMenu', JSON.stringify(currentUser));
    if (!pdv) {
      let backorder = [];
      if (localStorage.getItem('backorder')) {
        try {
          backorder = JSON.parse(localStorage.getItem('backorder'));
        } catch (e) {}
      }
      
      if (backorder && backorder.length > 0) {
        navigate('/request');
      } else {
        const table = localStorage.getItem('tableNumber');
        if (table) {
          navigate(`/${table}`);
        } else {
          navigate('/');
        }
      }
    } else {
      navigate('/admin/requestlist');
    }
    setCpfModal(false);
  };
  const backToCreateProfile = () => {
    setCpfModal(false);
  };

  return (
    <div className="container-cpf-message">
      <h1>Bem vindo {clientFinded[0].name} </h1>
      <p> Confirme seu número de cpf e vamos em frente</p>
      <h3>{cpf}</h3>
      <div className="create-new-customer-btns">
        <button className="btn btn-primary" onClick={backToCreateProfile}>
          Corrigir
        </button>
        <button
          onClick={startService}
          type="button"
          className="btn btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
export default CpfMessage;
