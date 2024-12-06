import React from 'react';
import { getBtnData } from '../../api/Api';

const TrackStockProduct = () => {
  const [stock, setStock] = React.useState(null);

  React.useEffect(() => {
    const fetchStock = async () => {
      const data = await getBtnData('stock');
      setStock(data);
    };
    fetchStock();
  }, []);

  return (
    <div>
      <h1> Tela de estoque</h1>;
      <table striped bordered hover>
        <tr>
          <th>Produto</th>
          <th>Custo de Estoque</th>
          <th>Estoque em volume</th>
          <th>Excluir</th>
        </tr>
        {stock &&
          stock.length > 0 &&
          stock.map((item, index) => (
            <tr>
              <td>{item.product}</td>
              <td>{item.totalCost}</td>
              <td>{item.totalVolume}</td>
              <td>X</td>
            </tr>
          ))}
      </table>
    </div>
  );
};
export default TrackStockProduct;
