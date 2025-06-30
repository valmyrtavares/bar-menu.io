import React from 'react';
import styles from '../assets/styles/Table.module.scss';

const Table = ({
  title,
  data = [],
  columns = [],
  onEdit,
  onDelete,
  eventClick,
  labelEventClick,
}) => {
  const hasData = Array.isArray(data) && data.length > 0;
  const hasColumns = Array.isArray(columns) && columns.length > 0;

  const formatCellValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') {
      // Caso seja array, objeto, etc
      return '[objeto]'; // Ou você pode usar JSON.stringify(value) com cuidado
    }
    return value;
  };

  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.title}>{title}</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            {hasColumns &&
              columns.map((col, index) => (
                <th key={index}>{col.nomeDaColuna}</th>
              ))}
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {!hasData ? (
            <tr>
              <td colSpan={columns.length + 1} className={styles.noData}>
                Nenhum dado encontrado.
              </td>
            </tr>
          ) : (
            data.map((item, rowIndex) => (
              <tr key={item.id || rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {formatCellValue(item[col.valorDaColuna])}
                  </td>
                ))}
                <td className={styles.actions}>
                  {eventClick && (
                    <button onClick={() => eventClick(item)}>
                      {labelEventClick}
                    </button>
                  )}
                  <button
                    onClick={() => onEdit && onEdit(item)}
                    className={styles.editBtn}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete && onDelete(item)}
                    className={styles.deleteBtn}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
