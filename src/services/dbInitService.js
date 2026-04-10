import { db } from '../config-firebase/firebase';
import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, limit, where } from 'firebase/firestore';

export const initializeDatabase = async () => {
  const results = [];

  try {
    // 1. Inicializar Styles (ID Fixo crítico)
    const styleDocId = 'Ka5eQA5um9W3vA5gyV70';
    const styleRef = doc(db, 'styles', styleDocId);
    if (!(await getDoc(styleRef)).exists()) {
      await setDoc(styleRef, {
        btnColor: '#ff0000',
        bgColor: '#ffffff',
        fontColor: '#000000',
        titleFontColor: '#000000',
        titleFont: 'Arial',
        textFont: 'Arial',
        secundaryBgColor: '#f0f0f0'
      });
      results.push('✅ Estilos (Marca e Cores) inicializados.');
    }

    // 2. Inicializar FrontImage (ID Fixo crítico)
    const imageDocId = 'oIKq1AHF4cHMkqgOcz1h';
    const imageRef = doc(db, 'frontImage', imageDocId);
    if (!(await getDoc(imageRef)).exists()) {
      await setDoc(imageRef, {
        image: 'https://via.placeholder.com/150?text=Sua+Logo'
      });
      results.push('✅ Logo (frontImage) inicializada.');
    }

    // 3. Inicializar User (Usuário Anônimo Obrigatório)
    const userQuery = query(collection(db, 'user'), where('email', '==', 'anonimo@anonimo.com'), limit(1));
    const userSnap = await getDocs(userQuery);
    if (userSnap.empty) {
      await addDoc(collection(db, 'user'), {
        name: 'anonimo',
        phone: '777',
        birthday: '77',
        email: 'anonimo@anonimo.com',
        createdAt: new Date()
      });
      results.push('✅ Usuário Anônimo criado.');
    }

    // 4. Inicializar Buttons (Categorias raiz vinculadas ao "main")
    const buttonQuery = query(collection(db, 'button'), where('parent', '==', 'main'), limit(1));
    const buttonSnap = await getDocs(buttonQuery);
    if (buttonSnap.empty) {
      const defaultCategories = ['Lanches', 'Bebidas', 'Pastéis'];
      for (const cat of defaultCategories) {
        await addDoc(collection(db, 'button'), {
          title: cat,
          parent: 'main',
          active: true,
          order: 1
        });
      }
      results.push('✅ Categorias base (Lanches, Bebidas, Pastéis) criadas.');
    }

    // 5. Inicializar Item (Produto de Amostra)
    const itemQuery = query(collection(db, 'item'), limit(1));
    const itemSnap = await getDocs(itemQuery);
    if (itemSnap.empty) {
      await addDoc(collection(db, 'item'), {
        title: 'Pastel de Carne (Exemplo)',
        category: 'Pastéis',
        comment: 'Delicioso pastel de carne tradicional.',
        price: '10.00',
        display: true,
        carrossel: true,
        image: 'https://via.placeholder.com/300?text=Pastel+de+Carne'
      });
      results.push('✅ Produto de amostra criado.');
    }

    if (results.length === 0) {
      return { success: true, log: ['ℹ️ O banco de dados já parece estar inicializado. Nenhuma mudança feita.'] };
    }

    return { success: true, log: results };
  } catch (error) {
    console.error('Erro na inicialização:', error);
    return { success: false, error: error.message };
  }
};
