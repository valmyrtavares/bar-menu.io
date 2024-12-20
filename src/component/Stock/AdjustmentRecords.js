import React from 'react';
import log from '../../assets/styles/AdjustmentRecords.module.css';
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
      <CloseBtn setClose={setShowAdjustmentRecords} />
      <h1>Lista de Ocorrencias do {title}</h1>;
      <table striped bordered hover>
        <tr>
          <th>Data</th>
          <th>Entrada do produto</th>
          <th>Saida</th>
          <th>Categoria</th>
          <th>Vol Anterior</th>
          <th>Investimento anterior</th>
          <th>Volume Atual</th>
          <th>Investimento Atual</th>
          <th>Total de Embalagens</th>
        </tr>
        {eventLogData &&
          eventLogData.length > 0 &&
          eventLogData.map((item, index) => (
            <tr>
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
              <td>{item.package}</td>
            </tr>
          ))}
      </table>
    </div>
  );
};
export default AdjustmentRecords;
