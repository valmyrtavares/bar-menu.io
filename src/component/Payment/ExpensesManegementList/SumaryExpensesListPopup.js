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
      <main>
        <div>
          <p>
            Nome da Despesa<span>: {oneExpense.name}</span>
          </p>
          <p>
            Categoria<span>: {oneExpense.category}</span>
          </p>
          <p>
            {' '}
            Confirmação<span>: {oneExpense.confirmation}</span>
          </p>
          <p>
            Data de Pagamento<span>: {oneExpense.dueDate}</span>
          </p>
          <p>
            Despesa Paga em <span>: {oneExpense.paymentDate}</span>
          </p>
          <p>
            Valor Total<span>: {oneExpense.value}</span>
          </p>
          <p>
            Quantidade de items<span>: {oneExpense.items.length}</span>
          </p>
        </div>
        <div>
          {oneExpense.items &&
            oneExpense.items.length > 0 &&
            oneExpense.items.map((item) => (
              <div className="container-item">
                <h4>Produto {item.product}</h4>
                <p>
                  Custo por unidade
                  <span> {item.CostPerUnit}</span>
                </p>
                <p>
                  Custo Total
                  <span> {item.totalCost}</span>
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
                <p>
                  Volume Total
                  <span>
                    {' '}
                    {item.totalVolume}
                    {item.unitOfMeasurement}
                  </span>
                </p>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
};
export default SumaryExpensesListPopup;
