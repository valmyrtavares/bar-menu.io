import React from 'react';
import Input from '../../component/Input.js';
import '../../assets/styles/form.css';
import Title from '../../component/title.js';
import { auth } from '../../config-firebase/firebase.js';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { GlobalContext } from '../../GlobalContext';
import { useNavigate } from 'react-router-dom';
import Error from '../../component/error.js';
import TextKeyboard from '../../component/Textkeyboard.js';
import useFormValidation from '../../Hooks/useFormValidation.js';
import { logAction } from '../../api/AuditLogger';

function Login() {
  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = React.useState(false);
  const [showNameKeyboard, setShowNameKeyboard] = React.useState(false);
  const [showEmailKeyboard, setShowEmailKeyboard] = React.useState(false);
  const [showPasswordlKeyboard, setShowPasswordKeyboard] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const global = React.useContext(GlobalContext);
  const { form, setForm, error, handleChange, handleBlur, clientFinded } =
    useFormValidation({
      email: '',
      password: '',
    });

  const handleFocus = (e) => {
    const { id, value } = e.target;
    if (id === 'password') {
      setShowPasswordKeyboard(true);
      setShowEmailKeyboard(false);
    } else if (id === 'email') {
      setShowPasswordKeyboard(false);
      setShowEmailKeyboard(true);
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
    if (id === 'password') {
      newValue = form.password + char;
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

  const closeKeyboard = (Value, id) => {
    if (id === 'password') {
      showPasswordlKeyboard(false);
      const syntheticEvent = {
        target: {
          id: 'password',
          value: Value,
        },
      };
      handleBlur(syntheticEvent);
    }

    if (id === 'email') {
      showEmailKeyboard(false);
      const syntheticEvent = {
        target: {
          id: 'email',
          value: Value,
        },
      };
      handleBlur(syntheticEvent);
    }
  };

  // function handleChange({ target }) {
  //   const { id, value } = target;
  //   setForm({ ...form, [id]: value, [id]: value });
  // }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const email = form.email.trim().toLowerCase();
      const password = form.password.trim();

      let loggedInEmail = null;
      let token = null;

      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );
      loggedInEmail = userCredential.user.email;
      token = userCredential.user.accessToken;

      if (loggedInEmail) {
        global.loginUser(loggedInEmail, token);
        setTimeout(() => {
          logAction('Fez Login', 'Usuário efetuou login administrativo com sucesso.');
        }, 100);
        navigate('/admin');
      }
    } catch (error) {
      setErrorMessage(true);
      console.error('Erro de autenticação:', error);
    }
  };

  return (
    <div className="container mt-5 p-3 bg-body-tertiar">
      <Title mainTitle="Login Administrador" />
      {errorMessage && (
        <Error
          setErrorPopup={setErrorMessage}
          error={{ login: 'Sua senha ou email estão incorretos' }}
        />
      )}
      <form onSubmit={handleSubmit} className="m-1" autoComplete="off">
        <Input
          id="email"
          label="email"
          autoComplete="off"
          value={form.email}
          type="email"
          onFocus={handleFocus}
          onChange={handleChange}
        />
        {showEmailKeyboard && global.isToten && (
          <TextKeyboard
            addCharacter={addCharacter}
            id="email"
            closeKeyboard={() => closeKeyboard(form.email, 'email')}
          />
        )}

        <div style={{ position: 'relative' }}>
          <Input
            id="password"
            autoComplete="new-password"
            label="Password"
            value={form.password}
            type={showPassword ? 'text' : 'password'}
            onFocus={handleFocus}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '35px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#333',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        </div>
        {showPasswordlKeyboard && global.isToten && (
          <TextKeyboard
            addCharacter={addCharacter}
            id="password"
            closeKeyboard={() => closeKeyboard(form.password, 'password')}
          />
        )}

        <button className="btn btn-primary">Enviar</button>
      </form>
    </div>
  );
}

export default Login;
