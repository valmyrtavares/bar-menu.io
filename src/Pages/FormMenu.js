import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Title from '../component/title.js';
//import UseLocalStorage from "../Hooks/useLocalStorage.js";
import '../assets/styles/FormMenu.css';
import WarningMessage from '../component/WarningMessages';

const FormMenu = () => {
  const navigate = useNavigate();
  const [logoutAdminPopup, setLogoutAdminPopup] = React.useState(false);

  React.useEffect(() => {
    if (!localStorage.hasOwnProperty('token')) {
      navigate('/admin/login');
    } else {
      const token = JSON.parse(localStorage.getItem('token'));
    }
  }, []);

  const logoutAdmin = () => {
    if (logoutAdminPopup) {
      localStorage.removeItem('token');
      navigate('/');
    }
    setLogoutAdminPopup(true);
  };

  return (
    <div className="form-menu-container">
      <div className="WarningMessage-container">
        {logoutAdminPopup && (
          <WarningMessage
            message="Você está prestes a sair do sistema"
            setWarningMsg={setLogoutAdminPopup}
            sendRequestToKitchen={logoutAdmin}
          />
        )}
      </div>
      <Title title="Menu de Formulários" />
      <h3>Novas categorias</h3>
      <div className="sub-container">
        <div className="btn-text">
          <p>
            Use essa seção para criar novas categorias de botões, que devem
            guardar outras subcategorias ou os itens finais referentes aos
            pratos relacionados{' '}
          </p>
        </div>
        <div className="btn-form">
          <Link to="/admin/category" className="btn btn-success  ">
            Adicione Botão{' '}
          </Link>
          <Link to="/admin/editButton/cat" className=" btn btn-success">
            Lista de Botões
          </Link>
        </div>
      </div>
      <h3>Novos Pratos</h3>
      <div className="sub-container">
        <div className="btn-text">
          <p>
            Use essa seção para criar novos pratos com preços, imagens,
            descrições, organizá-los dentro de categorias e editá-los e excluir{' '}
          </p>
        </div>
        <div className="btn-form">
          <Link to="/admin/item" className=" btn btn-success">
            Adicione um prato
          </Link>
          <Link to="/admin/editButton/dishes" className=" btn btn-success">
            Lista de pratos
          </Link>
        </div>
      </div>
      <h3>Novos Acompanhamentos</h3>
      <div className="sub-container">
        <div className="btn-text">
          <p>
            Use essa seção para criar novos acompanhamentos para usá-los junto
            aos pratos. Exclua e edite todos os itens criados aqui{' '}
          </p>
        </div>
        <div className="btn-form">
          <Link to="/admin/sidedishes" className=" btn btn-success sidedishe">
            Adicione Acompanhamentos
          </Link>

          <Link
            to="/admin/editButton/sidedishes"
            className="btn btn-success sidedishe"
          >
            Lista de acompanhamentos
          </Link>
        </div>
      </div>
      <h3>Gerencia de Fluxo</h3>
      <div className="sub-container">
        <div className="btn-text">
          <p>
            Use essa seção para criar acompanhar todos os clientes pedidos, por
            nome, data, e preferências. E criar uma rede te interação{' '}
          </p>
        </div>
        <div className="btn-form">
          <Link to="/admin/customer" className=" btn btn-success sidedishe">
            Lista de Clientes
          </Link>
          <Link to="/admin/request" className=" btn btn-success sidedishe">
            Lista de Pedidos
          </Link>
          <Link to="/admin/sell-flow" className=" btn btn-success sidedishe">
            Fechamento de Caixa
          </Link>
        </div>
      </div>
      <h3>Adicione sua marca</h3>
      <div className="sub-container">
        <div className="btn-text">
          <p>
            Envie nesse formulário a imagem do seu estabelecimento para que a
            sua marca participe de todas as áreas comuns do aplicativo, criando
            uma identidade viisual.Caso não tenha qualquer imagem pode
            substituí-la
          </p>
        </div>
        <div className="btn-form">
          <Link to="/admin/frontimage" className="btn btn-success ">
            Adicione sua marca
          </Link>
        </div>
      </div>
      <h3>Gerenciamento de Despesas</h3>
      <div className="sub-container">
        <div className="btn-text">
          <p>
            Crie uma lista de despesas fixas e móveis para que possa acompanhar
            e gerenciar o crescimento do seu estabelecimento
          </p>
        </div>
        <div className="btn-form">
          <Link to="/admin/expenses" className="btn btn-success ">
            Despesas
          </Link>
        </div>
      </div>
      <h3>Estoque</h3>
      <div className="sub-container">
        <div className="btn-text">
          <p>
            Acompanhe o seu estoque a cada produto vendido e a cada compra
            matéria prima adicionada
          </p>
        </div>
        <div className="btn-form">
          <Link to="/admin/stock" className="btn btn-success ">
            Estoque
          </Link>
        </div>
      </div>
      <h3>Modifique as cores e fontes </h3>
      <div className="sub-container">
        <div className="btn-text">
          <p>
            Nessa seção o administrador pode modificar as cores do fundo do,
            cores dos botões, dos textos, criando uma harmonia entre o logo tipo
            e o restante do aplicativo. É recomendável manter as cores do
            logotipo
          </p>
        </div>
        <div className="btn-form">
          <Link to="/admin/styles" className="btn btn-success">
            Gerenciando Estilo
          </Link>
        </div>
      </div>
      <h3>Crie uma saudação inicial ao cliente </h3>
      <div className="sub-container">
        <div className="btn-text">
          <p>
            Nessa seção o administrador pode modificar as cores do fundo do,
            cores dos botões, dos textos, criando uma harmonia entre o logo tipo
            e o restante do aplicativo. É recomendável manter as cores do
            logotipo
          </p>
        </div>
        <div className="btn-form">
          <Link to="/admin/welcome" className="btn btn-success">
            Saudação inicial
          </Link>
        </div>
      </div>

      <div className="kitchen-request">
        <Link
          to="/requestlist"
          className="col-sm-4 btn btn-success nostyle m-2"
        >
          Pedidos da Cozinha
        </Link>
        <button onClick={logoutAdmin}>Log out</button>
      </div>
    </div>
  );
};

export default FormMenu;
