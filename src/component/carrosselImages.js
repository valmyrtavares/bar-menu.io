import React, { useState, useEffect } from 'react';
import '../assets/styles/carrosselImages.css';
import { getBtnData } from '../api/Api';
import { ReactComponent as Forward } from '../assets/icons/arrow-bar-right.svg';
import { ReactComponent as Backward } from '../assets/icons/arrow-bar-left.svg';

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
      <div className="wrapper d-flex justify-content-between mt-3">
        <button onClick={backward}>
          <Backward width={35} height={35} />
        </button>
        <button onClick={forward}>
          <Forward width={35} height={35} />
        </button>
      </div>
    </div>
  );
}

export default CarrosselImages;
