import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, Heart } from 'lucide-react';

interface CountdownTimerProps {
  weddingDate: string; // ISO date string
  countdownTitle?: string;
  countdownSubtitle?: string;
  heroQuote?: string;
  onOpenTodayStep: () => void;
  onCelebrateWedding?: () => void;
  isDarkMode: boolean;
  forcedDaysLeft?: number | null; // For preview/simulation
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  weddingDate,
  countdownTitle = "עוד 40 ימים...",
  countdownSubtitle = "עד שמתחילים לבנות את הבית שלנו באמת",
  heroQuote = "כל יום מקרב אותנו עוד קצת.",
  onOpenTodayStep,
  onCelebrateWedding,
  isDarkMode,
  forcedDaysLeft = null,
}) => {
  const [time, setTime] = useState<TimeRemaining>({
    days: 40,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isComplete: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      // If a forced simulated day is provided (e.g. user is previewing day 25 or day 0)
      if (forcedDaysLeft !== null) {
        setTime({
          days: Math.max(0, forcedDaysLeft),
          hours: forcedDaysLeft === 0 ? 0 : 14,
          minutes: forcedDaysLeft === 0 ? 0 : 28,
          seconds: forcedDaysLeft === 0 ? 0 : 45,
          isComplete: forcedDaysLeft <= 0,
        });
        return;
      }

      const target = new Date(weddingDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTime({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isComplete: true,
        });
        if (onCelebrateWedding) {
          onCelebrateWedding();
        }
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTime({
        days,
        hours,
        minutes,
        seconds,
        isComplete: false,
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [weddingDate, forcedDaysLeft, onCelebrateWedding]);

  // Format with leading zero
  const pad = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="w-full text-center flex flex-col items-center py-2 px-4">
      {/* Title above */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-1"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold tracking-wide uppercase mb-2 border border-amber-300/40 dark:border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>{time.isComplete ? "היום הגדול הגיע!" : (countdownTitle || `עוד ${time.days} ימים...`)}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-[#3D2C1D] dark:text-[#F3EAD8] tracking-tight">
          {time.isComplete ? "הגענו הביתה ❤️" : countdownSubtitle}
        </h2>
      </motion.div>

      {/* Countdown Digits Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="my-5 w-full max-w-lg"
      >
        <div className="grid grid-cols-4 gap-2 sm:gap-4 p-3 sm:p-5 rounded-2xl bg-white/70 dark:bg-[#1E2430]/80 backdrop-blur-md border border-[#E5DACB] dark:border-[#384152] shadow-sm">
          {/* Days */}
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl bg-[#F8F4EE] dark:bg-[#161B24] border border-[#E8DFD1]/60 dark:border-gray-800">
            <span className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-serif text-[#4A3728] dark:text-amber-300 tabular-nums">
              {pad(time.days)}
            </span>
            <span className="text-xs sm:text-sm text-[#7A6A5A] dark:text-gray-400 font-medium mt-1">
              ימים
            </span>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl bg-[#F8F4EE] dark:bg-[#161B24] border border-[#E8DFD1]/60 dark:border-gray-800">
            <span className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-serif text-[#4A3728] dark:text-amber-300 tabular-nums">
              {pad(time.hours)}
            </span>
            <span className="text-xs sm:text-sm text-[#7A6A5A] dark:text-gray-400 font-medium mt-1">
              שעות
            </span>
          </div>

          {/* Minutes */}
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl bg-[#F8F4EE] dark:bg-[#161B24] border border-[#E8DFD1]/60 dark:border-gray-800">
            <span className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-serif text-[#4A3728] dark:text-amber-300 tabular-nums">
              {pad(time.minutes)}
            </span>
            <span className="text-xs sm:text-sm text-[#7A6A5A] dark:text-gray-400 font-medium mt-1">
              דקות
            </span>
          </div>

          {/* Seconds */}
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl bg-[#F8F4EE] dark:bg-[#161B24] border border-[#E8DFD1]/60 dark:border-gray-800 relative overflow-hidden">
            <span className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-serif text-[#B45309] dark:text-amber-400 tabular-nums">
              {pad(time.seconds)}
            </span>
            <span className="text-xs sm:text-sm text-[#7A6A5A] dark:text-gray-400 font-medium mt-1">
              שניות
            </span>
            {/* Subtle live tick indicator bar */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500/50 transition-all duration-1000"
              style={{ width: `${((60 - time.seconds) / 60) * 100}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Quote beneath countdown */}
      <p className="text-sm sm:text-base text-[#6B5A4B] dark:text-gray-300 font-serif italic mb-5">
        "{heroQuote}"
      </p>

      {/* Primary Action Button: "לפתוח את הצעד של היום ←" */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={onOpenTodayStep}
        className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 sm:px-8 sm:py-4 rounded-full bg-gradient-to-r from-[#4A3728] via-[#5C4533] to-[#4A3728] text-[#FAF7F2] font-semibold text-base sm:text-lg shadow-md hover:shadow-xl transition-all duration-300 border border-[#8C6D4F]/40 cursor-pointer"
        aria-label="לפתוח את הצעד של היום"
      >
        <span className="relative z-10">לפתוח את הצעד של היום</span>
        <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1 text-amber-300" />
        
        {/* Button ambient glow overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 via-transparent to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.button>
    </div>
  );
};
