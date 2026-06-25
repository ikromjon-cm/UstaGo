import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

const variants = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30",
  secondary:
    "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700",
  ghost:
    "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-lg shadow-red-500/25",
  outline:
    "border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-lg shadow-emerald-500/25",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-[10px]",
  md: "px-5 py-2.5 text-sm rounded-[12px]",
  lg: "px-6 py-3 text-base rounded-[14px]",
  xl: "px-8 py-4 text-lg rounded-[16px]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, icon, children, className = "", disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-all duration-200
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        focus-ring ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  )
);
Button.displayName = "Button";
