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
  getDisableEditReason,
  getDisableDeleteReason,
  hideEditButton = false,
}) => {
  const hasData = Array.isArray(data) && data.length > 0;
  const hasColumns = Array.isArray(columns) && columns.length > 0;

  const formatCellValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (React.isValidElement(value)) return value;
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
            data.map((item, rowIndex) => {
              const editReason = getDisableEditReason ? getDisableEditReason(item) : null;
              const deleteReason = getDisableDeleteReason ? getDisableDeleteReason(item) : null;

              return (
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
                    {!hideEditButton && (
                      editReason ? (
                        <div className={styles.customTooltipWrapper} data-tooltip={editReason}>
                          <button className={styles.editBtn} disabled>
                            Editar
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => onEdit && onEdit(item)} className={styles.editBtn}>
                          Editar
                        </button>
                      )
                    )}
                    
                    {deleteReason ? (
                      <div className={styles.customTooltipWrapper} data-tooltip={deleteReason}>
                        <button className={styles.deleteBtn} disabled>
                          Excluir
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => onDelete && onDelete(item)} className={styles.deleteBtn}>
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
