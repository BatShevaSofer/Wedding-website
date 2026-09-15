import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Gift, 
  Sparkles, 
  CheckCircle2, 
  Heart, 
  MessageCircle, 
  HelpCircle, 
  Smile, 
  Camera, 
  Link as LinkIcon, 
  Quote, 
  Save, 
  Share2,
  Calendar,
  Layers
} from 'lucide-react';
import { StepDay, SurpriseItem } from '../types';

interface StepDetailModalProps {
  step: StepDay | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  isToday: boolean;
  isCompleted: boolean;
  onMarkCompleted?: (day: number) => void;
}

export const StepDetailModal: React.FC<StepDetailModalProps> = ({
  step,
  isOpen,
  onClose,
  isDarkMode,
  isToday,
  isCompleted,
  onMarkCompleted
}) => {
  const [isSurpriseRevealed, setIsSurpriseRevealed] = useState(false);
  const [reflectionNote, setReflectionNote] = useState('');
  const [isNoteSaved, setIsNoteSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // Load stored reflection notes and likes from localStorage
  useEffect(() => {
    if (step && isOpen) {
      setIsSurpriseRevealed(false);
      const savedNote = localStorage.getItem(`wedding_note_day_${step.day}`) || '';
      setReflectionNote(savedNote);
      setIsNoteSaved(false);

      const savedLikes = parseInt(localStorage.getItem(`wedding_like_day_${step.day}`) || '0', 10);
      setLikesCount(savedLikes);
      setHasLiked(Boolean(localStorage.getItem(`wedding_user_liked_day_${step.day}`)));
    }
  }, [step, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !step) return null;

  const handleSaveNote = () => {
    localStorage.setItem(`wedding_note_day_${step.day}`, reflectionNote);
    setIsNoteSaved(true);
    setTimeout(() => setIsNoteSaved(false), 2500);
  };

  const handleToggleLike = () => {
    if (hasLiked) {
      const newCount = Math.max(0, likesCount - 1);
      setLikesCount(newCount);
      setHasLiked(false);
      localStorage.setItem(`wedding_like_day_${step.day}`, newCount.toString());
      localStorage.removeItem(`wedding_user_liked_day_${step.day}`);
    } else {
      const newCount = likesCount + 1;
      setLikesCount(newCount);
      setHasLiked(true);
      localStorage.setItem(`wedding_like_day_${step.day}`, newCount.toString());
      localStorage.setItem(`wedding_user_liked_day_${step.day}`, 'true');
    }
  };

  // Helper to render proper icon for surprise type
  const renderSurpriseIcon = (type: SurpriseItem['type']) => {
    switch (type) {
      case 'message': return <MessageCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'question': return <HelpCircle className="w-5 h-5 text-indigo-500" />;
      case 'mission': return <Sparkles className="w-5 h-5 text-emerald-500" />;
      case 'memory': return <Camera className="w-5 h-5 text-rose-500" />;
      case 'quote': return <Quote className="w-5 h-5 text-amber-500" />;
      case 'joke': return <Smile className="w-5 h-5 text-amber-500" />;
      case 'link': return <LinkIcon className="w-5 h-5 text-blue-500" />;
      default: return <Gift className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-sm">
        {/* Backdrop click to close */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-2xl max-h-[92vh] flex flex-col my-auto rounded-3xl overflow-hidden shadow-2xl z-10 bg-[#FAF7F2] dark:bg-[#1A202C] border border-[#E5DACB] dark:border-gray-700"
        >
          {/* Top Header Banner */}
          <div className="relative px-6 py-5 bg-gradient-to-r from-[#4A3728] via-[#5D4634] to-[#4A3728] text-[#FAF7F2] border-b border-[#8C6D4F]/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 font-serif font-bold text-lg">
                {step.day}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-amber-200/90 font-semibold">
                    {isToday ? "הצעד של היום 🌟" : `יום ${step.day} מתוך 40`}
                  </span>
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                      <CheckCircle2 className="w-3 h-3" />
                      הושלם
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                  {step.title}
                </h3>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="סגירה"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-[#3D2C1D] dark:text-gray-200">
            {/* House Part Building Banner */}
            <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-300/40 dark:border-amber-500/30">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                  מה נבנה היום בבית שלנו:
                </span>
                <p className="text-base font-bold text-[#4A3728] dark:text-amber-100 font-serif">
                  {step.housePartName}
                </p>
              </div>
            </div>

            {/* Daily Context Description */}
            <div className="space-y-2">
              <p className="text-base sm:text-lg leading-relaxed text-[#4A3728] dark:text-gray-200">
                {step.description}
              </p>
              {step.quote && (
                <div className="p-3.5 rounded-xl bg-[#F0EAE1] dark:bg-gray-800/60 border-r-4 border-amber-600 dark:border-amber-400 italic text-sm text-[#5A4634] dark:text-gray-300">
                  "{step.quote}"
                </div>
              )}
            </div>

            {/* Romantic Reflection / Question for Conversation */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800/80 border border-[#E8DFD1] dark:border-gray-700 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-sm">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                <span>שאלה לחשוב עליה / לשיחת הערב:</span>
              </div>
              <p className="text-base font-serif font-medium text-[#2E1F14] dark:text-[#F3EAD8] leading-relaxed">
                {step.romanticQuestion}
              </p>
            </div>

            {/* 🎁 SURPRISE COMPONENT */}
            {step.surprise && (
              <div className="relative overflow-hidden rounded-2xl border border-amber-300 dark:border-amber-600/50 bg-gradient-to-br from-[#FFF9EE] via-[#FFFDF9] to-[#FBF4E8] dark:from-[#212734] dark:via-[#1D222E] dark:to-[#181D27] p-5 shadow-sm">
                {!isSurpriseRevealed ? (
                  /* Unopened Surprise Card */
                  <div className="text-center py-4 flex flex-col items-center">
                    <motion.div 
                      animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-white shadow-lg mb-3"
                    >
                      <Gift className="w-8 h-8" />
                    </motion.div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 mb-1">
                      {step.surprise.badge || "הפתעה יומית מחכה לך!"}
                    </span>
                    <h4 className="text-lg font-bold font-serif text-[#4A3728] dark:text-white">
                      {step.surprise.title}
                    </h4>
                    <p className="text-sm text-[#7A6A5A] dark:text-gray-400 mb-4">
                      {step.surprise.teaser}
                    </p>

                    <button
                      onClick={() => setIsSurpriseRevealed(true)}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>לפתוח את ההפתעה 🎁</span>
                    </button>
                  </div>
                ) : (
                  /* Revealed Surprise Content */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-3.5"
                  >
                    <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-gray-700 pb-3">
                      <div className="flex items-center gap-2">
                        {renderSurpriseIcon(step.surprise.type)}
                        <span className="font-serif font-bold text-lg text-amber-900 dark:text-amber-300">
                          {step.surprise.title}
                        </span>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-800/40 text-amber-900 dark:text-amber-200 font-medium">
                        {step.surprise.badge || "הפתעה שנפתחה"}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-white/80 dark:bg-gray-800/90 border border-amber-100 dark:border-gray-700">
                      <p className="text-base leading-relaxed text-[#3D2C1D] dark:text-gray-200 whitespace-pre-line font-medium">
                        {step.surprise.content}
                      </p>
                      {step.surprise.secondaryText && (
                        <p className="mt-3 text-xs text-[#7A6A5A] dark:text-gray-400 italic">
                          {step.surprise.secondaryText}
                        </p>
                      )}
                    </div>

                    {step.surprise.actionLabel && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => {
                            if (onMarkCompleted) onMarkCompleted(step.day);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{step.surprise.actionLabel}</span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* Couple's Personal Reflection Notes (Stored in localStorage) */}
            <div className="p-4 rounded-2xl bg-[#F5EFE6]/60 dark:bg-gray-800/50 border border-[#E0D4C3] dark:border-gray-700 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#6B5744] dark:text-gray-300 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>המחשבות שלנו על הצעד הזה (נשמר באופן פרטי במכשיר):</span>
                </label>
                {isNoteSaved && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    נשמר!
                  </span>
                )}
              </div>

              <textarea
                value={reflectionNote}
                onChange={(e) => setReflectionNote(e.target.value)}
                placeholder="כתבו כאן משהו קטן שעלה לכם, זיכרון משותף או הבטחה קטנה..."
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white dark:bg-gray-900 border border-[#D5C6B3] dark:border-gray-700 text-[#3D2C1D] dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              />

              <div className="flex justify-end">
                <button
                  onClick={handleSaveNote}
                  className="px-3.5 py-1.5 rounded-lg bg-[#4A3728] hover:bg-[#5C4533] text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Save className="w-3 h-3" />
                  <span>שמור מחשבה</span>
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="px-6 py-4 bg-[#F2ECE1] dark:bg-[#161B24] border-t border-[#E5DACB] dark:border-gray-800 flex items-center justify-between">
            {/* Heart Reaction */}
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                hasLiked
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-300'
                  : 'bg-white dark:bg-gray-800 text-[#5A4634] dark:text-gray-300 border border-[#DCD0C0] hover:bg-rose-50'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{hasLiked ? 'אהבנו!' : 'שלח/י אהבה'}</span>
              {likesCount > 0 && <span className="text-xs opacity-80">({likesCount})</span>}
            </button>

            <div className="flex items-center gap-2">
              {onMarkCompleted && !isCompleted && (
                <button
                  onClick={() => {
                    onMarkCompleted(step.day);
                    onClose();
                  }}
                  className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>סימון כהושלם ✓</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-5 py-2 rounded-full bg-[#4A3728] hover:bg-[#3D2C1D] text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                סגור
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
