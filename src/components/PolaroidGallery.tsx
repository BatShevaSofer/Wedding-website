import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Plus, 
  X, 
  Calendar, 
  Sparkles, 
  Upload, 
  Image as ImageIcon,
  Heart,
  ZoomIn
} from 'lucide-react';
import { PolaroidPhoto } from '../types';

interface PolaroidGalleryProps {
  initialPhotos: PolaroidPhoto[];
  isDarkMode: boolean;
}

export const PolaroidGallery: React.FC<PolaroidGalleryProps> = ({
  initialPhotos,
  isDarkMode
}) => {
  const [photos, setPhotos] = useState<PolaroidPhoto[]>(() => {
    const saved = localStorage.getItem('wedding_custom_gallery');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialPhotos;
      }
    }
    return initialPhotos;
  });

  const [selectedPhoto, setSelectedPhoto] = useState<PolaroidPhoto | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // File upload handler converting file to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setNewImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = imagePreview || newImageUrl.trim();
    if (!finalUrl || !newTitle.trim()) return;

    // Random slight rotation between -3 and 3 degrees for realistic polaroid tilt
    const randomRotation = (Math.random() * 6 - 3);

    const newPhoto: PolaroidPhoto = {
      id: `photo-${Date.now()}`,
      title: newTitle.trim(),
      date: newDate.trim() || 'רגע מיוחד',
      caption: newCaption.trim() || 'זיכרון מתוק של שנינו',
      imageUrl: finalUrl,
      rotation: Number(randomRotation.toFixed(1))
    };

    const updated = [newPhoto, ...photos];
    setPhotos(updated);
    localStorage.setItem('wedding_custom_gallery', JSON.stringify(updated));

    // Reset form
    setNewTitle('');
    setNewDate('');
    setNewCaption('');
    setNewImageUrl('');
    setImagePreview(null);
    setIsUploadModalOpen(false);
  };

  return (
    <div id="gallery" className="w-full max-w-5xl mx-auto py-16 px-4 sm:px-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12 border-b border-[#E5DACB] dark:border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-xs sm:text-sm uppercase tracking-wider mb-1">
            <Camera className="w-4 h-4" />
            <span>האלבום הזוגי שלנו</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#3D2C1D] dark:text-[#F3EAD8]">
            רגעים שלעולם לא נשכח
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6A5A] dark:text-gray-400 mt-1 font-serif">
            תמונות פולארויד מרגעי הקסם בדרך לחופה.
          </p>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#4A3728] hover:bg-[#3D2C1D] text-white text-xs sm:text-sm font-semibold shadow-sm transition-all hover:scale-105 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>הוספת תמונה לאלבום</span>
        </button>
      </div>

      {/* Polaroid Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 pt-4">
        {photos.map((photo, idx) => {
          const rotation = photo.rotation ?? (idx % 2 === 0 ? -2 : 2);

          return (
            <motion.div
              key={photo.id}
              whileHover={{ scale: 1.04, rotate: 0, zIndex: 10 }}
              style={{ transform: `rotate(${rotation}deg)` }}
              onClick={() => setSelectedPhoto(photo)}
              className="group relative bg-[#FFFCF8] dark:bg-[#202735] p-3.5 pb-5 rounded-md shadow-md hover:shadow-2xl transition-all duration-300 border border-[#E8DFD1] dark:border-gray-700 cursor-pointer flex flex-col justify-between"
            >
              {/* Top Washi Tape Sticker effect */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-16 h-5 bg-amber-200/60 dark:bg-amber-800/40 border border-amber-300/40 rounded-xs -rotate-2 opacity-80 z-10" />

              {/* Polaroid Photo Image container with 1:1 aspect ratio */}
              <div className="relative w-full aspect-square rounded-sm overflow-hidden bg-gray-100 dark:bg-gray-800 mb-3.5 border border-black/5">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="p-2 rounded-full bg-white/80 text-gray-800 shadow-sm">
                    <ZoomIn className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Bottom White Area of Polaroid (Handwritten style) */}
              <div className="text-center px-1">
                <h4 className="font-serif font-bold text-base text-[#3D2C1D] dark:text-gray-100 truncate">
                  {photo.title}
                </h4>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#8C7A6B] dark:text-gray-400 mt-0.5">
                  <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span>{photo.date}</span>
                </div>
                <p className="text-xs text-[#5A4634] dark:text-gray-300 mt-1.5 line-clamp-2 italic font-serif">
                  "{photo.caption}"
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhoto(null)}
              className="fixed inset-0"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-lg w-full bg-[#FFFCF8] dark:bg-[#1E2430] p-4 sm:p-6 pb-6 rounded-2xl shadow-2xl z-10 border border-[#E5DACB] dark:border-gray-700"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 left-3 p-2 rounded-full bg-black/10 hover:bg-black/20 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="rounded-lg overflow-hidden border border-black/10 max-h-[60vh] bg-black/5 flex items-center justify-center">
                <img
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>

              <div className="mt-4 text-center">
                <h3 className="text-xl font-bold font-serif text-[#3D2C1D] dark:text-white">
                  {selectedPhoto.title}
                </h3>
                <span className="text-xs text-[#8C7A6B] dark:text-gray-400 font-medium">
                  {selectedPhoto.date}
                </span>
                <p className="mt-2 text-sm sm:text-base font-serif italic text-[#5A4634] dark:text-gray-300">
                  "{selectedPhoto.caption}"
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upload Photo Modal */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsUploadModalOpen(false)}
              className="fixed inset-0"
            />

            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleAddPhoto}
              className="relative max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl z-10 border border-[#E5DACB] dark:border-gray-700 space-y-4 text-right"
            >
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                <h3 className="font-bold text-lg font-serif text-[#4A3728] dark:text-white">
                  הוספת תמונה לאלבום הפולארויד
                </h3>
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  בחירת תמונה מהמכשיר או קישור ישיר:
                </label>
                
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center hover:border-amber-500 transition-colors bg-[#FAF7F2] dark:bg-gray-900/50">
                  {imagePreview ? (
                    <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setNewImageUrl('');
                        }}
                        className="absolute top-1 left-1 p-1 bg-black/60 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        גררו לכאן תמונה או לחצו לבחירה
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="mt-2 text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <input
                    type="url"
                    placeholder="או הדביקו קישור לתמונה (URL)"
                    value={newImageUrl}
                    onChange={(e) => {
                      setNewImageUrl(e.target.value);
                      if (e.target.value.startsWith('http')) {
                        setImagePreview(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                  />
                </div>
              </div>

              {/* Title & Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    כותרת:
                  </label>
                  <input
                    type="text"
                    placeholder="למשל: יום האירוסין"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    תאריך / אירוע:
                  </label>
                  <input
                    type="text"
                    placeholder="למשל: סיוון תשפ״ו"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                  />
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  משפט קצר שכתוב בתחתית הפולארויד:
                </label>
                <input
                  type="text"
                  placeholder="למשל: הרגע שהבנתי שהחיוך שלך עושה לי אור בלב"
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4A3728] hover:bg-[#3D2C1D] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>שמירה באלבום</span>
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
