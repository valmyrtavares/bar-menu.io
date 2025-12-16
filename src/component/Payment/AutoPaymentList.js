import React, { useEffect, useState } from 'react';
import styles from '../../assets/styles/AutoPaymentList.module.scss';

const AutoPaymentList = () => {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const hoje = new Date();
    const dataFinal = hoje.toISOString().split('T')[0]; // 18-08-2025
    const dataInicial = new Date();
    dataInicial.setDate(hoje.getDate() - 7); // 7 dias antes
    const dataInicio = dataInicial.toISOString().split('T')[0];

    fetch('http://localhost:3001/api/paygo/listar-vendas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        terminalId: '4517',
        dataInicio,
        dataFim: dataFinal,
      }),
    })
      .then((res) => res.json())
      .then((data) => setPayments(data))
      .catch((err) => console.error('Erro ao carregar vendas:', err));
  }, []);

  const cancelSelling = async (obj) => {
    try {
      const payload = {
        intencaoVendaId: obj.id, // ID da venda
        terminalId: '4517', // ID da maquineta
        aguardarTefIniciarTransacao: true,
        senhaTecnica: '111111', // senha técnica definida no back
      };

      const res = await fetch(
        'http://localhost:3001/api/paygo/cancelar-venda',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      console.log('✅ Venda cancelada:', data);
    } catch (err) {
      console.error('❌ Erro ao cancelar venda:', err);
    }
  };
  return (
    <div className={styles.AutoPaymentListContainer}>
      <table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Data</th>
            <th>Forma de Pagamento</th>
            <th>Bandeira</th>
            <th>Valor</th>
            <th>Status</th>
            <th>Cancelamento</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, idx) => (
            <tr key={idx}>
              <td>{payment.id}</td>
              <td>{payment.data}</td>
              <td>{payment.formaPagamento?.modalidade}</td>
              <td>{payment.pagamentosExternos[0].bandeira}</td>
              <td>{payment.valorFinal}</td>
              <td>
                {payment.pagamentosExternos[0].mensagemRespostaAdquirente}
              </td>
              <td
                className={styles.clickEvent}
                onClick={() => cancelSelling(payment)}
              >
                Cancelar
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AutoPaymentList;
