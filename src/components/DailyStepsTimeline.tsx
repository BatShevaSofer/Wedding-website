import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  ChevronDown, 
  Layers, 
  Gift, 
  Unlock,
  Filter,
  Eye
} from 'lucide-react';
import { StepDay } from '../types';

interface DailyStepsTimelineProps {
  steps: StepDay[];
  currentDay: number; // 40 down to 0
  onSelectStep: (step: StepDay) => void;
  completedDays: number[];
  isDarkMode: boolean;
  unlockAllPreview: boolean;
  onToggleUnlockAll: () => void;
}

export const DailyStepsTimeline: React.FC<DailyStepsTimelineProps> = ({
  steps,
  currentDay,
  onSelectStep,
  completedDays,
  isDarkMode,
  unlockAllPreview,
  onToggleUnlockAll
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'unlocked' | 'surprises'>('all');

  // Filter steps based on selected tab
  const filteredSteps = steps.filter((step) => {
    const isUnlocked = unlockAllPreview || step.day >= currentDay;
    if (filterMode === 'unlocked') {
      return isUnlocked;
    }
    if (filterMode === 'surprises') {
      return Boolean(step.surprise);
    }
    return true;
  });

  // Helper function to render phase badge
  const getPhaseColor = (phase: StepDay['phase']) => {
    switch (phase) {
      case 'foundation': return 'text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-900/30 border-amber-300/60';
      case 'walls': return 'text-stone-800 dark:text-stone-300 bg-stone-100/70 dark:bg-stone-900/30 border-stone-300/60';
      case 'windows': return 'text-sky-800 dark:text-sky-300 bg-sky-100/70 dark:bg-sky-900/30 border-sky-300/60';
      case 'door': return 'text-orange-800 dark:text-orange-300 bg-orange-100/70 dark:bg-orange-900/30 border-orange-300/60';
      case 'roof': return 'text-red-800 dark:text-red-300 bg-red-100/70 dark:bg-red-900/30 border-red-300/60';
      case 'interior': return 'text-yellow-800 dark:text-yellow-300 bg-yellow-100/70 dark:bg-yellow-900/30 border-yellow-300/60';
      case 'garden': return 'text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/30 border-emerald-300/60';
      case 'wedding': return 'text-purple-800 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-900/30 border-purple-300/60';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  return (
    <div id="steps-timeline" className="w-full max-w-5xl mx-auto py-12 px-4 sm:px-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b border-[#E5DACB] dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>המסע היומי לבניית הבית</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#3D2C1D] dark:text-[#F3EAD8]">
            מערכת 40 הצעדים שלנו
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6A5A] dark:text-gray-400 mt-1">
            בכל יום נפתח צעד נוסף, עד שהבית יהיה מושלם ביום החתונה.
          </p>
        </div>

        {/* Filters and Preview Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-xl bg-[#EDE6DC] dark:bg-gray-800 border border-[#DACDBE] dark:border-gray-700 text-xs font-medium">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-gray-900 text-[#3D2C1D] dark:text-white shadow-xs font-semibold'
                  : 'text-[#6A5A4A] dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              כל 40 הצעדים
            </button>
            <button
              onClick={() => setFilterMode('unlocked')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filterMode === 'unlocked'
                  ? 'bg-white dark:bg-gray-900 text-[#3D2C1D] dark:text-white shadow-xs font-semibold'
                  : 'text-[#6A5A4A] dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              פתוחים עד כה
            </button>
            <button
              onClick={() => setFilterMode('surprises')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                filterMode === 'surprises'
                  ? 'bg-white dark:bg-gray-900 text-[#3D2C1D] dark:text-white shadow-xs font-semibold'
                  : 'text-[#6A5A4A] dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Gift className="w-3 h-3 text-amber-500" />
              עם הפתעה
            </button>
          </div>

          {/* Test / Preview Toggle */}
          <button
            onClick={onToggleUnlockAll}
            title="מצב צפייה מקדימה בכל הצעדים"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              unlockAllPreview
                ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                : 'bg-white/80 dark:bg-gray-800 text-[#6A5A4A] dark:text-gray-300 border-[#DACDBE] dark:border-gray-700 hover:bg-amber-50'
            }`}
          >
            {unlockAllPreview ? <Unlock className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{unlockAllPreview ? 'נעילת ימים עתידיים' : 'פתח הכל לבדיקה'}</span>
          </button>
        </div>
      </div>

      {/* Grid of 40 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSteps.map((step) => {
          // Check step status:
          // Note: Days count down 40 -> 0.
          // Today's step is when step.day === currentDay.
          // Completed steps are when step.day > currentDay (or in completedDays list).
          // Future steps are when step.day < currentDay.
          const isToday = step.day === currentDay;
          const isPast = step.day > currentDay || completedDays.includes(step.day);
          const isLocked = !unlockAllPreview && step.day < currentDay;

          return (
            <motion.div
              key={step.day}
              whileHover={!isLocked ? { y: -4, transition: { duration: 0.2 } } : undefined}
              onClick={() => {
                if (!isLocked) {
                  onSelectStep(step);
                }
              }}
              className={`relative rounded-2xl p-4.5 flex flex-col justify-between border transition-all select-none ${
                isLocked
                  ? 'bg-[#F2ECE1]/50 dark:bg-gray-800/30 border-[#E2D7C7]/50 dark:border-gray-800 opacity-65 cursor-not-allowed'
                  : isToday
                  ? 'bg-white dark:bg-gray-800 border-amber-400 dark:border-amber-500 shadow-lg shadow-amber-500/15 cursor-pointer ring-2 ring-amber-400/40 dark:ring-amber-500/30'
                  : 'bg-white/90 dark:bg-gray-800/90 border-[#E2D8C9] dark:border-gray-700 shadow-xs hover:shadow-md cursor-pointer hover:border-amber-300'
              }`}
            >
              {/* Card Top: Day number + Phase Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-sm ${
                    isToday 
                      ? 'bg-amber-600 text-white shadow-xs' 
                      : isPast 
                      ? 'bg-[#EADECE] dark:bg-gray-700 text-[#4A3728] dark:text-gray-200' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {step.day}
                  </span>
                  <span className="text-xs font-semibold text-[#6E5B4B] dark:text-gray-400">
                    {step.day === 0 ? "יום החתונה" : `יום ${step.day}`}
                  </span>
                </div>

                {/* Status Indicator */}
                {isLocked ? (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/60 px-2 py-0.5 rounded-full">
                    <Lock className="w-3 h-3" />
                    <span>נעול</span>
                  </div>
                ) : isToday ? (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-full border border-amber-300/80 animate-pulse">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>היום!</span>
                  </div>
                ) : isPast ? (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>הושלם</span>
                  </div>
                ) : null}
              </div>

              {/* Card Middle: Title & House Part */}
              <div className="my-1">
                <h4 className="text-base font-bold font-serif text-[#3D2C1D] dark:text-[#F3EAD8] leading-tight mb-1">
                  {step.title}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-[#7A6A5A] dark:text-gray-400 font-medium">
                  <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <span className="truncate">{step.housePartName}</span>
                </div>
              </div>

              {/* Card Bottom: Subtitle / Surprise tag */}
              <div className="mt-3 pt-2.5 border-t border-[#EFE7DC] dark:border-gray-700/60 flex items-center justify-between text-xs">
                <span className="text-[#8C7A6B] dark:text-gray-400 truncate max-w-[140px]">
                  {step.subtitle}
                </span>

                {step.surprise && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-medium text-[11px] border border-amber-200/60 dark:border-amber-700/40">
                    <Gift className="w-3 h-3 text-amber-600" />
                    <span>הפתעה</span>
                  </span>
                )}
              </div>

              {/* Subtle glowing halo on today's card */}
              {isToday && (
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 -z-10 blur-[3px] opacity-40" />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
