import type { ReactNode } from 'react';

type AuthInputProps = {
  id: string;
  label: string;
  placeholder: string;
  type?: 'email' | 'text' | 'password';
  action?: ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  errorMessage?: string;
  successMessage?: string;
  maskCharacter?: string;
};

export function AuthInput({
  id,
  label,
  placeholder,
  type = 'text',
  action,
  value,
  onChange,
  onBlur,
  onFocus,
  errorMessage,
  successMessage,
  maskCharacter,
}: AuthInputProps) {
  const displayValue =
    maskCharacter && value !== undefined ? maskCharacter.repeat(value.length) : value;

  const handleChange = (nextDisplayValue: string) => {
    if (!onChange) {
      return;
    }

    if (!maskCharacter || value === undefined) {
      onChange(nextDisplayValue);
      return;
    }

    if (nextDisplayValue.length < value.length) {
      onChange(value.slice(0, nextDisplayValue.length));
      return;
    }

    if (nextDisplayValue.length > value.length) {
      onChange(value + nextDisplayValue.slice(value.length));
    }
  };

  return (
    <label className="input-group" htmlFor={id}>
      <span className="input-label">{label}</span>
      <span className="input-frame">
        <input
          className={`input ${action ? 'input--with-action' : ''} ${
            errorMessage ? 'input--error' : ''
          } ${successMessage ? 'input--success' : ''} ${maskCharacter ? 'input--masked' : ''}`}
          id={id}
          name={id}
          onBlur={onBlur}
          onChange={onChange ? (event) => handleChange(event.target.value) : undefined}
          onFocus={onFocus}
          placeholder={placeholder}
          type={maskCharacter ? 'text' : type}
          value={displayValue}
        />
        {action}
      </span>
      {errorMessage && <span className="field-message text-error">{errorMessage}</span>}
      {successMessage && <span className="field-message text-success">{successMessage}</span>}
    </label>
  );
}
