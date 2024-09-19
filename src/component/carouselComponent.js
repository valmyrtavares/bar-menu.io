import React from "react";
import { getBtnData } from "../api/Api";
import DishesModal from "./Dishes/dishesModal";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Box } from "@mui/material";
import "../assets/styles/carousel.css";

const CarouselComponent = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };
  const [carrosselImages, setCarrosselImages] = React.useState([]);
  const [item, setItem] = React.useState([]);
  const [modal, setModal] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      const response = await getBtnData("item");
      const carrosselImagesNovo = response.filter(
        (item) => item.carrossel === true
      );
      setCarrosselImages(carrosselImagesNovo);
    };

    fetchData();
  }, []);

  const callDishesModal = (item) => {
    if (item) {
      console.log("item   ", item);
      setItem(item);
      setModal(true);
    }
  };

  return (
    <>
      <div className="container-modalDihses-InCarrolse">
        {modal && <DishesModal item={item} setModal={setModal} />}
      </div>
      <Box sx={{ width: "300px", margin: "auto" }}>
        <Slider {...settings}>
          {carrosselImages &&
            carrosselImages.map((item, index) => (
              <div key={index} onClick={() => callDishesModal(item)}>
                <img src={item.image} alt="asdf  2" />
                <p>{item.title}</p>
              </div>
            ))}
        </Slider>
      </Box>
    </>
  );
};

export default CarouselComponent;
