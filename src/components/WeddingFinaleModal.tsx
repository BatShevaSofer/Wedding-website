import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, X, Home, Calendar, MapPin } from 'lucide-react';
import { WeddingConfig } from '../types';

interface WeddingFinaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WeddingConfig;
  isDarkMode: boolean;
}

export const WeddingFinaleModal: React.FC<WeddingFinaleModalProps> = ({
  isOpen,
  onClose,
  config,
  isDarkMode
}) => {
  useEffect(() => {
    if (isOpen) {
      // Gentle gold and cream confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#F59E0B', '#FDF6E2', '#E2D4C0', '#F43F5E']
        });

        const timeout = setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#D4AF37', '#FBBF24', '#FDF6E2']
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#D4AF37', '#FBBF24', '#FDF6E2']
          });
        }, 500);

        return () => clearTimeout(timeout);
      } catch (err) {
        console.error(err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Format wedding date for display (e.g. 25.10.2026)
  const formattedDate = new Date(config.weddingDate).toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative max-w-lg w-full p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF6F0] to-[#F5EFE6] dark:from-[#1E2430] dark:via-[#191E28] dark:to-[#141820] border-2 border-amber-400 dark:border-amber-500/60 shadow-2xl z-10 text-center space-y-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Golden Celebration Icon */}
          <div className="relative mx-auto w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-amber-200 flex items-center justify-center shadow-lg border-2 border-amber-300">
            <Home className="w-12 h-12 text-amber-900 animate-soft-pulse" />
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-sm">
              <Heart className="w-4 h-4 fill-current" />
            </div>
          </div>

          {/* Main Celebration Headline */}
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-700 dark:text-amber-400 font-semibold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300/60">
              הושלמו כל 40 הצעדים
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold font-serif text-[#3D2C1D] dark:text-[#FAF4EB] mt-3">
              הגענו הביתה ❤️
            </h2>

            <p className="text-sm sm:text-base font-serif italic text-amber-800 dark:text-amber-300 mt-2">
              ״עוֹד יִשָּׁמַע בְּעָרֵי יְהוּדָה וּבְחוּצוֹת יְרוּשָׁלַיִם, קוֹל שָׂשׂוֹן וְקוֹל שִׂמְחָה, קוֹל חָתָן וְקוֹל כַּלָּה״
            </p>
          </div>

          {/* Wedding Details Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-gray-800/90 border border-[#E5DACB] dark:border-gray-700 shadow-sm space-y-2 text-sm text-[#4A3728] dark:text-gray-200">
            <div className="flex items-center justify-center gap-2 font-serif font-bold text-lg text-amber-900 dark:text-amber-200">
              <span>{config.groomName}</span>
              <span>&</span>
              <span>{config.brideName}</span>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs sm:text-sm text-[#7A6A5A] dark:text-gray-400 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-amber-600" />
                {formattedDate} | {config.weddingTime}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-amber-600" />
                {config.weddingHallName}
              </span>
            </div>
          </div>

          {/* Heartfelt blessing */}
          <p className="text-sm sm:text-base leading-relaxed text-[#5A4634] dark:text-gray-300 font-serif px-2">
            הבית המשותף שלנו עומד כעת מלא אור, אהבה, ברכה ושלום.
            <br />
            שתמיד נמשיך לבנות, להקשיב, לשמוח ולצמוח יחד בכל צעד וצעד.
          </p>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-base shadow-md cursor-pointer transition-all"
            >
              תודה על המסע המרגש ✨
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
