import React, { useState, useEffect } from 'react';
import './carrosselImages.css';
import { getBtnData } from '../api/buttonApi';

function CarrosselImages() {
  const [index, setIndex] = useState(0);
  const [carrosselImages, setCarrosselImages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getBtnData('item');
      const carrosselImagesNovo = response
        .filter((item) => item.carrossel === true)
        .map((item) => item.image);
      console.log(carrosselImagesNovo);
      setCarrosselImages(carrosselImagesNovo);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % carrosselImages.length);
    }, 4000);

    return () => {
      clearInterval(intervalId);
    };
  }, [carrosselImages]);

  const forward = () => {
    setIndex((prevIndex) => (prevIndex + 1) % carrosselImages.length);
  };

  const backward = () => {
    setIndex((prevIndex) =>
      prevIndex === 0 ? carrosselImages.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="content-carrossel">
      <div className="carrossel">
        {carrosselImages.length > 0 && (
          <img src={carrosselImages[index]} alt={`Image ${index}`} />
        )}
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
  );
}

export default CarrosselImages;
