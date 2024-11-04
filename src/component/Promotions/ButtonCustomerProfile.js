import React from 'react';
import '../../assets/styles/ButtonCustomerProfile.css';
import { getOneItemColleciton } from '../../api/Api';

const ButtonCustomerProfile = ({ item }) => {
  const [noRegistration, setNoRegistration] = React.useState(null);
  const [promotionClient, setPromotionClient] = React.useState({});

  React.useEffect(() => {
    const fetchOneCustomer = async () => {
      const data = await getOneItemColleciton('user', item.idUser);
      if (data && data.name !== 'anonimo') {
        setPromotionClient(data);
        setNoRegistration('registrated');
      }
      console.log('Que tipo de cliente é esse', data);
    };
    console.log('item   ', item);
    if (item) {
      fetchOneCustomer();
    }
  }, [item]);

  const ReadyToDescont = () => {
    console.log('Eu posso ter um desconto');
  };

  return (
    <div>
      <button
        disabled={!noRegistration}
        className={noRegistration ? 'registrated' : ''}
        onClick={ReadyToDescont}
      >
        {noRegistration ? promotionClient.name : 'Cliente'}
      </button>
    </div>
  );
};
export default ButtonCustomerProfile;
