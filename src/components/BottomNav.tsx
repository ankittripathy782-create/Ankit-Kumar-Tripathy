import React from 'react';

export type NavTab = 'home' | 'tests' | 'timetable' | 'analytics' | 'profile';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: 'home' },
    { id: 'tests' as NavTab, label: 'Tests', icon: 'quiz' },
    { id: 'timetable' as NavTab, label: 'Timetable', icon: 'calendar_month' },
    { id: 'analytics' as NavTab, label: 'Analytics', icon: 'leaderboard' },
    { id: 'profile' as NavTab, label: 'Profile', icon: 'account_circle' },
  ];


  return (
    <nav className="fixed bottom-0 w-full z-40 bg-[#fbf8ff]/90 backdrop-blur-xl pb-safe shadow-[0_-1px_12px_rgba(0,0,0,0.06)] border-t border-[#e3e1ea]/70">
      <div className="max-w-2xl mx-auto h-16 flex items-center justify-around px-4">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[64px] py-1 transition-all group ${
                isActive ? 'text-[#24389c]' : 'text-[#454652] hover:text-[#24389c]/70'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[24px] transition-transform duration-200 ${
                  isActive ? 'scale-110 font-bold' : 'group-hover:scale-105'
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1, 'wght' 700" } : {}}
              >
                {tab.icon}
              </span>
              <span
                className={`text-[12px] mt-0.5 tracking-tight transition-colors ${
                  isActive ? 'font-bold text-[#24389c]' : 'font-medium text-[#454652]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
