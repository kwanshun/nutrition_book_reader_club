import React from 'react';
import Image from 'next/image';

interface CalendarDayIconProps {
  dayOfMonth: number;
  hasShare?: boolean;
  hasFoodLog?: boolean;
  hasQuiz?: boolean;
  isCurrent?: boolean;
}

const CalendarDayIcon: React.FC<CalendarDayIconProps> = ({
  dayOfMonth,
  hasShare,
  hasFoodLog,
  hasQuiz,
  isCurrent,
}) => {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Day number with optional circle */}
      <div className="relative w-7 h-7 flex items-center justify-center">
        {/* Circle for text share */}
        {hasShare && (
          <div className="absolute inset-0 border-2 border-black rounded-full"></div>
        )}
        {/* Day number */}
        <span className={`z-10 text-sm font-medium ${isCurrent ? 'text-red-500' : 'text-gray-700'}`}>
          {dayOfMonth}
        </span>
      </div>

      {/* Activity icons below the number */}
      <div className="flex gap-0.5 items-center justify-center min-h-[14px]">
        {hasFoodLog && (
          <Image 
            src="/fish.png" 
            alt="Food" 
            width={12} 
            height={12} 
            className="object-contain"
          />
        )}
        {hasQuiz && (
          <Image 
            src="/tick.png" 
            alt="Quiz" 
            width={12} 
            height={12} 
            className="object-contain"
          />
        )}
      </div>
    </div>
  );
};

export default CalendarDayIcon;
