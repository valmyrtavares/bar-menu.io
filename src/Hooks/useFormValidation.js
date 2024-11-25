import React from 'react';
import { getBtnData } from '../api/Api';

const useFormValidation = (initialValue = '') => {
  const [form, setForm] = React.useState(initialValue);
  const [error, setError] = React.useState({});
  const [clientFinded, setClientFinded] = React.useState({});

  const handlePhoneChange = (value) => {
    // Remove todos os caracteres não numéricos
    const digits = value.replace(/\D/g, '');

    // Formata conforme o usuário digita
    let formattedPhone = digits;
    if (digits.length > 0) formattedPhone = `(${digits.substring(0, 2)}`;
    if (digits.length > 2) formattedPhone += `) ${digits.substring(2, 3)}`;
    if (digits.length > 3) formattedPhone += ` ${digits.substring(3, 7)}`;
    if (digits.length > 7) formattedPhone += ` ${digits.substring(7, 11)}`;

    setForm((prev) => ({
      ...prev,
      phone: formattedPhone,
    }));

    // Validação: se o comprimento não for 11, mostra o erro
    if (digits.length >= 11) {
      setError((prevError) => ({
        ...prevError,
        phone: '', // Limpa o erro do campo phone
      }));
    } else {
      setError((prevError) => ({
        ...prevError,
        phone: 'Por favor, insira um número válido de celular com 11 dígitos',
      }));
    }
  };

  const handleCpfChange = (value) => {
    // Remove todos os caracteres não numéricos
    const digits = value.replace(/\D/g, '');

    // Formata o CPF conforme o usuário digita
    let formattedCpf = digits;

    // Adiciona o primeiro hífen após 3 dígitos
    if (digits.length > 3)
      formattedCpf = `${digits.substring(0, 3)}-${digits.substring(3)}`;

    // Adiciona o segundo hífen após 6 dígitos
    if (digits.length > 6)
      formattedCpf = `${digits.substring(0, 3)}-${digits.substring(
        3,
        6
      )}-${digits.substring(6)}`;

    // Adiciona a barra após 9 dígitos
    if (digits.length > 9)
      formattedCpf = `${digits.substring(0, 3)}-${digits.substring(
        3,
        6
      )}-${digits.substring(6, 9)}/${digits.substring(9, 11)}`;

    // Atualiza o estado com o CPF formatado
    setForm((prev) => ({
      ...prev,
      cpf: formattedCpf,
    }));

    // Validação: se o comprimento não for 11, mostra o erro
    if (digits.length === 11 && isValidCpf(digits)) {
      setError((prevError) => ({
        ...prevError,
        cpf: '', // Limpa o erro do campo CPF
      }));
    } else {
      setError((prevError) => ({
        ...prevError,
        cpf: 'Por favor, insira um CPF válido.',
      }));
    }
  };

  const checkCpfRepeated = async (cpf) => {
    const data = await getBtnData('user');
    const repeatedCpf = data.some((item) => item.cpf === cpf);
    if (repeatedCpf) {
      const customer = data.filter((item) => item.cpf === cpf);
      setClientFinded(customer);
    }

    return repeatedCpf;
  };

  const handleCpfCheck = async (digits) => {
    if (digits.length > 11) {
      // Faz a verificação de CPF repetido
      const isRepeated = await checkCpfRepeated(digits);
      console.log('sRepeated ', isRepeated);

      if (isRepeated) {
        // Se o CPF for repetido, mostra o erro
        setError((prevError) => ({
          ...prevError,
          cpf: 'Esse número de CPF já foi usado',
        }));
      } else {
        // Se não for repetido, remove o erro de CPF
        setError((prevError) => ({
          ...prevError,
          cpf: '',
        }));
      }
    }
  };

  const isValidCpf = (cpf) => {
    console.log('Entrei no isValid   ');

    // Remove caracteres não numéricos
    const digits = cpf.replace(/\D/g, '');

    // Verifica se o CPF tem 11 dígitos
    if (digits.length !== 11) return false;

    // Verifica se todos os dígitos são iguais (como 111.111.111-11, o que é inválido)
    if (/^(\d)\1+$/.test(digits)) return false;

    // Função para calcular o dígito verificador
    const calculateDigit = (base) => {
      let sum = 0;
      for (let i = 0; i < base.length; i++) {
        sum += base[i] * (base.length + 1 - i);
      }
      const remainder = (sum * 10) % 11;
      return remainder === 10 ? 0 : remainder;
    };

    // Pega os primeiros 9 dígitos e calcula o primeiro dígito verificador
    const firstNineDigits = digits.substring(0, 9);
    const firstVerifier = calculateDigit(firstNineDigits);

    // Pega os primeiros 10 dígitos e calcula o segundo dígito verificador
    const firstTenDigits = digits.substring(0, 10);
    const secondVerifier = calculateDigit(firstTenDigits);

    // Verifica se os dígitos calculados batem com os dígitos verificadores informados
    return (
      firstVerifier === parseInt(digits[9], 10) &&
      secondVerifier === parseInt(digits[10], 10)
    );
  };

  const isValidDate = (dateString) => {
    const dateParts = dateString.split('-');
    const inputYear = parseInt(dateParts[0], 10);
    const inputMonth = parseInt(dateParts[1], 10);
    const inputDay = parseInt(dateParts[2], 10);

    // Cria um objeto Date usando os componentes separados da data
    const date = new Date(inputYear, inputMonth - 1, inputDay);

    // Verifica se a data foi corretamente criada e se corresponde à data original
    const isValid =
      date.getFullYear() === inputYear &&
      date.getMonth() + 1 === inputMonth &&
      date.getDate() === inputDay;

    return isValid;
  };

  const handleBirthdayChange = (value) => {
    const numericValue = value.replace(/\D/g, '');

    // Aplica a formatação no estilo DD/MM/AAAA
    let formattedValue = numericValue;
    if (numericValue.length > 2) {
      formattedValue = numericValue.slice(0, 2) + '/' + numericValue.slice(2);
    }
    if (numericValue.length > 4) {
      formattedValue =
        numericValue.slice(0, 2) +
        '/' +
        numericValue.slice(2, 4) +
        '/' +
        numericValue.slice(4, 8);
    }

    // Tenta criar uma data válida a partir do valor formatado
    const [day, month, year] = formattedValue.split('/');
    const isCompleteDate =
      numericValue.length === 8 &&
      !isNaN(new Date(`${year}-${month}-${day}`).getTime());
    const today = new Date();
    const selectedDate = isCompleteDate
      ? new Date(`${year}-${month}-${day}`)
      : null;

    if (selectedDate && selectedDate > today) {
      setError((prevError) => ({
        ...prevError,
        birthday: 'Por favor, insira uma data de aniversário válida.',
      }));
    } else if (!isCompleteDate && numericValue.length === 8) {
      setError((prevError) => ({
        ...prevError,
        birthday:
          'A data inserida não existe. Por favor, insira uma data válida.',
      }));
    } else {
      setError((prevError) => ({
        ...prevError,
        birthday: '', // Limpa o erro do campo birthday
      }));
    }

    setForm((prevForm) => ({
      ...prevForm,
      birthday: formattedValue,
    }));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === 'cpf') {
      handleCpfChange(value);
    } else if (id === 'phone') {
      handlePhoneChange(value);
    } else if (id === 'birthday') {
      handleBirthdayChange(value);
    } else {
      setForm((prevForm) => ({
        ...prevForm,
        [id]: value,
      }));
    }
  };

  const handleBlur = (e) => {
    const { id, value } = e.target;
    handleCpfCheck(value);
    return value.split('.')[0];
  };

  return {
    form,
    error,
    handleChange,
    setForm,
    handleBlur,
    clientFinded,
  };
};
export default useFormValidation;
//userMenu	{"id":"EKWWW2375boMRbNlAi0F","name":"Valmyr Tavares Malta de Lima"}
