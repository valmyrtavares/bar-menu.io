import React from 'react';
import './carrosselImages.css';
import { getBtnData } from '../api/buttonApi';

// Effect for auto-advancing
function CarrosselImages() {
  const [index, setIndex] = React.useState(0);
  //const [images, setImages] = React.useState([]);
  const [images, setImages] = React.useState([
    'https://img.elo7.com.br/product/zoom/258B7CB/adesivo-parede-restaurante-prato-feito-comida-caseira-lenha-adesivo-restaurante-fritas-salada.jpg',
    'https://img.cybercook.com.br/receitas/151/x-salada-3.jpeg',
    'https://www.melhoresdestinos.com.br/wp-content/uploads/2020/09/comidas-tipicas-capa2019.jpg',
  ]);
  const [intervalId, setIntervalId] = React.useState(null);

  // Functions
  React.useEffect(() => {
    // fetchCarrosselImages();

    const newInterval = setInterval(() => {
      if (index == 2) {
        setIndex(0);
      } else {
        setIndex((prevIndex) => (prevIndex + 1) % images.length);
      }
    }, 4000);

    return () => clearInterval(newInterval);
  }, []);

  function forward() {
    //  clearInterval(intervalId);
    setIndex((prevIndex) => (prevIndex + 1) % images.length);
  }

  function runCarrossel() {
    const newInterval = setInterval(() => {
      if (index == 2) {
        setIndex(0);
      } else {
        setIndex((prevIndex) => prevIndex + 1);
      }
    }, 4000);

    // return () => clearInterval(newInterval);
  }

  function backward() {
    // clearInterval(intervalId);
    if (index === 0) {
      setIndex(images.length - 1);
    } else {
      setIndex((prevIndex) => (prevIndex - 1) % images.length);
    }
  }

  async function fetchCarrosselImages() {
    console.log('funcionando');
    const response = await getBtnData('item');
    const carrosselImages = await response
      .filter((item) => item.carrossel === true)
      .map((item) => item.image);
    console.log(carrosselImages);
    setImages(carrosselImages);
    console.log(images);
    runCarrossel();

    // if (!response.ok) {
    //   throw new Error('something  went wrong!');
    // }
    // let y;
    // console.log(response);
  }

  return (
    <>
      <div className="content-carrossel">
        <div className="carrossel">
          <img src={images[index]} />
        </div>
        <div className="d-flex justify-content-between mt-3">
          <button className="btn btn-success" onClick={backward}>
            Anterior
          </button>
          <button className="btn btn-success" onClick={forward}>
            Seguinte
          </button>
        </div>
      </div>
      <h1>{index}</h1>
      <button onClick={fetchCarrosselImages}>Teste</button>
    </>
  );
}
export default CarrosselImages;
//
