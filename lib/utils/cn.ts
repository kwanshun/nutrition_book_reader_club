import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Design system variants
export const variants = {
  button: {
    base: "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    variants: {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 shadow-sm hover:shadow-md",
      gradient: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-purple-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",
      ghost: "text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:ring-gray-500",
      outline: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
    },
    sizes: {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg"
    }
  },
  card: {
    base: "bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-200",
    variants: {
      default: "hover:shadow-md",
      gradient: "bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl",
      glass: "bg-white bg-opacity-80 backdrop-blur-sm border-white border-opacity-20 hover:bg-opacity-90"
    }
  }
}


