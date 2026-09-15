import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Heart, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Home, 
  Calendar, 
  Camera, 
  Mail,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  brideName: string;
  groomName: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentDay: number;
  onSimulateDayChange: (day: number) => void;
  onOpenFinalePreview: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  brideName,
  groomName,
  isDarkMode,
  onToggleDarkMode,
  currentDay,
  onSimulateDayChange,
  onOpenFinalePreview
}) => {
  const [showSimControls, setShowSimControls] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#FAF7F2]/90 dark:bg-[#1A202C]/90 border-b border-[#E5DACB] dark:border-gray-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Names */}
        <a href="#hero" className="flex items-center gap-2 select-none group">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-600 flex items-center justify-center text-amber-800 dark:text-amber-300 group-hover:scale-110 transition-transform">
            <Heart className="w-4 h-4 fill-current" />
          </div>
          <div className="flex flex-col text-right">
            <span className="font-serif font-bold text-base sm:text-lg text-[#3D2C1D] dark:text-[#F3EAD8] leading-tight">
              {groomName} & {brideName}
            </span>
            <span className="text-[10px] text-[#8C7A6B] dark:text-gray-400 font-sans tracking-wide">
              40 צעדים לבית שלנו
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#6B5A4B] dark:text-gray-300">
          <a href="#hero" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
            הבית והספירה
          </a>
          <a href="#steps-timeline" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
            40 הצעדים
          </a>
          <a href="#our-story" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
            הסיפור שלנו
          </a>
          <a href="#gallery" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
            הגלריה
          </a>
          <a href="#miss-you" className="hover:text-amber-700 dark:hover:text-amber-400 transition-colors">
            כשמתגעגעים
          </a>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Day Simulation / Testing Dropdown Button */}
          <button
            onClick={() => setShowSimControls(!showSimControls)}
            title="בקרת הדמיית ימים לבדיקה"
            className={`p-2 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showSimControls
                ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border-amber-400'
                : 'bg-white/80 dark:bg-gray-800 text-[#6B5A4B] dark:text-gray-300 border-[#DACDBE] dark:border-gray-700 hover:bg-amber-50'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">יום {currentDay}</span>
          </button>

          {/* Wedding Day Finale Preview Button */}
          <button
            onClick={onOpenFinalePreview}
            title="צפייה מוקדמת במסך יום החתונה"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm cursor-pointer hover:scale-105 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>יום החתונה</span>
          </button>

          {/* Dark / Night Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-full bg-white/80 dark:bg-gray-800 text-[#6B5A4B] dark:text-amber-300 border border-[#DACDBE] dark:border-gray-700 hover:bg-amber-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            aria-label="החלפת מצב יום/לילה"
            title={isDarkMode ? 'מעבר למצב יום' : 'מעבר למצב לילה עם כוכבים'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#6B5A4B]" />}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-white/80 dark:bg-gray-800 text-[#6B5A4B] dark:text-gray-300 border border-[#DACDBE] dark:border-gray-700 cursor-pointer"
            aria-label="תפריט"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Floating Simulation Controls Panel */}
      {showSimControls && (
        <div className="border-t border-amber-200 dark:border-gray-700 bg-[#FFFDF9] dark:bg-[#1E2430] px-4 py-3 shadow-inner">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#4A3728] dark:text-amber-300">
                הדמיית שלב בבניית הבית (בדיקה וסימולציה):
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 font-mono font-bold text-amber-900 dark:text-amber-200">
                {currentDay === 0 ? 'יום 0 - יום החתונה' : `יום ${currentDay} עד החתונה`}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="range"
                min="0"
                max="40"
                value={40 - currentDay}
                onChange={(e) => onSimulateDayChange(40 - parseInt(e.target.value, 10))}
                className="w-full sm:w-48 accent-amber-600 cursor-pointer"
              />
              
              <button
                onClick={() => onSimulateDayChange(0)}
                className="px-2.5 py-1 rounded-md bg-rose-600 text-white font-semibold hover:bg-rose-700 cursor-pointer"
              >
                יום החתונה (0)
              </button>
              
              <button
                onClick={() => onSimulateDayChange(40)}
                className="px-2.5 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 cursor-pointer"
              >
                התחלה (40)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5DACB] dark:border-gray-800 bg-[#FAF7F2] dark:bg-[#1A202C] px-6 py-4 space-y-3 font-medium text-[#4A3728] dark:text-gray-200">
          <a 
            href="#hero" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-[#EFE7DC] dark:border-gray-800"
          >
            🏡 הבית והספירה
          </a>
          <a 
            href="#steps-timeline" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-[#EFE7DC] dark:border-gray-800"
          >
            📅 40 הצעדים
          </a>
          <a 
            href="#our-story" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-[#EFE7DC] dark:border-gray-800"
          >
            💑 הסיפור שלנו
          </a>
          <a 
            href="#gallery" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-[#EFE7DC] dark:border-gray-800"
          >
            📸 הגלריה
          </a>
          <a 
            href="#miss-you" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-[#EFE7DC] dark:border-gray-800"
          >
            💌 כשמתגעגעים
          </a>

          <div className="pt-2 flex justify-between items-center">
            <button
              onClick={() => {
                onOpenFinalePreview();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>צפייה במסך יום החתונה 💒</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
