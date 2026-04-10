import React from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config-firebase/firebase';
import { GlobalContext } from '../../GlobalContext';
import { CheckUser } from '../../Helpers/Helpers.js';
import '../../assets/styles/dishes.css';
import DishesModal from './dishesModal';

function Dishes({ newItem }) {
  const [item, setItem] = React.useState([]);
  const [modal, setModal] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const navigate = useNavigate();
  const global = React.useContext(GlobalContext);

  React.useEffect(() => {
    setItem(newItem);
    console.log('Objeto recebido em Dishes:', newItem);
  }, [newItem]);

  const handleRequestClick = async () => {
    if (item?.lowAmountRawMaterial) return;

    // Lógica para detecção de prato simples (sem acompanhamentos e sem variações de preço/tamanho)
    const hasNoSideDishes =
      !item.sideDishesElementList || item.sideDishesElementList.length === 0;

    const hasNoVariations =
      !item.CustomizedPrice ||
      (!Number(item.CustomizedPrice.firstPrice) &&
        !Number(item.CustomizedPrice.secondPrice) &&
        !Number(item.CustomizedPrice.thirdPrice));

    if (hasNoSideDishes && hasNoVariations) {
      // É um prato simples: envia direto para a fila (RequestModal)
      await handleDirectOrder();
    } else {
      // Tem acompanhamentos ou variações: abre o modal de customização
      setModal(true);
    }
  };

  const handleDirectOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1. Identificação do Usuário
      let currentUser = '';
      if (localStorage.hasOwnProperty('userMenu')) {
        const currentUserData = JSON.parse(localStorage.getItem('userMenu'));
        currentUser = currentUserData.id;
      }

      // 2. Verificação de Autenticação
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

      // 3. Preparação do Pedido (conforme estrutura do DishesModal)
      const orderItem = {
        name: item.title,
        id: item.id,
        category: item.category,
        recipeOpenCloseModal: false,
        finalPrice: Number(item.price),
        finalCost: item.costPriceObj?.cost || 0,
        image: item.image,
        recipe: item.recipe ? item.recipe : {},
        sideDishes: [],
        size: item.CustomizedPrice?.firstLabel || '',
      };

      // 4. Gravação no Firestore
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

      // 5. Navegação
      const pdv = JSON.parse(localStorage.getItem('pdv') || 'false');
      if (!pdv) {
        console.log('Redirecionando para /request (Mobile)');
        navigate('/request', { state: { isAdminOrigin: false } });
        global.setPdvRequest(false);
      } else {
        console.log('Redirecionando para /admin/requestlist (PDV)');
        global.setPdvRequest(true);
        navigate('/admin/requestlist', { state: { isAdminOrigin: true } });
      }
    } catch (error) {
      console.error('Erro ao processar pedido direto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {modal && <DishesModal item={item} setModal={setModal} />}
      {item && (
        <div
          onClick={handleRequestClick}
          className="item-container container my-2 card"
        >
          <div className="row">
            <div className="col-7">
              <h2 className="my-0">{item.title}</h2>
              <p className="comments">{item.comment}</p>
            </div>
            <img
              className="col-5 img-thumbnail img-customize"
              src={item.image}
              alt="dish"
            />
          </div>
          <div className="container-request-button">
            <button className="request-client" disabled={isSubmitting}>
              {isSubmitting
                ? 'Enviando...'
                : item?.lowAmountRawMaterial &&
                  Number(global.packageTier) !== 1 &&
                  Number(global.packageTier) !== 3
                ? 'Indisponível'
                : 'Faça o seu pedido'}
            </button>
            {item && (
              <p className="price float-end fw-bold">
                R$ {Number(item.price).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Dishes;
