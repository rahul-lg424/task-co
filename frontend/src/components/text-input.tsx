import type { ChangeEvent } from 'react';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
}

// Small labeled input shared by the auth pages. Renders red helper text under
// the field when `error` is set.
export const TextInput = ({
  label,
  value,
  onChange,
  type = 'text',
  error,
  placeholder,
  autoComplete,
}: TextInputProps) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-900">{label}</label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      autoComplete={autoComplete}
      onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
      className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-400' : 'border-gray-300'
      }`}
    />
    {error ? <p className="text-red-600 text-sm">{error}</p> : null}
  </div>
);
