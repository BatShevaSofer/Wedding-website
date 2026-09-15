import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Coffee, 
  Gem, 
  Home, 
  Calendar, 
  MapPin, 
  Plus, 
  Check, 
  X 
} from 'lucide-react';
import { MilestoneStory } from '../types';

interface OurStorySectionProps {
  milestones: MilestoneStory[];
  isDarkMode: boolean;
}

export const OurStorySection: React.FC<OurStorySectionProps> = ({
  milestones: initialMilestones,
  isDarkMode
}) => {
  const [milestones, setMilestones] = useState<MilestoneStory[]>(() => {
    const saved = localStorage.getItem('wedding_custom_milestones');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialMilestones;
      }
    }
    return initialMilestones;
  });

  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    const newEntry: MilestoneStory = {
      id: `milestone-${Date.now()}`,
      title: newTitle.trim(),
      date: newDate.trim() || 'רגע מיוחד',
      description: newDescription.trim(),
      location: newLocation.trim() || undefined,
      icon: 'Heart'
    };

    const updated = [...milestones, newEntry];
    setMilestones(updated);
    localStorage.setItem('wedding_custom_milestones', JSON.stringify(updated));

    setNewTitle('');
    setNewDate('');
    setNewDescription('');
    setNewLocation('');
    setIsAddingMilestone(false);
  };

  const getMilestoneIcon = (icon: string) => {
    switch (icon) {
      case 'Coffee': return <Coffee className="w-5 h-5 text-amber-700 dark:text-amber-300" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Gem': return <Gem className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'Home': return <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      default: return <Heart className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <div id="our-story" className="w-full max-w-4xl mx-auto py-16 px-4 sm:px-6">
      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-semibold mb-3 border border-amber-300/30">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>הסיפור המשותף שלנו</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold font-serif text-[#3D2C1D] dark:text-[#F3EAD8] tracking-tight">
          איך הגענו עד לכאן?
        </h2>
        <p className="text-sm sm:text-base text-[#6E5B4B] dark:text-gray-300 mt-2 font-serif italic">
          "היופי שבדרך הוא לזכור את כל הרגעים הקטנים שהפכו אותנו למי שאנחנו היום."
        </p>
      </div>

      {/* Story Timeline with Central Stem */}
      <div className="relative">
        {/* Central Connecting Line */}
        <div className="absolute right-6 sm:right-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600/40 dark:from-amber-600 dark:via-amber-500 dark:to-amber-400/20 transform sm:translate-x-1/2" />

        {/* Milestone Items */}
        <div className="space-y-8 sm:space-y-12">
          {milestones.map((item, index) => {
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col sm:flex-row items-start sm:items-center ${
                  isEven ? 'sm:flex-row-reverse' : ''
                }`}
              >
                {/* Milestone Node Icon on the line */}
                <div className="absolute right-6 sm:right-1/2 transform translate-x-1/2 z-10 w-12 h-12 rounded-full bg-[#FAF7F2] dark:bg-[#1A202C] border-2 border-amber-500 dark:border-amber-400 flex items-center justify-center shadow-md">
                  {getMilestoneIcon(item.icon)}
                </div>

                {/* Content Box */}
                <div className="pr-16 sm:pr-0 sm:w-1/2 sm:px-8 w-full">
                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-gray-800 border border-[#E5DACB] dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    {/* Date & Location */}
                    <div className="flex items-center gap-3 text-xs text-[#8C7A6B] dark:text-gray-400 font-semibold mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        {item.date}
                      </span>
                      {item.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          {item.location}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold font-serif text-[#3D2C1D] dark:text-[#F3EAD8] mb-2">
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-[#5A4634] dark:text-gray-300">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Empty spacer for the alternating layout on desktop */}
                <div className="hidden sm:block sm:w-1/2" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add Custom Milestone Button & Form */}
      <div className="mt-12 text-center">
        {!isAddingMilestone ? (
          <button
            onClick={() => setIsAddingMilestone(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-gray-800 hover:bg-amber-50 dark:hover:bg-gray-700 text-[#5A4634] dark:text-amber-300 border border-[#DACDBE] dark:border-gray-700 text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-600" />
            <span>הוספת רגע מיוחד לסיפור שלנו</span>
          </button>
        ) : (
          <motion.form
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleAddMilestone}
            className="max-w-md mx-auto p-6 rounded-2xl bg-white dark:bg-gray-800 border border-[#DACDBE] dark:border-gray-700 shadow-md text-right space-y-3"
          >
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
              <h4 className="font-bold text-sm text-[#4A3728] dark:text-white">
                הוספת תחנה חדשה בציר הזמן
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingMilestone(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="כותרת הרגע (לדוגמה: הפגישה בגשם)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-[#FAF7F2] dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="תאריך / תקופה"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-[#FAF7F2] dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <input
                type="text"
                placeholder="מקום (אופציונלי)"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-[#FAF7F2] dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <textarea
              placeholder="מה קרה שם? כמה מילים מרגשות..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-[#FAF7F2] dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
              required
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingMilestone(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-700"
              >
                ביטול
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#4A3728] hover:bg-[#3B2C20] text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>שמור תחנה</span>
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </div>
  );
};
