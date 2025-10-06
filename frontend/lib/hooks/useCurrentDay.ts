// Current Day Calculation Hook
'use client';

import { useState, useEffect } from 'react';

export const useCurrentDay = () => {
  const [currentDay, setCurrentDay] = useState<number | null>(null);
  const [todayDay, setTodayDay] = useState(1);

  useEffect(() => {
    console.log('🔍 useCurrentDay: Calculating current day');
    
    // Calculate current day based on first day of current month as start date
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    
    // Calculate days since first day of month
    const daysSinceStart = Math.floor((today.getTime() - firstDayOfMonth.getTime()) / (1000 * 60 * 60 * 24));
    
    // Current day is days since start + 1 (1-based indexing)
    // Cap at 21 days maximum
    const calculatedDay = Math.min(daysSinceStart + 1, 21);
    
    console.log('🔍 useCurrentDay: today =', today.toISOString());
    console.log('🔍 useCurrentDay: currentMonth =', currentMonth);
    console.log('🔍 useCurrentDay: currentYear =', currentYear);
    console.log('🔍 useCurrentDay: firstDayOfMonth =', firstDayOfMonth.toISOString());
    console.log('🔍 useCurrentDay: daysSinceStart =', daysSinceStart);
    console.log('🔍 useCurrentDay: calculatedDay =', calculatedDay);
    
    setCurrentDay(calculatedDay);
    setTodayDay(calculatedDay);
  }, []);

  return { currentDay, todayDay };
};
