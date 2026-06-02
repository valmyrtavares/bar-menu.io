import { useEffect } from 'react';
import { db, auth } from '../config-firebase/firebase';
import { signInAnonymously } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

const defaultNoCustomer = {
  name: 'anonimo',
  phone: '777',
  birthday: '77',
  email: 'anonimo@anonimo.com',
  request: []
};

export const getAnonymousUser = async () => {
  // Mantemos por retrocompatibilidade se alguma parte antiga tentar buscar direto
  // Mas no novo fluxo, cada um tem seu UID único mapeado diretamente no Auth.
  try {
    let currentUser = auth.currentUser;
    if (!currentUser) {
      const userCredential = await signInAnonymously(auth);
      currentUser = userCredential.user;
    }
    const docRef = doc(db, 'user', currentUser.uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    } else {
      await setDoc(docRef, defaultNoCustomer);
      return { id: currentUser.uid, ...defaultNoCustomer };
    }
  } catch (error) {
    console.error('Erro em getAnonymousUser:', error);
    return { id: 'anonymous_error', ...defaultNoCustomer };
  }
};

export const useEnsureAnonymousUser = () => {
  useEffect(() => {
    const checkAndSetAnonymousUser = async () => {
      try {
        // 1. Garante que o cliente tem uma sessão anônima ativa do Firebase Auth
        let currentUser = auth.currentUser;
        if (!currentUser) {
          const userCredential = await signInAnonymously(auth);
          currentUser = userCredential.user;
          console.log('Firebase Auth Anônimo ativado. UID:', currentUser.uid);
        }

        // 2. Verifica o localStorage para checar status de login legados ou atuais
        const storedUser = localStorage.getItem('userMenu');
        if (storedUser) {
          const userData = JSON.parse(storedUser);

          // Se o usuário já está migrado ou o ID do localStorage já coincide com o UID
          if (userData.migratedToAuth || userData.id === currentUser.uid) {
            return;
          }

          // Cenário de Migração: O cliente tem um cadastro legado (ID aleatório antigo, ex: "4pPu7raB1l...")
          const legacyId = userData.id;
          console.log(`Iniciando migração do cliente legado ${legacyId} para o UID ${currentUser.uid}...`);

          const legacyDocRef = doc(db, 'user', legacyId);
          const legacyDocSnap = await getDoc(legacyDocRef);

          let profileData = { ...defaultNoCustomer };
          if (legacyDocSnap.exists()) {
            profileData = legacyDocSnap.data();
          }

          // Cria o novo documento indexado pelo UID do Firebase
          const newDocRef = doc(db, 'user', currentUser.uid);
          await setDoc(newDocRef, profileData);

          // Deleta o registro antigo para evitar lixo no banco de dados
          try {
            await deleteDoc(legacyDocRef);
          } catch (e) {
            console.warn('Erro ao deletar documento do usuário legado:', e);
          }

          // Atualiza o localStorage com o novo UID e a marca de migração
          const updatedUser = {
            id: currentUser.uid,
            name: profileData.fantasyName || profileData.name || userData.name,
            migratedToAuth: true
          };
          localStorage.setItem('userMenu', JSON.stringify(updatedUser));
          console.log(`Migração realizada com sucesso para o cliente: ${updatedUser.name}`);
        } else {
          // Se for Toten e não possuir sessão iniciada, gera uma sessão anônima inicial padrão
          const isToten = localStorage.getItem('isToten') === 'true';
          if (isToten) {
            const anonymousDocRef = doc(db, 'user', currentUser.uid);
            const anonymousSnap = await getDoc(anonymousDocRef);
            if (!anonymousSnap.exists()) {
              await setDoc(anonymousDocRef, defaultNoCustomer);
            }
            const updatedUser = {
              id: currentUser.uid,
              name: 'anonimo',
              migratedToAuth: true
            };
            localStorage.setItem('userMenu', JSON.stringify(updatedUser));
            console.log('Sessão de Toten inicializada sob o UID:', currentUser.uid);
          }
        }
      } catch (error) {
        console.error('Erro no fluxo useEnsureAnonymousUser:', error);
      }
    };

    checkAndSetAnonymousUser();
  }, []);
};

