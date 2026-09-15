import React from 'react';
import { Heart, Sparkles, Lock } from 'lucide-react';
import { WeddingConfig } from '../types';

interface FooterProps {
  config: WeddingConfig;
  onLockSite: () => void;
}

export const Footer: React.FC<FooterProps> = ({ config, onLockSite }) => {
  const formattedDate = new Date(config.weddingDate).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <footer className="w-full border-t border-[#E5DACB] dark:border-gray-800 bg-[#F5EFE6]/60 dark:bg-[#151922] py-12 px-4 sm:px-6 transition-colors">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-4">
        {/* Heart icon */}
        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-700 dark:text-amber-300">
          <Heart className="w-5 h-5 fill-current" />
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#3D2C1D] dark:text-[#F3EAD8]">
            {config.groomName} & {config.brideName}
          </h3>
          <p className="text-xs sm:text-sm text-[#7A6A5A] dark:text-gray-400 mt-1 font-serif">
            {formattedDate} | {config.weddingHallName}, {config.weddingLocation}
          </p>
        </div>

        <p className="text-sm font-serif italic text-[#6E5B4B] dark:text-gray-300 max-w-md">
          ״בַּיִת זֶה יִהְיֶה מָלֵא בְּרָכָה, שָׁלוֹם, קְדֻשָּׁה וְשִׂמְחָה״
        </p>

        <div className="pt-4 flex items-center gap-4 text-xs text-[#8C7A6B] dark:text-gray-500">
          <span>40 צעדים לבית שלנו © כל הזכויות שמורות באהבה</span>
          <span>•</span>
          <button
            onClick={onLockSite}
            className="flex items-center gap-1 hover:text-amber-700 dark:hover:text-amber-400 underline cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            <span>נעילת האתר</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
