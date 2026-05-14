// components/Input.tsx
import { forwardRef } from 'react';

interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, type = "text", value, onChange, placeholder }, ref) => {
    return (
      <div className="flex flex-col space-y-1">
        <label className="text-sm font-medium text-gray-600">{label}</label>
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl border border-sky-200 bg-white focus:bg-white focus:border-sky-400 focus:ring-2 focus:ring-sky-200 outline-none transition-all duration-200 text-gray-800 placeholder-gray-400"
        />
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;