import React from 'react';
import '../../../assets/styles/SumaryExpensesListPopup.css';
import CloseBtn from '../../closeBtn';

const SumaryExpensesListPopup = ({ oneExpense, setOpenSumaryPopup }) => {
  React.useState(() => {
    if (oneExpense) {
      console.log('item   ', oneExpense);
    }
  }, [oneExpense]);
  return (
    <div className="container-sumary-expenses">
      <CloseBtn setClose={setOpenSumaryPopup} />
      <h1>Despesa Completa</h1>
      <p>
        Categoria<span>oneExpense.category</span>
      </p>
      <p>
        Confirmação<span>{oneExpense.confirmation}</span>
        <p>
          Data de Pagamento<span>{oneExpense.dueDate}</span>
        </p>
        <p>
          Nome da Despesa<span>{oneExpense.name}</span>
        </p>
        <p>
          Despesa Paga em <span>{oneExpense.paymentDate}</span>
        </p>
        <p>
          Valor Total<span>{oneExpense.value}</span>
        </p>
      </p>
    </div>
  );
};
export default SumaryExpensesListPopup;
