"use client";

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface FeatureCardProps {
  href: string;
  icon: string;
  label: string;
  description?: string;
  gradient?: string;
  variant?: 'default' | 'gradient' | 'glass';
  className?: string;
}

export default function FeatureCard({ 
  href, 
  icon, 
  label, 
  description,
  gradient = 'from-blue-500 to-purple-600',
  variant = 'gradient',
  className
}: FeatureCardProps) {
  const cardVariants = {
    default: "bg-gray-50 hover:bg-gray-100 border border-gray-200",
    gradient: "bg-gray-50 hover:bg-gray-100 border border-gray-200",
    glass: "bg-gray-50 hover:bg-gray-100 border border-gray-200"
  };

  return (
    <Link
      href={href}
      className={cn(
        "group relative overflow-hidden rounded-lg p-4 flex flex-col items-center justify-center gap-3 transition-all duration-200 aspect-square",
        cardVariants[variant],
        className
      )}
    >
        
        {/* Content */}
        <div className="relative z-10 text-center">
                 <div className="w-12 h-12 mb-2 mx-auto flex items-center justify-center">
                   {icon.endsWith('.jpg') || icon.endsWith('.svg') ? (
                     <img 
                       src={icon} 
                       alt={label} 
                       className="w-10 h-10"
                       style={{ display: 'block' }}
                     />
                   ) : (
                     <span className="text-4xl">{icon}</span>
                   )}
                 </div>
          <h3 className="font-medium text-gray-900 mb-1 text-xs">
            {label}
          </h3>
          {description && (
            <p className="text-xs text-gray-500">
              {description}
            </p>
          )}
        </div>
    </Link>
  );
}

