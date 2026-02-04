import React from 'react';
import style from '../../assets/styles/CpfNfPopup.module.scss';
import Input from '../Input';
import Keyboard from '../Keyboard';
import CloseBtn from '../closeBtn';
import { GlobalContext } from '../../GlobalContext';

const CpfNfPopup = ({ setShowCpfPopup, setCpfForInvoice, onContinue }) => {
    const [cpf, setCpf] = React.useState('');
    const [error, setError] = React.useState('');
    const [showKeyboard, setShowKeyboard] = React.useState(false);
    const global = React.useContext(GlobalContext);

    // Função de validação de CPF (reutilizada do useFormValidation)
    const isValidCpf = (cpfDigits) => {
        // Remove caracteres não numéricos
        const digits = cpfDigits.replace(/\D/g, '');

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

    // Formata o CPF conforme o usuário digita
    const formatCpf = (value) => {
        const digits = value.replace(/\D/g, '');
        let formattedCpf = digits;

        if (digits.length > 3)
            formattedCpf = `${digits.substring(0, 3)}.${digits.substring(3)}`;

        if (digits.length > 6)
            formattedCpf = `${digits.substring(0, 3)}.${digits.substring(
                3,
                6
            )}.${digits.substring(6)}`;

        if (digits.length > 9)
            formattedCpf = `${digits.substring(0, 3)}.${digits.substring(
                3,
                6
            )}.${digits.substring(6, 9)}-${digits.substring(9, 11)}`;

        return formattedCpf;
    };

    // Adiciona caractere do teclado numérico
    const addCharacter = (char, id) => {
        if (char === 'clearField') {
            setCpf('');
            setError('');
            return;
        }

        if (char === 'Bcksp') {
            const newValue = cpf.slice(0, -1);
            setCpf(formatCpf(newValue));
            setError('');
            return;
        }

        // Limita a 11 dígitos
        const currentDigits = cpf.replace(/\D/g, '');
        if (currentDigits.length >= 11) return;

        const newValue = cpf + char;
        const formattedValue = formatCpf(newValue);
        setCpf(formattedValue);

        // Valida em tempo real quando atingir 11 dígitos
        const digits = newValue.replace(/\D/g, '');
        if (digits.length === 11) {
            if (!isValidCpf(digits)) {
                setError('CPF inválido');
                // Remove o último dígito automaticamente
                setTimeout(() => {
                    setCpf(formatCpf(newValue.slice(0, -1)));
                    setError('');
                }, 800);
            } else {
                setError('');
            }
        }
    };

    // Fecha o teclado
    const closeKeyboard = () => {
        setShowKeyboard(false);
    };

    // Foco no campo
    const handleFocus = () => {
        if (global.isToten) {
            setShowKeyboard(true);
        }
    };

    // Botão "Não" - continua sem CPF
    const handleNo = () => {
        setCpfForInvoice('');
        setShowCpfPopup(false);
        onContinue();
    };

    // Botão "Sim" - valida e salva o CPF
    const handleYes = () => {
        const digits = cpf.replace(/\D/g, '');

        if (digits.length === 0) {
            // Se não digitou nada, continua sem CPF
            setCpfForInvoice('');
            setShowCpfPopup(false);
            onContinue();
            return;
        }

        if (digits.length !== 11) {
            setError('Por favor, digite um CPF completo');
            return;
        }

        if (!isValidCpf(digits)) {
            setError('CPF inválido');
            return;
        }

        // CPF válido, salva e continua
        setCpfForInvoice(digits);
        setShowCpfPopup(false);
        onContinue();
    };

    // Fecha o popup
    const handleClose = () => {
        setShowCpfPopup(false);
        setCpfForInvoice('');
        onContinue();
    };

    return (
        <div>
            <div className={style.overlay}></div>
            <div className={style.cpfNfPopupContainer}>
                <CloseBtn setClose={handleClose} />
                <h1>Deseja CPF na nota fiscal?</h1>
                <p>
                    Digite seu CPF ou clique em "Não" para continuar sem CPF
                </p>

                <div className={style.cpfInputContainer}>
                    <Input
                        id="cpf"
                        autoComplete="off"
                        placeholder="000.000.000-00"
                        value={cpf}
                        type="text"
                        onChange={(e) => {
                            const formattedValue = formatCpf(e.target.value);
                            setCpf(formattedValue);
                        }}
                        onFocus={handleFocus}
                        readOnly={global.isToten} // No totem, só aceita entrada via teclado virtual
                    />
                    {error && (
                        <p className={style.errorMessage}>
                            {error}
                        </p>
                    )}

                    {showKeyboard && global.isToten && (
                        <Keyboard
                            addCharacter={addCharacter}
                            closeKeyboard={closeKeyboard}
                            id="cpf"
                        />
                    )}
                </div>

                <div className={style.buttonContainer}>
                    <button
                        className={style.btnNo}
                        onClick={handleNo}
                    >
                        Não
                    </button>
                    <button
                        className={style.btnYes}
                        onClick={handleYes}
                    >
                        Sim
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CpfNfPopup;
