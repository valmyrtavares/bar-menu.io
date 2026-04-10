import React from 'react';
import style from '../assets/styles/MainPictureMenu.module.scss';
import EachTotenDish from './EachTotenDish.js';
import { getBtnData, getOneItemColleciton, deleteData } from '../api/Api';
import DishesModal from '../component/Dishes/dishesModal';
import SubHeaderCustomer from '../component/subHeaderCustomer.js';
import { Link, useNavigate } from 'react-router-dom';
import { CheckUser } from '../Helpers/Helpers.js';
import { GlobalContext } from '../GlobalContext';
import { useEnsureAnonymousUser, getAnonymousUser } from '../Hooks/useEnsureAnonymousUser.js';
import WarningMessage from '../component/WarningMessages.js';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../config-firebase/firebase.js';

const CategoryItemImage = ({ item }) => {
  const src = item.image || 'https://i.pinimg.com/736x/fe/23/38/fe2338260fb041d8d94999fe48cb218f.jpg';
  return <img src={src} alt="" />;
};

const MainPictureMenu = () => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [dishes, setDishes] = React.useState([]);
  const [menuButton, setMenuButton] = React.useState([]);
  const [dishesFiltered, setDishesFiltered] = React.useState([]);
  const [categorySelected, setCategorySelected] = React.useState('');
  const [item, setItem] = React.useState({});
  const [openModalDishes, setOpenModalDishes] = React.useState(false);
  const [logoutAdminPopup, setLogoutAdminPopup] = React.useState(false);
  const [nameClient, setNameClient] = React.useState('');
  const [showFilteredDishes, setShowFilteredDishes] = React.useState(true);
  const [loadedImagesCount, setLoadedImagesCount] = React.useState(0);
  const [isNestedCategory, setIsNestedCategory] = React.useState(false);
  const [isSubmittingQuick, setIsSubmittingQuick] = React.useState(false);

  const global = React.useContext(GlobalContext);
  useEnsureAnonymousUser();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (global.isToten) {
      navigate('/new-layout');
    } else {
      navigate('/');
    }
    const fetchData = async () => {
      try {
        const [data, dataItem] = await Promise.all([
          getBtnData('button'),
          getBtnData('item'),
        ]);

        const bestSeller = {
          category: 'main',
          parent: 'bestSellers',
          display: true,
          id: '1232',
          title: 'OS MAIS VENDIDOS ',
          image:
            'https://firebasestorage.googleapis.com/v0/b/react-bar-67f33.appspot.com/o/frontImage%2FWhatsApp%20Image%202024-07-26%20at%2011.19.36.png?alt=media&token=f129a337-ee65-4402-90b2-8ce8a5fb593f',
        };
        grabClient();
        if (Array.isArray(data) && data.length > 0) {
          data.unshift(bestSeller);
          const filteredButtonCategory = data.filter(
            (item) => item.parent !== 'hide',
          );

          setMenuButton(filteredButtonCategory);
        }
        setDishes(dataItem);
        setIsLoading(false);
      } catch (error) {
        console.error('Erro fetching data', error);
      }
    };
    fetchData();
  }, []);

  React.useEffect(() => {
    if (dishes.length > 0) {
      chooseCategory('bestSellers', 'OS MAIS VENDIDOS');
    }
  }, [dishes]);

  const chooseCategory = async (parent, title) => {
    console.log('Escolhendo categoria:', title);
    setIsNestedCategory(false); // Reset nested category warning
    if (!dishes || dishes.length === 0) return;
 
    setCategorySelected(title); // ⚡ Feedback INSTANTÂNEO na tela
    setShowFilteredDishes(false); // Esconde a grade para carregar em lote
 
    const filtered =
      parent !== 'bestSellers'
        ? dishes.filter((item) => item.category === parent)
        : dishes.filter((item) => item.carrossel === true);
 
    if (filtered.length === 0) {
      setShowFilteredDishes(true);
      if (global.isToten) {
        const hasSubcategories = menuButton.some((btn) => btn.category === parent);
        if (hasSubcategories) {
          setIsNestedCategory(true);
        }
      }
    }
 
    // Removido o bloqueio de cache manual via fetch (que estava dando erro de CORS)
    // O useEffect abaixo, baseado em carregamento real do DOM (onImageLoad), dará conta do recado!
 
    setLoadedImagesCount(0); // Reseta contador de carregamento real (DOM)
    setDishesFiltered(filtered);
    // setShowFilteredDishes(true); // Removido! O useEffect abaixo cuidará disso quando todas carregarem no DOM
  };

  // ✅ Revela a grade APENAS quando todas as imagens (DOM) terminarem de decodificar
  React.useEffect(() => {
    if (dishesFiltered.length > 0 && loadedImagesCount >= dishesFiltered.length) {
      setShowFilteredDishes(true);
    }
  }, [loadedImagesCount, dishesFiltered]);

  // Fail-safe: Se demorar mais de 2s, mostra o que tiver
  React.useEffect(() => {
    if (dishesFiltered.length > 0 && !showFilteredDishes) {
      const timer = setTimeout(() => setShowFilteredDishes(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [dishesFiltered, showFilteredDishes]);

  React.useEffect(() => {
    if (dishes.length > 0) {
      chooseCategory('bestSellers', 'OS MAIS VENDIDOS');
    }
  }, [dishes]);

  const preparedRequest = async (item) => {
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
      // alert('Toten: Preparando para enviar direto para o carrinho!');
      await handleDirectOrder(item);
    } else {
      setItem(item);
      setOpenModalDishes(true);
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
      console.error('Erro ao processar pedido direto (Toten):', error);
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  const logoutCustomer = async () => {
    if (logoutAdminPopup) {
      const anonymousUser = await getAnonymousUser();
      localStorage.setItem(
        'userMenu',
        JSON.stringify({ id: anonymousUser.id, name: anonymousUser.name }),
      );
      setLogoutAdminPopup(false);
      return;
    }
    setLogoutAdminPopup(true);
  };

  function grabClient() {
    if (localStorage.hasOwnProperty('userMenu')) {
      const nameCustomer = JSON.parse(localStorage.getItem('userMenu'));

      let firstName = nameCustomer.name.split(' ')[0];
      firstName =
        firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      setNameClient(firstName);
    }
  }

  async function CheckLogin() {
    const userId = await CheckUser('userMenu');
    navigate(userId);
  }

  return (
    !isLoading && (
      <div
        className={`${style.containerPictureMenu} ${
          !isLoading ? style.loaded : ''
        }`}
      >
        <div className="WarningMessage-container">
          {logoutAdminPopup && (
            <WarningMessage
              message="Você está prestes a sair do sistema"
              setWarningMsg={setLogoutAdminPopup}
              sendRequestToKitchen={logoutCustomer}
            />
          )}
        </div>
        <SubHeaderCustomer
          logoutCustomer={logoutCustomer}
          nameClient={nameClient}
          isToten={global.isToten}
        />
        <div className={style.containerDishes}>
          {openModalDishes && (
            <DishesModal item={item} setModal={setOpenModalDishes} />
          )}
        </div>
        <div className={style.submenu}>
          <nav className={style.categories}>
            {menuButton &&
              menuButton.length > 0 &&
              menuButton.map((item) => (
                <div
                  key={item.id}
                  className={style.categoryItem}
                  onClick={() => chooseCategory(item.parent, item.title)}
                >
                  <h3>{item.title}</h3>
                  <CategoryItemImage item={item} />
                </div>
              ))}
          </nav>
          <section className={style.dishes}>
            <h3 className={style.mainTitle}>{categorySelected}</h3>
            <div className={`${style.subContainer} ${showFilteredDishes ? style.visible : style.hidden}`}>
              {isNestedCategory && (
                <div className={style.nestedCategoryWarning}>
                  <p>
                    Essa categoria só pode ser acessada de um painel com botões e
                    sem imagens. Acesse do seu celular para visualizar novos
                    produtos.
                  </p>
                </div>
              )}
              {dishesFiltered &&
                dishesFiltered.length > 0 &&
                dishesFiltered.map((item, index) => (
                  <EachTotenDish
                    item={item}
                    index={index}
                    preparedRequest={preparedRequest}
                    onImageLoad={() => setLoadedImagesCount((prev) => prev + 1)}
                  />
                ))}
            </div>
          </section>
        </div>
      </div>
    )
  );
};
export default MainPictureMenu;
