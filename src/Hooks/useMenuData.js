import { useEffect, useState } from 'react';
import { getBtnData } from '../api/Api';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config-firebase/firebase';

export function useMenuData() {
  const [menuButton, setMenuButton] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1️⃣ Bootstrap inicial via API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [buttons, items] = await Promise.all([
          getBtnData('button'),
          getBtnData('item'),
        ]);

        setMenuButton(buttons);
        setDishes(items);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // 2️⃣ Realtime sync via Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'item'), (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDishes(items);
    });

    return () => unsubscribe();
  }, []);

  return {
    menuButton,
    dishes,
    loading,
    error,
  };
}
