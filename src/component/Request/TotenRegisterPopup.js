import React from 'react';
import style from '../../assets/styles/TotenRegisterPopup.module.scss';
import Input from '../Input';
import TextKeyboard from '../../component/Textkeyboard';
import useFormValidation from '../../Hooks/useFormValidation.js';
import { GlobalContext } from '../../GlobalContext';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { db } from '../../config-firebase/firebase.js';
import { getOneItemColleciton, getBtnData } from '../../api/Api.js';
import Keyboard from '../../component/Keyboard';
import DefaultComumMessage from '../Messages/DefaultComumMessage.js';
import CloseBtn from '../closeBtn.js';
const TotenRegisterPopup = ({
  setOpenCloseTotenPopup,
  setCurrentUser,
  sendRequestToKitchen,
  isSubmitting,
}) => {
  const { form, setForm, error, handleChange, handleBlur } = useFormValidation({
    name: '',
    phone: '',
    cpf: '',
    birthday: '',
    email: '',
  });

  const [showNameKeyboard, setShowNameKeyboard] = React.useState(false);
  const [nameOption, setNameOption] = React.useState(true);
  const [cpfOption, setCpfOption] = React.useState(true);
  const [noDobleClick, setNoDobleClick] = React.useState(false);
  const [showCpfKeyboard, setShowCpfKeyboard] = React.useState(false);
  const [warningMessageToEmptyFields, setWarningMessageToEmptyFields] =
    React.useState(false);
  const [warningMessageCustomerNotFinded, setWarningMessageCustomerNotFinded] =
    React.useState(false);
  const global = React.useContext(GlobalContext);

  const closeKeyboard = (Value, id) => {
    if (id === 'fantasyName') {
      setShowNameKeyboard(false);
      const syntheticEvent = {
        target: {
          id: 'fantasyName',
          value: Value,
        },
      };
      handleBlur(syntheticEvent);
    }
  };

  const addCharacter = (char, id) => {
    if (char === 'clearField') {
      // Limpar o campo CPF
      setForm((prev) => ({ ...prev, id: '' }));

      // Criar e passar o evento sintético para handleChange com o campo vazio
      const syntheticEvent = {
        target: {
          id: id,
          value: '', // Campo vazio
        },
      };
      handleChange(syntheticEvent); // Disparar o handleChange com o campo limpo
      return; // Evitar adicionar mais caracteres após limpar o campo
    }

    if (char === 'Bcksp') {
      // Limpar o campo CPF
      setForm((prev) => ({
        ...prev,
        [id]: prev[id].slice(0, -1), // Remove a última letra
      }));

      // Criar e passar o evento sintético para handleChange com o campo vazio
      const syntheticEvent = {
        target: {
          id: id,
          value: form[id].slice(0, -1), // Campo vazio
        },
      };
      handleChange(syntheticEvent); // Disparar o handleChange com o campo limpo
      return; // Evitar adicionar mais caracteres após limpar o campo
    }

    let newValue = '';
    // Adicionar o novo caractere ao valor atual do CPF
    if (id === 'phone') {
      newValue = form.phone + char;
    } else if (id === 'cpf') {
      newValue = form.cpf + char;
    } else if (id === 'name') {
      newValue = form.name + char;
    } else if (id === 'email') {
      newValue = form.email + char;
    }

    // Criar e passar o evento sintético para handleChange com o novo valor
    const syntheticEvent = {
      target: {
        id: id,
        value: newValue,
      },
    };

    handleChange(syntheticEvent);
  };

  const handleFocus = (e) => {
    const { id, value } = e.target;
    if (id === 'name') {
      setShowNameKeyboard(true);
      setShowCpfKeyboard(false);
      setCpfOption(false);
    }
    if (id === 'cpf') {
      setShowCpfKeyboard(true);
      setShowNameKeyboard(false);
      setNameOption(false);
    }
  };

  const addNickname = async () => {
    debugger;
    if (form.cpf === '' && form.name === '') {
      setWarningMessageToEmptyFields(true);

      if (window.warningTimeout) {
        clearTimeout(window.warningTimeout);
      }

      window.warningTimeout = setTimeout(() => {
        setWarningMessageToEmptyFields(false);
      }, 5000);
      setShowNameKeyboard(false);
      setShowCpfKeyboard(false);
      setCpfOption(true);
      setNameOption(true);
      return; // Sai da função para evitar continuar a execução
    }
    if (noDobleClick) return; // evita disparo duplo
    setNoDobleClick(true);
    const noCustomer = {
      name: 'anonimo',
      phone: '777',
      birthday: '77',
      fantasyName: form.name,
      email: 'anonimo@anonimo.com',
    };

    if (form.cpf !== '') {
      const data = await getBtnData('user');
      const recoveredClient = data.find((item) => item.cpf === form.cpf);

      if (recoveredClient) {
        global.setId(recoveredClient.id);
        localStorage.setItem(
          'userMenu',
          JSON.stringify({
            id: recoveredClient.id,
            name: recoveredClient.name,
          })
        );
        setCurrentUser(recoveredClient);
        setOpenCloseTotenPopup(false);
        sendRequestToKitchen();
        return;
      } else {
        setWarningMessageCustomerNotFinded(true);
        if (window.warningTimeout) {
          clearTimeout(window.warningTimeout);
        }

        window.warningTimeout = setTimeout(() => {
          setWarningMessageCustomerNotFinded(false);
        }, 5000);
        setForm({ ...form, cpf: '' });
        setNoDobleClick(false);
        setNameOption(true);
        setCpfOption(true);
        setShowCpfKeyboard(false);
        return;
      }
    }

    if (form.name !== '') {
      try {
        // Adiciona o cliente ao Firestore
        const docRef = await addDoc(collection(db, 'user'), noCustomer);

        // Salva o ID no contexto global
        global.setId(docRef.id);

        // Armazena no localStorage
        localStorage.setItem(
          'userMenu',
          JSON.stringify({ id: docRef.id, name: noCustomer.fantasyName })
        );

        console.log('Document written with ID:', docRef.id);

        // Busca o usuário recém-criado no Firestore
        const currentUser = await getOneItemColleciton('user', docRef.id);

        sendRequestToKitchen();
        // Atualiza o estado do cliente atual
        setCurrentUser(currentUser);

        // Fecha o popup
        setOpenCloseTotenPopup(false);
      } catch (error) {
        console.error('Erro ao adicionar usuário:', error);
      } finally {
        setNoDobleClick(false); // libera o botão depois que terminar
      }
    }
  };

  return (
    <div>
      <div className={style.overlay}></div> {/* Overlay para o fundo escuro */}
      {warningMessageToEmptyFields && (
        <DefaultComumMessage msg="Preencha o número de CPF se for cadastrado, ou nome para que possamos chamar" />
      )}
      {warningMessageCustomerNotFinded && (
        <DefaultComumMessage msg="Infelizmente não achamos o seu registro, Cadastre-se ou preencha um nome/apelido sem registro para ser chamado" />
      )}
      <div className={style.totenRegisterPopupSecondContainer}>
        <CloseBtn setClose={setOpenCloseTotenPopup} />
        {nameOption && (
          <div>
            <h1>Como devemos chamar você ?</h1>
            <Input
              id="name"
              required
              autoComplete="off"
              value={form.name}
              placeholder="Nome"
              type="text"
              onChange={handleChange}
              onFocus={handleFocus}
            />
            {showNameKeyboard && global.isToten && (
              <TextKeyboard
                addCharacter={addCharacter}
                id="name"
                closeKeyboard={() => closeKeyboard(form.fantasyName, 'name')}
              />
            )}
          </div>
        )}
        {cpfOption && (
          <div>
            <h1>Se você já tem cadastro preencha com o seu CPF</h1>
            <div className="cpf-input">
              <Input
                id="cpf"
                autoComplete="off"
                required
                placeholder="CPF"
                value={form.cpf}
                type="text"
                onChange={handleChange}
                onFocus={handleFocus}
                // onBlur={handleBlur}
              />
              {showCpfKeyboard && global.isToten && (
                <Keyboard
                  // handleBlur={handleBlur}
                  addCharacter={addCharacter}
                  closeKeyboard={() => closeKeyboard(form.cpf, 'cpf')}
                  id="cpf"
                />
              )}
            </div>
          </div>
        )}
        <button
          disabled={noDobleClick}
          className={style.goonBtn}
          onClick={addNickname}
        >
          {!noDobleClick ? 'Continue' : 'Enviando...'}
        </button>
      </div>
    </div>
  );
};
export default TotenRegisterPopup;
