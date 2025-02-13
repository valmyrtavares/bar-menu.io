import React from 'react';
import Input from '../../component/Input.js';
import '../../assets/styles/NameForm.css';
import TextKeyboard from '../../component/Textkeyboard';
import useFormValidation from '../../Hooks/useFormValidation.js';
import { GlobalContext } from '../../GlobalContext';

const NameForm = ({ justNameFantasy, setPopupName, totenForm }) => {
  //    const [nameFantasey, setNameFantasy] = React.useState("")
  const global = React.useContext(GlobalContext);
  const { form, setForm, error, handleChange, handleBlur } = useFormValidation({
    name: '',
    phone: '',
    cpf: '',
    birthday: '',
    email: '',
  });
  const [showNameKeyboard, setShowNameKeyboard] = React.useState(false);

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
    }
  };

  return (
    <div className="container-nameform">
      <h3>COMO PODEMOS TE CHAMAR...</h3>
      <Input
        id="name"
        required
        label="Nome"
        autoComplete="off"
        value={form.name}
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
      <button className="goon-btn" onClick={() => justNameFantasy(form.name)}>
        Continue
      </button>
      {!totenForm && (
        <div className="registration-promotion">
          <h4>Cadastre-se aqui e participe de nossas promoções</h4>
          <div className="container-registration-btn">
            <button className="goon-btn" onClick={() => setPopupName(false)}>
              Cadastre-se
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default NameForm;
