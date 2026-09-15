import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Heart, Key, Sparkles, ArrowLeft } from 'lucide-react';

interface PrivacyGateProps {
  correctCode: string;
  onSuccess: () => void;
  brideName: string;
  groomName: string;
}

export const PrivacyGate: React.FC<PrivacyGateProps> = ({
  correctCode,
  onSuccess,
  brideName,
  groomName
}) => {
  const [inputCode, setInputCode] = useState('');
  const [hasError, setHasError] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim().toLowerCase() === correctCode.trim().toLowerCase()) {
      localStorage.setItem('wedding_unlocked', 'true');
      onSuccess();
    } else {
      setHasError(true);
      setTimeout(() => setHasError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-[#FAF6EE] via-[#F3EDE2] to-[#E9DEC9] text-[#3D2C1D]">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white/90 backdrop-blur-md border border-[#E2D6C5] shadow-2xl text-center space-y-6"
      >
        {/* Lock & Heart Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-[#FAF3E8] border border-[#E5DACB] flex items-center justify-center shadow-sm">
          <Lock className="w-9 h-9 text-[#8C6D4F]" />
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-xs">
            <Heart className="w-4 h-4 fill-current" />
          </div>
        </div>

        {/* Headline */}
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8C6D4F] font-semibold">
            המרחב הפרטי שלנו
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#3D2C1D] mt-1">
            זה האתר שלנו 🔐
          </h1>
          <p className="text-sm font-serif text-[#6E5B4B] mt-2">
            המסע של {groomName} & {brideName} לבניית הבית המשותף
          </p>
        </div>

        {/* Code Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-right">
            <label className="block text-xs font-semibold text-[#6E5B4B] mb-1.5">
              קוד כניסה פרטי:
            </label>
            <div className="relative">
              <input
                type="password"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="הקלידו את הקוד..."
                className={`w-full px-4 py-3 text-center text-lg font-mono tracking-widest rounded-2xl border transition-all ${
                  hasError
                    ? 'border-rose-500 bg-rose-50 text-rose-800'
                    : 'border-[#D5C6B3] bg-[#FAF7F2] focus:ring-2 focus:ring-amber-500/50 focus:outline-none'
                }`}
                autoFocus
              />
              <Key className="w-5 h-5 absolute right-3.5 top-3.5 text-gray-400 pointer-events-none" />
            </div>
            {hasError && (
              <p className="text-xs text-rose-600 mt-1.5 font-medium text-center">
                קוד לא נכון, נסו שוב
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#4A3728] to-[#5D4634] hover:from-[#3D2C1D] hover:to-[#4A3728] text-white font-semibold text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>כניסה לאתר שלנו</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>

        {/* Hint / Helper */}
        <div className="pt-2 border-t border-[#F0E6D8] text-xs text-[#8C7A6B]">
          {!showHint ? (
            <button
              type="button"
              onClick={() => setShowHint(true)}
              className="text-amber-800 underline hover:text-amber-900 cursor-pointer"
            >
              רמז לקוד הכניסה
            </button>
          ) : (
            <span className="bg-amber-50 text-amber-900 px-3 py-1 rounded-full border border-amber-200">
              קוד ברירת המחדל מוגדר ב-config כ: <strong className="font-mono">{correctCode}</strong>
            </span>
          )}
        </div>
      </motion.div>
    </div>
  );
};
