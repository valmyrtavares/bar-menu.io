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
      <CloseBtn setClose={setShowAdjustmentRecords} />
      <h1>Lista de Ocorrencias do {title}</h1>;
      <div className={log.containderAdjustmentRecordsTable}>
        <table striped bordered hover>
          <thead>
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
                    <td>{item.package}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdjustmentRecords;
