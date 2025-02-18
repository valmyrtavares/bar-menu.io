import { useEffect } from 'react';
import { app } from '../config-firebase/firebase';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  getFirestore,
} from 'firebase/firestore';

const noCustomer = {
  name: 'anonymous',
  phone: '777',
  birthday: '77',
  email: 'anonimo@anonimo.com',
};

const db = getFirestore(app);

export const getAnonymousUser = async () => {
  const usersCollection = collection(db, 'user');
  const q = query(usersCollection, where('name', '==', 'anonymous'));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  } else {
    const docRef = await addDoc(usersCollection, noCustomer);
    return { id: docRef.id, ...noCustomer };
  }
};

export const useEnsureAnonymousUser = () => {
  useEffect(() => {
    const checkAndSetAnonymousUser = async () => {
      const isToten = localStorage.getItem('isToten');
      if (isToten === 'false' || isToten === null) return;

      // if (!localStorage.hasOwnProperty('isToten')) return;

      const storedUser = localStorage.getItem('userMenu');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.name === 'anonymous') return;
      }

      const anonymousUser = await getAnonymousUser();
      localStorage.setItem(
        'userMenu',
        JSON.stringify({ id: anonymousUser.id, name: anonymousUser.name })
      );
    };

    checkAndSetAnonymousUser();
  }, []);
};
