export type HousePhase = 
  | 'foundation' // Days 40-35: אדמה + יסודות
  | 'walls'      // Days 34-29: רצפה + קירות
  | 'windows'    // Days 28-23: חלונות
  | 'door'       // Days 22-17: דלת + מרפסת + מזוזה
  | 'roof'       // Days 16-11: גג + ארובה
  | 'interior'   // Days 10-6: תאורה + ריהוט
  | 'garden'     // Days 5-1: גינה + פרטים אחרונים
  | 'wedding';   // Day 0: הבית המלא והחתונה

export type SurpriseType = 
  | 'message'   // הודעה מיוחדת
  | 'question'  // שאלה מרגשת לשיחה
  | 'mission'   // משימה זוגית קטנה
  | 'memory'    // זיכרון מרגש מהפגישות
  | 'quote'     // משפט השראה
  | 'joke'      // בדיחה / רגע מצחיק
  | 'photo'     // תמונה
  | 'link'      // קישור או סרטון
  | 'blessing'; // ברכה או פסוק מיוחד

export interface SurpriseItem {
  type: SurpriseType;
  title: string;
  badge?: string;
  teaser: string;
  content: string;
  secondaryText?: string;
  actionLabel?: string;
  actionUrl?: string;
  imageUrl?: string;
}

export interface StepDay {
  day: number; // 40 down to 0
  title: string; // e.g. "הנחת אבן הפינה"
  subtitle: string; // e.g. "מתחילים את המסע"
  phase: HousePhase;
  housePartName: string; // e.g. "יסודות אבן יצוקים"
  icon: string; // Lucide icon name or emoji representation
  description: string; // Context for today
  romanticQuestion: string; // Daily reflection / conversation prompt
  quote?: string;
  surprise?: SurpriseItem;
  blessing?: string;
}

export interface MilestoneStory {
  id: string;
  date: string;
  title: string;
  description: string;
  icon: string;
  location?: string;
}

export interface PolaroidPhoto {
  id: string;
  title: string;
  date: string;
  caption: string;
  imageUrl: string;
  rotation?: number; // tilt angle for polaroid
}

export interface MissYouLetter {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  content: string;
  ps?: string;
}

export interface WeddingConfig {
  brideName: string;
  groomName: string;
  weddingDate: string; // ISO date string e.g. "2026-10-25T18:30:00"
  weddingTime: string;
  weddingLocation: string;
  weddingHallName: string;
  accessCode: string;
  countdownTitle: string;
  countdownSubtitle: string;
  heroQuote: string;
  steps: StepDay[];
  milestones: MilestoneStory[];
  gallery: PolaroidPhoto[];
  missYouLetters: MissYouLetter[];
}
