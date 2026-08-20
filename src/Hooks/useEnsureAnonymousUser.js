import { useEffect } from 'react';
import { db, auth } from '../config-firebase/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { setDoc, deleteDoc } from '../api/FirestoreInterceptor';

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
      try {
        const userCredential = await signInAnonymously(auth);
        currentUser = userCredential.user;
      } catch (authError) {
        console.warn('signInAnonymously falhou em getAnonymousUser:', authError.message);
      }
    }
    if (currentUser) {
      const docRef = doc(db, 'user', currentUser.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      } else {
        await setDoc(docRef, defaultNoCustomer);
        return { id: currentUser.uid, ...defaultNoCustomer };
      }
    } else {
      // Fallback sem auth
      const tempId = `legacy_anon_${Date.now()}`;
      return { id: tempId, ...defaultNoCustomer };
    }
  } catch (error) {
    console.error('Erro em getAnonymousUser:', error);
    return { id: 'anonymous_error', ...defaultNoCustomer };
  }
};

export const useEnsureAnonymousUser = () => {
  useEffect(() => {
    const isToten = localStorage.getItem('isToten') === 'true';
    if (isToten && !localStorage.getItem('userMenu')) {
      const initialUid = auth.currentUser?.uid || `legacy_anon_${Date.now()}`;
      const tempUser = {
        id: initialUid,
        name: 'anonimo',
        migratedToAuth: false
      };
      localStorage.setItem('userMenu', JSON.stringify(tempUser));
    }

    const checkAndSetAnonymousUser = async () => {
      try {
        // 1. Garante que o cliente tem uma sessão anônima ativa do Firebase Auth
        let currentUser = auth.currentUser;
        if (!currentUser) {
          try {
            const userCredential = await signInAnonymously(auth);
            currentUser = userCredential.user;
            console.log('Firebase Auth Anônimo ativado. UID:', currentUser.uid);
          } catch (authError) {
            console.warn('Firebase Auth Anônimo desativado ou sem rede. Usando fluxo sem autenticação.');
          }
        }

        // Se realmente não temos um usuário autenticado (Anonymous Auth desativado)
        if (!currentUser) {
          const storedUser = localStorage.getItem('userMenu');
          if (!storedUser) {
            const tempUid = `legacy_anon_${Date.now()}`;
            const updatedUser = {
              id: tempUid,
              name: 'anonimo',
              migratedToAuth: false
            };
            localStorage.setItem('userMenu', JSON.stringify(updatedUser));
            console.log('Criado usuário temporário não autenticado:', tempUid);
          }
          return;
        }

        // 2. Verifica o localStorage para checar status de login legados ou atuais
        const storedUser = localStorage.getItem('userMenu');
        if (storedUser) {
          const userData = JSON.parse(storedUser);

          // Se o usuário já está migrado ou o ID do localStorage já coincide com o UID
          if (userData.migratedToAuth || userData.id === currentUser.uid) {
            return;
          }

          // Verificação de segurança: Checa se o ID antigo pertence a um cliente cadastrado no Firestore
          const legacyId = userData.id;
          const legacyDocRef = doc(db, 'user', legacyId);
          const legacyDocSnap = await getDoc(legacyDocRef);

          if (legacyDocSnap.exists()) {
            const profileData = legacyDocSnap.data();

            // Se for um usuário real cadastrado (possuir CPF ou nome diferente de 'anonimo'), NUNCA deletar nem sobrescrever
            if (profileData.cpf || (profileData.name && profileData.name !== 'anonimo')) {
              console.log(`Usuário ${profileData.name} (${legacyId}) é um cliente registrado. Preservando cadastro.`);
              const updatedUser = {
                id: legacyId,
                name: profileData.fantasyName || profileData.name || userData.name,
                migratedToAuth: true
              };
              localStorage.setItem('userMenu', JSON.stringify(updatedUser));
              return;
            }

            // Apenas para dados anônimos não migrados: cria cópia vinculada ao UID atual sem deletar o documento antigo
            const newDocRef = doc(db, 'user', currentUser.uid);
            await setDoc(newDocRef, profileData);
          }

          const updatedUser = {
            id: currentUser.uid,
            name: userData.name || 'anonimo',
            migratedToAuth: true
          };
          localStorage.setItem('userMenu', JSON.stringify(updatedUser));
          console.log(`Sessão ajustada para o UID anônimo: ${currentUser.uid}`);
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

