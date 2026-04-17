import React from 'react';
import log from '../../assets/styles/AdjustmentRecords.module.scss';
import CloseBtn from '../closeBtn';

const AdjustmentRecords = ({
  eventLogData,
  setShowAdjustmentRecords,
  title,
}) => {
  React.useEffect(() => {
    console.log('array de eventos   ', eventLogData);
  }, [eventLogData]);

  return (
    <div className={log.containderAdjustmentRecords}>
      <div className={log.containerIcon}>
        <a
          href="https://docs.google.com/document/d/1JO_71SmMvI_lkzAerER1YuuM_F-0Sdp6-dJrdy7E1oQ/edit?tab=t.3z2eh6xgiwvv"
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir documentação"
        >
          <span>?</span>
        </a>
      </div>
      <CloseBtn setClose={setShowAdjustmentRecords} />
      <h1>Lista de Ocorrencias do {title}</h1>;
      <div className={log.containderAdjustmentRecordsTable}>
        <table striped bordered hover>
          <thead>
            <tr>
              <th title="Data em que o registro foi realizado.">Data</th>
              <th title="Quantidade de produto que entrou no estoque nesta operação.">
                Entrada do produto
              </th>
              <th title="Quantidade de produto que saiu do estoque (venda, perda ou ajuste).">
                Saida
              </th>
              <th title="O tipo de movimentação (Entrada, Saída, Ajuste, Edição, etc.).">
                Categoria
              </th>
              <th title="O volume que existia no estoque antes desta movimentação.">
                Vol Anterior
              </th>
              <th title="O valor (R$) total investido no estoque deste produto antes da movimentação.">
                Investimento anterior
              </th>
              <th title="O volume resultante no estoque após a movimentação.">
                Volume Atual
              </th>
              <th title="O valor (R$) total investido no estoque após a entrada ou saída.">
                Investimento Atual
              </th>
              <th title="Notas detalhadas sobre o motivo da edição ou a quantidade de embalagens envolvidas.">
                Anotações ou Embalagens
              </th>
            </tr>
          </thead>
          <tbody>
            {eventLogData &&
              eventLogData.length > 0 &&
              eventLogData
                .slice()
                .reverse()
                .map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>
                      {item.inputProduct} {item.unit}
                    </td>
                    <td>{item?.outputProduct}</td>
                    <td>{item.category}</td>
                    <td>
                      {Number(item.previousVolume).toFixed(2)} {item.unit}
                    </td>
                    <td>R${Number(item.previousCost).toFixed(2)}</td>
                    <td>
                      {' '}
                      {Number(item.ContentsInStock).toFixed(2)}
                      {item.unit}
                    </td>
                    <td>R$ {Number(item.totalResourceInvested).toFixed(2)}</td>
                    <td
                      title={
                        item.noteReasonsEditingProduct
                          ? item.noteReasonsEditingProduct
                          : item.adjustmentExpenseNote
                      }
                    >
                      {item.category === 'Editado' || item.adjustmentExpenseNote
                        ? item.noteReasonsEditingProduct ||
                          item.adjustmentExpenseNote
                          ? 'notas'
                          : 'sem notas '
                        : item.package}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdjustmentRecords;
