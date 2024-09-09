import React from "react";

const useFormValidation = (initialValue = "") => {
  const [form, setForm] = React.useState(initialValue);
  const [error, setError] = React.useState({});

  const handlePhoneChange = (value) => {
    // Remove todos os caracteres não numéricos
    const digits = value.replace(/\D/g, "");

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
        phone: "", // Limpa o erro do campo phone
      }));
    } else {
      setError((prevError) => ({
        ...prevError,
        phone: "Por favor, insira um número válido de celular com 11 dígitos",
      }));
    }
  };

  const handleCpfChange = (value) => {
    // Remove todos os caracteres não numéricos
    const digits = value.replace(/\D/g, "");

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
    if (digits.length === 11) {
      setError((prevError) => ({
        ...prevError,
        cpf: "", // Limpa o erro do campo CPF
      }));
    } else {
      setError((prevError) => ({
        ...prevError,
        cpf: "Por favor, insira um CPF válido com 11 dígitos",
      }));
    }
  };

  const isValidDate = (dateString) => {
    const dateParts = dateString.split("-");
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
    const today = new Date();
    const selectedDate = new Date(value);

    if (selectedDate > today) {
      setError((prevError) => ({
        ...prevError,
        birthday: "Por favor, insira uma data de aniversário válida.",
      }));
    } else if (!isValidDate(value)) {
      setError((prevError) => ({
        ...prevError,
        birthday:
          "A data inserida não existe. Por favor, insira uma data válida.",
      }));
    } else {
      setError((prevError) => ({
        ...prevError,
        birthday: "", // Limpa o erro do campo birthday
      }));
    }

    setForm((prevForm) => ({
      ...prevForm,
      birthday: value,
    }));
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    console.log("id   ", id);

    if (id === "cpf") {
      handleCpfChange(value);
    } else if (id === "phone") {
      handlePhoneChange(value);
    } else if (id === "birthday") {
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
    console.log("value no useForm  ", value);
    return value.split(".")[0];
  };

  return {
    form,
    error,
    handleChange,
    setForm,
    handleBlur,
  };
};
export default useFormValidation;
//userMenu	{"id":"EKWWW2375boMRbNlAi0F","name":"Valmyr Tavares Malta de Lima"}
