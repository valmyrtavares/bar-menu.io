import React from "react";
import { getBtnData } from "../api/Api";
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../config-firebase/firebase.js';
import { CheckUser } from '../Helpers/Helpers.js';
import { GlobalContext } from '../GlobalContext.js';
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
  const [isSubmittingQuick, setIsSubmittingQuick] = React.useState(false);
  const global = React.useContext(GlobalContext);
  const navigate = useNavigate();

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

  const callDishesModal = async (item) => {
    if (!item) return;
    if (item?.lowAmountRawMaterial) return;

    // Detecção de prato simples
    const hasNoSideDishes =
      !item.sideDishesElementList ||
      item.sideDishesElementList.length === 0 ||
      (item.sideDishesElementList.length === 1 && !item.sideDishesElementList[0]?.amount);

    const hasNoVariations =
      !item.CustomizedPrice ||
      (!Number(item.CustomizedPrice.firstPrice) &&
        !Number(item.CustomizedPrice.secondPrice) &&
        !Number(item.CustomizedPrice.thirdPrice));

    if (hasNoSideDishes && hasNoVariations) {
      await handleDirectOrder(item);
    } else {
      setItem(item);
      setModal(true);
    }
  };

  const handleDirectOrder = async (orderItemData) => {
    if (isSubmittingQuick) return;
    setIsSubmittingQuick(true);

    try {
      let currentUser = '';
      if (localStorage.hasOwnProperty('userMenu')) {
        const currentUserData = JSON.parse(localStorage.getItem('userMenu'));
        currentUser = currentUserData.id;
      }

      if (!global.authorizated) {
         CheckUser('userMenu', global.isToten, global.packageTier).then(path => {
           if (!currentUser) {
               navigate(path);
           }
        });
      }

      if (!currentUser) {
        console.error('Usuário não identificado no localStorage');
        return;
      }

      const orderItem = {
        name: orderItemData.title,
        id: orderItemData.id,
        category: orderItemData.category,
        recipeOpenCloseModal: false,
        finalPrice: Number(orderItemData.price),
        finalCost: orderItemData.costPriceObj?.cost || 0,
        image: orderItemData.image,
        recipe: orderItemData.recipe ? orderItemData.recipe : {},
        sideDishes: [],
        size: orderItemData.CustomizedPrice?.firstLabel || '',
      };

      const userDocRef = doc(db, 'user', currentUser);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const currentRequests = userDocSnap.data().request || [];
        currentRequests.push(orderItem);
        await updateDoc(userDocRef, {
          request: currentRequests,
        });
      } else {
        await setDoc(userDocRef, {
          request: [orderItem],
        });
      }

      const pdv = JSON.parse(localStorage.getItem('pdv') || 'false');
      if (!pdv) {
        navigate('/request', { state: { isAdminOrigin: false } });
        global.setPdvRequest(false);
      } else {
        global.setPdvRequest(true);
        navigate('/admin/requestlist', { state: { isAdminOrigin: true } });
      }
    } catch (error) {
      console.error('Erro ao processar pedido direto (Carousel):', error);
    } finally {
      setIsSubmittingQuick(false);
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
