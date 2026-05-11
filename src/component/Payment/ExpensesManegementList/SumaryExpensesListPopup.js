import React from 'react';
import style from '../../../assets/styles/SumaryExpensesListPopup.module.scss';
import CloseBtn from '../../closeBtn';

const SumaryExpensesListPopup = ({ oneExpense, setOpenSumaryPopup }) => {
  React.useState(() => {
    if (oneExpense) {
      console.log('item   ', oneExpense);
    }
  }, [oneExpense]);
  return (
    <div className={style.overlay}>
      <div className={style.containerSumaryExpenses}>
        <CloseBtn setClose={setOpenSumaryPopup} />
        <h1>Despesa Completa</h1>
        <main>
          <div className={style.detailsWrapper}>
            <p>
              Data de Pagamento<span>: {oneExpense.paymentDate}</span>
            </p>
            <p>
              Número da nota<span>: {oneExpense.account}</span>
            </p>
            <p>
              Valor Total<span>: {Number(oneExpense.value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            </p>
            <p>
              Quantidade de items
              <span>
                : {oneExpense && oneExpense.items && oneExpense.items.length}
              </span>
            </p>
          </div>
          <div className={style.itemsWrapper}>
            {oneExpense.items &&
              oneExpense.items.length > 0 &&
              oneExpense.items.map((item, index) => (
                <div key={index} className={style.containerItem}>
                  <h4>Produto {item.product}</h4>
                  <p>
                    Custo por unidade
                    <span> {Number(item.CostPerUnit).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </p>
                  <p>
                    Custo Total
                    <span> {Number(item.amount * item.CostPerUnit).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </p>
                  <p>
                    Volume por unidade
                    <span>
                      {' '}
                      {item.volumePerUnit}
                      {item.unitOfMeasurement}
                    </span>
                  </p>
                  <p>
                    Quantdade de volumes
                    <span> {item.amount}</span>
                  </p>
                </div>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
};
export default SumaryExpensesListPopup;
