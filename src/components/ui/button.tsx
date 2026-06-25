import React from 'react';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
}
export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants: Record<string, string> = {
    default:     'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    outline:     'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-green-500',
    ghost:       'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    link:        'bg-transparent text-green-600 underline hover:text-green-800 focus:ring-green-500 p-0 h-auto',
  };
  const sizes: Record<string, string> = {
    default: 'h-10 px-4 py-2 text-sm',
    sm:      'h-8 px-3 py-1 text-xs',
    lg:      'h-12 px-6 py-3 text-base',
    icon:    'h-10 w-10 p-0',
  };
  const sizeClass = sizes[size] ?? sizes['default'];
  return (
    <button
      className={`${baseStyles} ${variants[variant] ?? variants['default']} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};




