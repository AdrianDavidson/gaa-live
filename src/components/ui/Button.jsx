export default function Button({ children, onClick, variant = 'primary', className = '', ...props }) {
  const base = 'min-h-[48px] px-4 py-2 rounded-lg font-bold text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
  const variants = {
    primary:   'bg-gaa-green text-white hover:bg-green-800 focus-visible:ring-gaa-green',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus-visible:ring-gray-400',
    danger:    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
  }
  return (
    <button
      onClick={onClick}
      className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
