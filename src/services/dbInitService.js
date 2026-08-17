import { db } from '../config-firebase/firebase';
import { doc, getDoc, collection, getDocs, query, limit, where } from 'firebase/firestore';
import { setDoc, addDoc } from '../api/FirestoreInterceptor';

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

    // 6. Inicializar Admin (Super Admin Padrão)
    const adminQuery = query(collection(db, 'admins'), where('role', '==', 'admin_TOTAL'), limit(1));
    const adminSnap = await getDocs(adminQuery);
    if (adminSnap.empty) {
      await addDoc(collection(db, 'admins'), {
        email: 'suporte@barmenu.com',
        name: 'Super Admin',
        role: 'admin_TOTAL',
        permissions: ['ALL'],
        createdAt: new Date(),
        status: 'active'
      });
      results.push('✅ Administrador padrão (Super Admin) criado no banco.');
    }

    // 7. Inicializar Audit Logs
    const auditQuery = query(collection(db, 'audit_logs'), limit(1));
    const auditSnap = await getDocs(auditQuery);
    if (auditSnap.empty) {
      await addDoc(collection(db, 'audit_logs'), {
        action: 'Setup Inicial',
        details: 'Criação automática das coleções iniciais, incluindo admins e audit_logs.',
        timestamp: new Date(),
        user: 'Sistema'
      });
      results.push('✅ Coleção de Audit Logs inicializada.');
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
