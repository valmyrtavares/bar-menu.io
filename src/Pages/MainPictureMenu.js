import React from 'react';
import style from '../assets/styles/MainPictureMenu.module.scss';
import EachTotenDish from './EachTotenDish.js';
import { getBtnData, getOneItemColleciton, deleteData } from '../api/Api';
import DishesModal from '../component/Dishes/dishesModal';
import SubHeaderCustomer from '../component/subHeaderCustomer.js';
import { Link, useNavigate } from 'react-router-dom';
import { CheckUser } from '../Helpers/Helpers.js';
import { GlobalContext } from '../GlobalContext';
import {
  useEnsureAnonymousUser,
  getAnonymousUser,
} from '../Hooks/useEnsureAnonymousUser.js';
import WarningMessage from '../component/WarningMessages.js';
import { useCachedImage } from '../Hooks/useCachedImage.js';
import { ensureImagesInCache } from '../util/imageCache.js';

const CategoryItemImage = ({ item }) => {
  const src = useCachedImage(
    item.id,
    item.image ||
      'https://i.pinimg.com/736x/fe/23/38/fe2338260fb041d8d94999fe48cb218f.jpg',
    'thumb',
  );
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
    if (!dishes || dishes.length === 0) return;

    setShowFilteredDishes(false); // Esconde a grade anterior

    const filtered =
      parent !== 'bestSellers'
        ? dishes.filter((item) => item.category === parent)
        : dishes.filter((item) => item.carrossel === true);

    // ✅ GARANTIA: Só atualiza e mostra quando TODAS as imagens (thumbs) estiverem prontas no cache local
    await ensureImagesInCache(filtered, 'thumb');

    setDishesFiltered(filtered);
    setCategorySelected(title);
    setShowFilteredDishes(true); // Revela tudo de uma vez
  };

  React.useEffect(() => {
    if (dishes.length > 0) {
      chooseCategory('bestSellers', 'OS MAIS VENDIDOS');
    }
  }, [dishes]);

  const preparedRequest = (item) => {
    setItem(item);
    setOpenModalDishes(true);
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
              {showFilteredDishes && dishesFiltered &&
                dishesFiltered.length > 0 &&
                dishesFiltered.map((item, index) => (
                  <EachTotenDish
                    item={item}
                    index={index}
                    preparedRequest={preparedRequest}
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
