import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { PRESET_AVATARS, processImageFileToBase64 } from '../data/userProfileStorage';

interface LoginProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export const LoginProfileModal: React.FC<LoginProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
}) => {
  const [name, setName] = useState<string>(currentProfile.name || '');
  const [email, setEmail] = useState<string>(currentProfile.email || '');
  const [targetExam, setTargetExam] = useState<'NEET' | 'JEE'>(currentProfile.targetExam || 'NEET');
  const [targetYear, setTargetYear] = useState<number>(currentProfile.targetYear || 2026);
  const [dailyGoalQuestions, setDailyGoalQuestions] = useState<number>(currentProfile.dailyGoalQuestions || 45);
  const [dreamCollege, setDreamCollege] = useState<string>(currentProfile.dreamCollege || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(currentProfile.avatarUrl || PRESET_AVATARS[0].url);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage('');
      const base64Data = await processImageFileToBase64(file, 360);
      setAvatarUrl(base64Data);
    } catch {
      setErrorMessage('Could not process this image. Please try another photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const updatedProfile: UserProfile = {
      ...currentProfile,
      name: name.trim(),
      email: email.trim(),
      targetExam,
      targetYear,
      dailyGoalQuestions,
      dreamCollege: dreamCollege.trim() || (targetExam === 'NEET' ? 'AIIMS New Delhi' : 'IIT Bombay'),
      avatarUrl,
      isLoggedIn: true,
    };

    onSaveProfile(updatedProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1a1b22]/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-[#fbf8ff] rounded-3xl w-full max-w-lg shadow-2xl border border-[#e3e1ea] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#24389c] via-[#311b92] to-[#4a148c] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-[22px] border border-white/20">
              👤
            </div>
            <div>
              <h3 className="text-[19px] font-black text-white">
                Student Profile & Login
              </h3>
              <p className="text-[12px] text-white/80">
                Customize your identity, target exam, and photo
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {errorMessage}
            </div>
          )}

          {/* Profile Picture Upload & Avatar Picker */}
          <div className="bg-white p-4 rounded-2xl border border-[#e3e1ea] shadow-xs space-y-3">
            <label className="text-[12px] font-bold text-[#1a1b22] uppercase tracking-wider block">
              YOUR PROFILE PICTURE / AVATAR
            </label>

            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={avatarUrl}
                  alt={name || 'User Avatar'}
                  className="w-20 h-20 rounded-2xl object-cover shadow-md border-2 border-[#24389c]/40 group-hover:opacity-90 transition-all bg-gray-100"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-white text-[10px] font-bold">
                    Uploading...
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-[#24389c] text-white text-[13px] font-bold hover:bg-[#1a2b7b] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  Upload Custom Photo from Device
                </button>
                <p className="text-[11px] text-[#585966]">
                  Upload any JPG, PNG photo from your gallery or phone.
                </p>
              </div>
            </div>

            {/* Quick Avatar Presets */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[11px] font-bold text-gray-500 block mb-2">
                Or choose a curated scholar avatar:
              </span>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatarUrl(av.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                      avatarUrl === av.url
                        ? 'border-[#24389c] ring-2 ring-[#24389c]/30 scale-105'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                    title={av.label}
                  >
                    <img src={av.url} alt={av.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 right-0 bg-black/60 text-[10px] px-1 rounded-tl">
                      {av.icon}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Name & Email Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-bold text-[#1a1b22] block mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ankit Kumar Tripathy"
                className="w-full bg-white border border-[#e3e1ea] rounded-xl px-3.5 py-2.5 text-[14px] font-semibold text-[#1a1b22] focus:outline-none focus:border-[#24389c]"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#1a1b22] block mb-1.5">
                Email Address <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. aspirant@example.com"
                className="w-full bg-white border border-[#e3e1ea] rounded-xl px-3.5 py-2.5 text-[14px] font-semibold text-[#1a1b22] focus:outline-none focus:border-[#24389c]"
              />
            </div>
          </div>

          {/* Target Exam & Target Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-bold text-[#1a1b22] block mb-1.5">
                Target Entrance Exam
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTargetExam('NEET')}
                  className={`py-2 px-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    targetExam === 'NEET'
                      ? 'bg-[#24389c] text-white shadow-xs'
                      : 'bg-white border border-[#e3e1ea] text-[#454652]'
                  }`}
                >
                  <span>🩺</span> NEET (UG)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetExam('JEE')}
                  className={`py-2 px-3 rounded-xl text-[13px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    targetExam === 'JEE'
                      ? 'bg-[#24389c] text-white shadow-xs'
                      : 'bg-white border border-[#e3e1ea] text-[#454652]'
                  }`}
                >
                  <span>⚡</span> JEE Main/Adv
                </button>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#1a1b22] block mb-1.5">
                Target Exam Year
              </label>
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(parseInt(e.target.value, 10))}
                className="w-full bg-white border border-[#e3e1ea] rounded-xl px-3.5 py-2.5 text-[14px] font-bold text-[#1a1b22] focus:outline-none focus:border-[#24389c]"
              >
                <option value={2025}>2025 (Upcoming Attempt)</option>
                <option value={2026}>2026 (Target Focus)</option>
                <option value={2027}>2027 (Long-Term Mastery)</option>
              </select>
            </div>
          </div>

          {/* Dream College & Daily Practice Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-bold text-[#1a1b22] block mb-1.5">
                Dream Institution / Goal
              </label>
              <input
                type="text"
                value={dreamCollege}
                onChange={(e) => setDreamCollege(e.target.value)}
                placeholder={targetExam === 'NEET' ? 'e.g. AIIMS New Delhi / JIPMER' : 'e.g. IIT Bombay / IIT Delhi'}
                className="w-full bg-white border border-[#e3e1ea] rounded-xl px-3.5 py-2.5 text-[14px] font-medium text-[#1a1b22] focus:outline-none focus:border-[#24389c]"
              />
            </div>

            <div>
              <label className="text-[12px] font-bold text-[#1a1b22] block mb-1.5">
                Daily Question Practice Goal: <span className="text-[#24389c] font-black">{dailyGoalQuestions} Qs</span>
              </label>
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={dailyGoalQuestions}
                onChange={(e) => setDailyGoalQuestions(parseInt(e.target.value, 10))}
                className="w-full accent-[#24389c] h-2 bg-[#efedf6] rounded-lg appearance-none cursor-pointer mt-2.5"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#24389c] via-[#311b92] to-[#4a148c] text-white font-black text-[15px] hover:brightness-110 active:scale-[0.99] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Save Details & Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
