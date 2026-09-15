import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Mail, 
  Sparkles, 
  Check, 
  X, 
  Plus, 
  Send,
  Coffee,
  Moon,
  Clock
} from 'lucide-react';
import { MissYouLetter } from '../types';

interface MissYouSectionProps {
  initialLetters: MissYouLetter[];
  isDarkMode: boolean;
  brideName: string;
  groomName: string;
}

export const MissYouSection: React.FC<MissYouSectionProps> = ({
  initialLetters,
  isDarkMode,
  brideName,
  groomName
}) => {
  const [letters, setLetters] = useState<MissYouLetter[]>(() => {
    const saved = localStorage.getItem('wedding_custom_miss_letters');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialLetters;
      }
    }
    return initialLetters;
  });

  const [activeLetterId, setActiveLetterId] = useState<string>(letters[0]?.id || 'miss-busy');
  const [isOpenEnvelope, setIsOpenEnvelope] = useState(false);
  const [isAddingLetter, setIsAddingLetter] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPs, setNewPs] = useState('');

  const currentLetter = letters.find((l) => l.id === activeLetterId) || letters[0];

  const handleSelectLetter = (id: string) => {
    setActiveLetterId(id);
    setIsOpenEnvelope(false);
  };

  const handleAddLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newLetter: MissYouLetter = {
      id: `letter-${Date.now()}`,
      category: newCategory.trim() || 'הודעה מיוחדת',
      title: newTitle.trim(),
      excerpt: newTitle.trim(),
      content: newContent.trim(),
      ps: newPs.trim() || undefined
    };

    const updated = [...letters, newLetter];
    setLetters(updated);
    localStorage.setItem('wedding_custom_miss_letters', JSON.stringify(updated));
    setActiveLetterId(newLetter.id);

    setNewTitle('');
    setNewCategory('');
    setNewContent('');
    setNewPs('');
    setIsAddingLetter(false);
  };

  return (
    <div id="miss-you" className="w-full max-w-4xl mx-auto py-16 px-4 sm:px-6">
      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold mb-3 border border-rose-200/50">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span>מקום חם ללב</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[#3D2C1D] dark:text-[#F3EAD8] tracking-tight">
          לפתוח כשמתגעגעים
        </h2>
        <p className="text-sm sm:text-base text-[#6E5B4B] dark:text-gray-300 mt-2 font-serif italic">
          "גם ברגעים שאנחנו לא יחד, המילים האלה כאן כדי לחבק אותך."
        </p>
      </div>

      {/* Category Pills Selector */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {letters.map((letter) => (
          <button
            key={letter.id}
            onClick={() => handleSelectLetter(letter.id)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
              activeLetterId === letter.id
                ? 'bg-[#4A3728] text-white shadow-md scale-105'
                : 'bg-white dark:bg-gray-800 text-[#6B5A4B] dark:text-gray-300 border border-[#DACDBE] dark:border-gray-700 hover:bg-[#F7F2EA]'
            }`}
          >
            {letter.category}
          </button>
        ))}

        <button
          onClick={() => setIsAddingLetter(true)}
          className="p-2 rounded-full bg-white dark:bg-gray-800 text-amber-700 dark:text-amber-300 border border-dashed border-amber-400 hover:bg-amber-50 cursor-pointer"
          title="הוספת מכתב חדש"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Envelope & Letter */}
      <div className="relative max-w-xl mx-auto flex flex-col items-center">
        {!isOpenEnvelope ? (
          /* Sealed Luxury Wax Envelope */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="w-full p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#FFFDF9] to-[#F7EFE3] dark:from-[#212734] dark:to-[#191F2B] border-2 border-[#D8C6AE] dark:border-gray-700 shadow-xl text-center relative overflow-hidden"
          >
            {/* Wax Seal in Center */}
            <div className="relative my-4 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-rose-800 via-rose-700 to-rose-600 flex items-center justify-center shadow-lg border-2 border-rose-400/40 relative">
                <Heart className="w-9 h-9 fill-amber-200 text-amber-200 animate-soft-pulse" />
                {/* Wax drop border irregularity */}
                <div className="absolute -inset-1 rounded-full border border-rose-900/30 -z-10" />
              </div>
            </div>

            {/* Letter Title preview */}
            <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#3D2C1D] dark:text-white mt-4 mb-2">
              {currentLetter.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#7A6A5A] dark:text-gray-400 max-w-md mx-auto mb-6">
              {currentLetter.excerpt}
            </p>

            {/* The Main Action Button: ❤️ פתחי הודעה */}
            <button
              onClick={() => setIsOpenEnvelope(true)}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800 text-white font-semibold text-base shadow-lg hover:shadow-rose-600/30 hover:scale-105 transition-all duration-300 cursor-pointer border border-rose-400/30"
            >
              <Heart className="w-5 h-5 fill-current" />
              <span>פתחי הודעה אישית</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </button>
          </motion.div>
        ) : (
          /* Unfolded Parchment Love Letter */
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full p-6 sm:p-9 rounded-3xl bg-[#FFFDF9] dark:bg-[#1E2430] border-2 border-[#D8C6AE] dark:border-gray-700 shadow-2xl relative"
          >
            {/* Close / Fold back button */}
            <button
              onClick={() => setIsOpenEnvelope(false)}
              className="absolute top-4 left-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 cursor-pointer"
              title="סגירת המכתב"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Letter Header */}
            <div className="text-center border-b border-[#E5DACB] dark:border-gray-700 pb-4 mb-6">
              <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/50">
                {currentLetter.category}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#3D2C1D] dark:text-[#F3EAD8] mt-3">
                {currentLetter.title}
              </h3>
            </div>

            {/* Letter Body Text */}
            <div className="font-serif text-base sm:text-lg leading-relaxed text-[#4A3728] dark:text-gray-200 whitespace-pre-line space-y-4 px-2">
              {currentLetter.content}
            </div>

            {/* P.S. Note */}
            {currentLetter.ps && (
              <div className="mt-6 pt-4 border-t border-dashed border-[#E5DACB] dark:border-gray-700 text-sm font-serif italic text-rose-700 dark:text-rose-400">
                {currentLetter.ps}
              </div>
            )}

            {/* Signature */}
            <div className="mt-8 text-left pl-4 font-serif italic text-[#6E5B4B] dark:text-gray-300">
              שלך תמיד באהבה,
              <br />
              <span className="font-bold text-lg text-[#3D2C1D] dark:text-white">
                {groomName} & {brideName}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Add Custom Miss-You Letter Modal */}
      <AnimatePresence>
        {isAddingLetter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleAddLetter}
              className="relative max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl z-10 border border-[#E5DACB] dark:border-gray-700 space-y-4 text-right"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                <h3 className="font-bold text-lg font-serif text-[#4A3728] dark:text-white">
                  כתיבת מכתב אישי חדש
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddingLetter(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  קטגוריה / מתי לפתוח:
                </label>
                <input
                  type="text"
                  placeholder="למשל: כשמתחשק חיבוק"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-[#FAF7F2] dark:bg-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  כותרת המכתב:
                </label>
                <input
                  type="text"
                  placeholder="למשל: מילים חמות ליום ארוך"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-[#FAF7F2] dark:bg-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  תוכן המכתב המרגש:
                </label>
                <textarea
                  placeholder="כתבו מהלב..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-[#FAF7F2] dark:bg-gray-900 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  נ.ב. קטן בסוף (אופציונלי):
                </label>
                <input
                  type="text"
                  placeholder="למשל: נ.ב. מחכה לשיחת טלפון שלנו הערב"
                  value={newPs}
                  onChange={(e) => setNewPs(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-[#FAF7F2] dark:bg-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsAddingLetter(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>שמור מכתב</span>
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
