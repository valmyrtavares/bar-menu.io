import React from 'react';
import log from '../../assets/styles/AdjustmentRecords.module.css';
import CloseBtn from '../closeBtn';

const AdjustmentRecords = ({ eventLogData, setShowAdjustmentRecords }) => {
  React.useEffect(() => {
    console.log('array de eventos   ', eventLogData);
  }, [eventLogData]);

  return (
    <div className={log.containderAdjustmentRecords}>
      <CloseBtn setClose={setShowAdjustmentRecords} />
      <h1>Lista de Ocorrencias</h1>;
      <table striped bordered hover>
        <tr>
          <th>Data</th>
          <th>Entrada</th>
          <th>Saida</th>
          <th>Categoria</th>
          <th>Total de Volume</th>
          <th>Total de Investimento</th>
          <th>Total de Embalagens</th>
        </tr>
        {eventLogData &&
          eventLogData.length > 0 &&
          eventLogData.map((item, index) => (
            <tr>
              <td>{item.date}</td>
              <td>{item.inputProduct}</td>
              <td>{item?.outputProduct}</td>
              <td>{item.category}</td>
              <td>R$ {Number(item.ContentsInStock).toFixed(2)}</td>
              <td>R$ {Number(item.totalResourceInvested).toFixed(2)}</td>
              <td>{item.package}</td>
            </tr>
          ))}
      </table>
    </div>
  );
};
export default AdjustmentRecords;
