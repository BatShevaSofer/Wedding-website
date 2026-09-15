import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { weddingConfig } from './config/weddingConfig';
import { StepDay } from './types';
import { Navbar } from './components/Navbar';
import { InteractiveHouse } from './components/InteractiveHouse';
import { CountdownTimer } from './components/CountdownTimer';
import { DailyStepsTimeline } from './components/DailyStepsTimeline';
import { StepDetailModal } from './components/StepDetailModal';
import { OurStorySection } from './components/OurStorySection';
import { PolaroidGallery } from './components/PolaroidGallery';
import { MissYouSection } from './components/MissYouSection';
import { WeddingFinaleModal } from './components/WeddingFinaleModal';
import { PrivacyGate } from './components/PrivacyGate';
import { Footer } from './components/Footer';

export default function App() {
  // 🔐 1. Privacy Passcode Gate
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('wedding_unlocked') === 'true';
  });

  // 🌙 2. Dark / Night Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('wedding_dark_mode');
    return saved ? saved === 'true' : false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-[#141820]', 'text-[#F3EAD8]');
      document.body.classList.remove('bg-[#FAF7F2]', 'text-[#3D3025]');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('bg-[#FAF7F2]', 'text-[#3D3025]');
      document.body.classList.remove('bg-[#141820]', 'text-[#F3EAD8]');
    }
    localStorage.setItem('wedding_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  // 📅 3. Real-time Days Calculation from Wedding Date
  const realDaysLeft = useMemo(() => {
    const target = new Date(weddingConfig.weddingDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;
    if (difference <= 0) return 0;
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    // Clamp between 0 and 40
    return Math.min(40, Math.max(0, days));
  }, []);

  // Simulated Day Override (defaults to realDaysLeft, or day 40 if date is far in future)
  const [simulatedDay, setSimulatedDay] = useState<number>(() => {
    // If realDaysLeft is within 0-40, use it, else default to 40
    return realDaysLeft > 0 && realDaysLeft <= 40 ? realDaysLeft : 40;
  });

  // 4. Completed days array in localStorage
  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    const saved = localStorage.getItem('wedding_completed_days');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // 5. Selected Step for Modal Detail
  const [selectedStep, setSelectedStep] = useState<StepDay | null>(null);

  // 6. Preview Unlock All steps toggle
  const [unlockAllPreview, setUnlockAllPreview] = useState<boolean>(false);

  // 7. Wedding Day Finale Modal
  const [showFinaleModal, setShowFinaleModal] = useState<boolean>(false);

  // Mark step as completed
  const handleMarkCompleted = useCallback((day: number) => {
    setCompletedDays((prev) => {
      if (prev.includes(day)) return prev;
      const updated = [...prev, day];
      localStorage.setItem('wedding_completed_days', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Open today's step
  const handleOpenTodayStep = useCallback(() => {
    const todayStep = weddingConfig.steps.find((s) => s.day === simulatedDay) || weddingConfig.steps[0];
    setSelectedStep(todayStep);
  }, [simulatedDay]);

  // Lock site callback
  const handleLockSite = useCallback(() => {
    localStorage.removeItem('wedding_unlocked');
    setIsUnlocked(false);
  }, []);

  // If locked, display privacy gate
  if (!isUnlocked) {
    return (
      <PrivacyGate
        correctCode={weddingConfig.accessCode}
        onSuccess={() => setIsUnlocked(true)}
        brideName={weddingConfig.brideName}
        groomName={weddingConfig.groomName}
      />
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 font-sans ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Navbar with quick links, simulation controls and dark mode toggle */}
      <Navbar
        brideName={weddingConfig.brideName}
        groomName={weddingConfig.groomName}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        currentDay={simulatedDay}
        onSimulateDayChange={setSimulatedDay}
        onOpenFinalePreview={() => setShowFinaleModal(true)}
      />

      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION: The Isometric House & Live Countdown
          ══════════════════════════════════════════════════════════════ */}
      <section id="hero" className="w-full pt-6 pb-14 px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle decorative gold foil arches in background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-radial from-amber-100/40 dark:from-amber-900/15 to-transparent pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto flex flex-col items-center">
          {/* Header Title above house */}
          <div className="text-center mb-6">
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#8C6D4F] dark:text-amber-400/90 uppercase">
              {simulatedDay === 0 ? "היום הגדול הגיע" : `עוד ${simulatedDay} ימים...`}
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-serif text-[#3D2C1D] dark:text-[#FAF4EB] tracking-tight mt-1 mb-2">
              40 צעדים לבית שלנו
            </h1>
            <p className="text-base sm:text-xl font-serif text-[#6B5A4B] dark:text-gray-300">
              עד שמתחילים לבנות את הבית שלנו באמת
            </p>
          </div>

          {/* Central Grand Isometric SVG House */}
          <div className="w-full my-4">
            <InteractiveHouse
              currentDay={simulatedDay}
              isDarkMode={isDarkMode}
              onSelectDay={setSimulatedDay}
            />
          </div>

          {/* Live Countdown Timer & "לפתוח את הצעד של היום ←" Button */}
          <div className="w-full mt-2">
            <CountdownTimer
              weddingDate={weddingConfig.weddingDate}
              countdownTitle={`עוד ${simulatedDay} ימים...`}
              countdownSubtitle={simulatedDay === 0 ? "הגענו הביתה ❤️" : weddingConfig.countdownSubtitle}
              heroQuote={weddingConfig.heroQuote}
              onOpenTodayStep={handleOpenTodayStep}
              onCelebrateWedding={() => setShowFinaleModal(true)}
              isDarkMode={isDarkMode}
              forcedDaysLeft={simulatedDay}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: 40 Steps Timeline
          ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF6F0]/60 dark:bg-[#161B24]/60 border-y border-[#E8DFD1] dark:border-gray-800 transition-colors">
        <DailyStepsTimeline
          steps={weddingConfig.steps}
          currentDay={simulatedDay}
          onSelectStep={(step) => setSelectedStep(step)}
          completedDays={completedDays}
          isDarkMode={isDarkMode}
          unlockAllPreview={unlockAllPreview}
          onToggleUnlockAll={() => setUnlockAllPreview(!unlockAllPreview)}
        />
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3: Our Story ("איך הגענו עד לכאן?")
          ══════════════════════════════════════════════════════════════ */}
      <section className="transition-colors">
        <OurStorySection
          milestones={weddingConfig.milestones}
          isDarkMode={isDarkMode}
        />
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: Polaroid Gallery
          ══════════════════════════════════════════════════════════════ */}
      <section className="bg-[#FAF6F0]/60 dark:bg-[#161B24]/60 border-y border-[#E8DFD1] dark:border-gray-800 transition-colors">
        <PolaroidGallery
          initialPhotos={weddingConfig.gallery}
          isDarkMode={isDarkMode}
        />
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5: "לפתוח כשמתגעגעים" (Open When You Miss Me)
          ══════════════════════════════════════════════════════════════ */}
      <section className="transition-colors">
        <MissYouSection
          initialLetters={weddingConfig.missYouLetters}
          isDarkMode={isDarkMode}
          brideName={weddingConfig.brideName}
          groomName={weddingConfig.groomName}
        />
      </section>

      {/* Footer */}
      <Footer
        config={weddingConfig}
        onLockSite={handleLockSite}
      />

      {/* Modal: Daily Step & Surprise Details */}
      <StepDetailModal
        step={selectedStep}
        isOpen={Boolean(selectedStep)}
        onClose={() => setSelectedStep(null)}
        isDarkMode={isDarkMode}
        isToday={selectedStep?.day === simulatedDay}
        isCompleted={selectedStep ? completedDays.includes(selectedStep.day) || selectedStep.day > simulatedDay : false}
        onMarkCompleted={handleMarkCompleted}
      />

      {/* Modal: Wedding Day Celebration Screen (Day 0) */}
      <WeddingFinaleModal
        isOpen={showFinaleModal}
        onClose={() => setShowFinaleModal(false)}
        config={weddingConfig}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
