import React from 'react';
import PhoneInput2 from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  label,
  error
}) => {
  const handleChange = (value: string) => {
    // Eliminar todos los caracteres no numéricos excepto el +
    const cleanValue = value.replace(/[^\d+]/g, '');
    onChange(cleanValue);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="mt-1">
        <PhoneInput2
          country="ad"
          value={value}
          onChange={handleChange}
          enableSearch={true}
          searchPlaceholder="Buscar país..."
          inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          buttonClass="border border-gray-300 rounded-l-md"
          dropdownClass="bg-white border border-gray-300 rounded-md shadow-lg"
          searchClass="p-2 border-b"
          inputProps={{
            required: false,
            autoComplete: 'tel'
          }}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        Introduce tu número de teléfono con el código de país correspondiente
      </p>
    </div>
  );
};