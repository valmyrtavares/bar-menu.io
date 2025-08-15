import React, { useEffect, useState } from 'react';

const AutoPaymentList = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    // Substitua a URL abaixo pela sua API real
    fetch('https://api.exemplo.com/payments')
      .then((response) => response.json())
      .then((data) => setPayments(data))
      .catch((error) => console.error('Erro ao buscar pagamentos:', error));
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Vendas</th>
          <th>Data</th>
          <th>Cancelamento</th>
          <th>Valor</th>
        </tr>
      </thead>
      <tbody>
        {payments.map((payment, idx) => (
          <tr key={idx}>
            <td>{payment.vendas}</td>
            <td>{payment.data}</td>
            <td>{payment.cancelamento}</td>
            <td>{payment.valor}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AutoPaymentList;
