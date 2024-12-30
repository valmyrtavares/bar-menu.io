import React, { useState, useEffect, useContext } from 'react';
import { GlobalContext } from '../../GlobalContext';
import '../../assets/styles/PrintRequestCustomer.css';
import { Link } from 'react-router-dom';

const PrintRequestCustomer = () => {
  const global = useContext(GlobalContext);
  const { name, finalPriceRequest, dateTime, countRequest, request } =
    global.userNewRequest;
  const [hasPrinted, setHasPrinted] = useState(false); // Flag para controlar a impressão
  const hasPrintedRef = React.useRef(false);

  useEffect(() => {
    console.log('Fui CHAMADO');

    if (global.userNewRequest && !hasPrinted) {
      console.log('request ATUALIZADO', global.userNewRequest);

      // Aguarda um pequeno tempo para garantir que a tela foi renderizada antes de chamar o print
      setTimeout(() => {
        window.print();
        hasPrintedRef.current = true; // Define o flag para evitar outra impressão
      }, 600); // espera 100ms antes de chamar o print para garantir que a página foi totalmente renderizada
    }
  }, []);

  return (
    <div className="print-request-container">
      <div className="container-link" container-link>
        <Link to="/admin/requestlist" className="btn btn-success">
          Cozinha
        </Link>
      </div>
      <p>Dragon Computadores Eireli me</p>
      <p>
        <span>Rua Alváres Penteado,177 Centro Histórico CEP 01012-001</span>
      </p>
      <p>
        CNPJ<span> 19.337.953/0001-78</span>
      </p>
      <h3>
        Pedido <span>{countRequest}</span>
      </h3>
      <p>
        cliente: <span>{name}</span>
      </p>
      <p>
        Horário: <span>{dateTime}</span>
      </p>

      <p>Pedido: {countRequest}</p>
      <h3>Itens</h3>
      {request &&
        request.length > 0 &&
        request.map((item) => (
          <div className="each-item" key={item.name}>
            <h3>
              Item: <span>{item.name}</span>
            </h3>
            <p>
              Valor <span>R$ {item.finalPrice},00</span>
            </p>
            {item.sideDishes && <h5>Acompanhamento</h5>}
            {item.sideDishes &&
              item.sideDishes.length > 0 &&
              item.sideDishes.map((sidedishes) => (
                <div className="sidedishes-print" key={sidedishes.name}>
                  <p>
                    <span>{sidedishes.name}</span>
                  </p>
                  <p>
                    <span>R${sidedishes.price},00</span>
                  </p>
                </div>
              ))}
          </div>
        ))}
      <p>
        TOTAL:<span> RS {finalPriceRequest},00</span>
      </p>
      <Link to="/nfce" className="btn btn-success">
        Nota Fiscal
      </Link>
    </div>
  );
};

export default PrintRequestCustomer;
