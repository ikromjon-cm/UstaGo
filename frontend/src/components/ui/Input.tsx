import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-white dark:bg-gray-800/50
            border border-gray-200 dark:border-gray-700
            text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500
            px-4 py-2.5 rounded-[12px] text-sm
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${icon ? "pl-10" : ""}
            ${error ? "border-red-500 focus:ring-red-500" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

export const PhoneInput = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => (
    <Input ref={ref} {...props} placeholder="+998 XX XXX XX XX" />
  )
);
PhoneInput.displayName = "PhoneInput";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }
>(({ label, error, className = "", ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
    )}
    <textarea
      ref={ref}
      className={`
        w-full bg-white dark:bg-gray-800/50
        border border-gray-200 dark:border-gray-700
        text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500
        px-4 py-2.5 rounded-[12px] text-sm
        transition-all duration-200 resize-none
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${error ? "border-red-500 focus:ring-red-500" : ""}
        ${className}
      `}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
));
Textarea.displayName = "Textarea";

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }
>(({ label, error, children, className = "", ...props }, ref) => (
  <div className="w-full">
    {label && (
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
    )}
    <select
      ref={ref}
      className={`
        w-full bg-white dark:bg-gray-800/50
        border border-gray-200 dark:border-gray-700
        text-gray-900 dark:text-gray-100
        px-4 py-2.5 rounded-[12px] text-sm
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${error ? "border-red-500 focus:ring-red-500" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
));
Select.displayName = "Select";
