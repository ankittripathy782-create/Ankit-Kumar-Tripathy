import { UserProfile } from '../types';

const PROFILE_STORAGE_KEY = 'preppulse_user_profile_v2';

export const PRESET_AVATARS = [
  {
    id: 'doc_1',
    label: 'Doctor (NEET)',
    icon: '🩺',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    color: '#24389c'
  },
  {
    id: 'surgeon_2',
    label: 'Surgeon (AIIMS)',
    icon: '🏥',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
    color: '#00695c'
  },
  {
    id: 'engineer_3',
    label: 'Engineer (IIT)',
    icon: '⚡',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    color: '#6f48b2'
  },
  {
    id: 'scientist_4',
    label: 'Scientist (Research)',
    icon: '🧪',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    color: '#1a2b7b'
  },
  {
    id: 'scholar_5',
    label: 'Topper (Rank 1)',
    icon: '🎓',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    color: '#b23b00'
  },
  {
    id: 'creative_6',
    label: 'Focused Scholar',
    icon: '🧠',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    color: '#4a148c'
  }
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user-default-1',
  name: 'Scholar Aspirant',
  email: '',
  avatarUrl: PRESET_AVATARS[0].url,
  targetExam: 'NEET',
  targetYear: 2026,
  dailyGoalQuestions: 45,
  dailyStudyTargetHours: 4,
  dreamCollege: 'AIIMS New Delhi / IIT Bombay',
  bio: 'Targeting 700+ in NEET / 99.8%ile in JEE through rigorous 4h daily streaks and PYQ revisions.',
  isLoggedIn: true,
  joinedDate: new Date().toISOString().split('T')[0]
};

export function loadUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      saveUserProfile(DEFAULT_USER_PROFILE);
      return DEFAULT_USER_PROFILE;
    }
    const parsed: UserProfile = JSON.parse(raw);
    // Sanitize any initial/legacy auto-filled personal email address
    if (parsed.email === 'ankittripathy782@gmail.com') {
      parsed.email = '';
      saveUserProfile({ ...DEFAULT_USER_PROFILE, ...parsed, email: '' });
    }
    return { ...DEFAULT_USER_PROFILE, ...parsed };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save user profile', err);
  }
}

/**
 * Resizes an image file and converts to base64 Data URL to safely fit into localStorage
 */
export function processImageFileToBase64(file: File, maxDimension: number = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
