import React from 'react';
import { getBtnData } from './api/buttonApi';

const EditFormButton = () => {
  const [menuButton, setMenuButton] = React.useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchButton = await getBtnData('button');
        console.log(fetchButton);
        setMenuButton(fetchButton);
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container">
      {menuButton &&
        menuButton.map((item, index) => {
          return (
            <div key={index} class="row my-3">
              <h2 className="col-5">{item.title}</h2>
              <button className="btn btn-danger col-3 mx-1">Excluir </button>
              <button className="btn btn-warning col-3">Editar </button>
            </div>
          );
        })}
    </div>
  );
};

export default EditFormButton;
