import React, { useState } from 'react';
import styles from './ReusableInputFields.module.scss';

type InputSize = 'large' | 'medium' | 'small';

interface SelectOption {
  [key: string]: any;
}

interface InputField {
  type: string;
  label: string;
  id: string;
  require?: boolean;
  autoComplete?: boolean;
  value: any;
  size: InputSize;
  selectOptions?: SelectOption[];
  selectLabel?: string;
}

interface Props {
  fields: InputField[];
  onSubmit: (form: Record<string, any>) => void;
}

const ReusableInputFields: React.FC<Props> = ({ fields, onSubmit }) => {
  const [form, setForm] = useState<Record<string, any>>(
    fields.reduce((acc, field) => {
      acc[field.id] = field.value || '';
      return acc;
    }, {} as Record<string, any>)
  );

  //   const handleChange = (
  //     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  //   ) => {
  //     const { id, value, type, checked } = e.target;
  //     setForm((prev) => ({
  //       ...prev,
  //       [id]: type === 'checkbox' ? checked : value,
  //     }));
  //   };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value, type } = e.target;
    let newValue: any = value;

    if (type === 'checkbox') {
      // Type guard: only HTMLInputElement has 'checked'
      newValue = (e.target as HTMLInputElement).checked;
    }

    setForm((prev) => ({
      ...prev,
      [id]: newValue,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.gridContainer}>
        {fields.map((field, index) => {
          const sizeClass = styles[`col-${field.size}`];

          return (
            <div key={index} className={`${styles.inputGroup} ${sizeClass}`}>
              <label htmlFor={field.id} className={styles.label}>
                {field.label}
              </label>

              {field.type === 'select' && field.selectOptions ? (
                <select
                  id={field.id}
                  required={field.require}
                  value={form[field.id]}
                  onChange={handleChange}
                  className={styles.input}
                >
                  <option value="">Selecione</option>
                  {field.selectOptions.map((option, idx) => (
                    <option key={idx} value={idx}>
                      {option[field.selectLabel || 'label']}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.id}
                  type={field.type}
                  required={field.require}
                  autoComplete={field.autoComplete ? 'on' : 'off'}
                  value={form[field.id]}
                  onChange={handleChange}
                  className={styles.input}
                />
              )}
            </div>
          );
        })}
      </div>
      <button type="submit" className={styles.submitButton}>
        Enviar
      </button>
    </form>
  );
};

export default ReusableInputFields;
