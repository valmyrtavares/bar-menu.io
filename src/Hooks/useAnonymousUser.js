import { addDoc, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export function useAnonymousUser({ db, global, pdv, setForm }) {
  const navigate = useNavigate();

  async function handleAnonymousSubmit(name) {
    const formWithDefaults = {
      fantasyName: name || '',
      name: 'anonimo',
      phone: '777',
      birthday: '77',
      email: 'anonimo@anonimo.com',
    };

    try {
      const docRef = await addDoc(collection(db, 'user'), formWithDefaults);

      // Context global
      global.setId(docRef.id);

      const currentUser = {
        id: docRef.id,
        name: formWithDefaults.fantasyName,
      };

      localStorage.setItem('userMenu', JSON.stringify(currentUser));

      // Reset do formulário
      setForm({
        name: '',
        phone: '',
        birthday: '',
        email: '',
        cpf: '',
      });

      // Navegação
      if (!pdv) {
        navigate('/');
      } else {
        navigate('/admin/requestlist');
      }
    } catch (error) {
      console.error('Erro ao criar usuário anônimo:', error);
    }
  }

  return {
    handleAnonymousSubmit,
  };
}
