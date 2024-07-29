import React from 'react';
import { app } from '../config-firebase/firebase.js';
import { doc, getFirestore, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../assets/styles/requestModal.css';

const RequestModal = () => {
  const [currentUser, setCurrentUser] = React.useState('');
  const [userData, setUserData] = React.useState([]);
  const db = getFirestore(app);

  React.useEffect(() => {
    if (localStorage.hasOwnProperty('userMenu')) {
      const currentUserNew = JSON.parse(localStorage.getItem('userMenu'));
      setCurrentUser(currentUserNew.id);
    }
  }, []);

  React.useEffect(() => {
    if (currentUser) {
      fetchUser();
    }
  }, [currentUser]);

  //Take just one item of user collection

  async function fetchUser() {
    const userDocRef = doc(db, 'user', currentUser);
    const userDocSnap = await getDoc(userDocRef);
    const data = userDocSnap.data();
    setUserData(data);
    console.log('userDocSnap.data()    ', userDocSnap.data());
    console.log('data    ', data);
    console.log('data.request   ', data.request);
  }

  return (
    <section className="container-modal-request">
      <div className="close-btn">
        <button>
          <Link to="/menu">X</Link>
        </button>
        )
      </div>
      <p>{userData?.name}</p>
      Pedidos
      {userData && userData.request ? (
        userData.request.map((item) => (
          <div className="individual-dishes" key={item.id}>
            <h2 className="my-0">{item.name}</h2>
            <p className="dishes-price">R$ {item.finalPrice}</p>
          </div>
        ))
      ) : (
        <p>Loading...</p>
      )}
    </section>
  );
};
export default RequestModal;
