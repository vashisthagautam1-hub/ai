/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, BookOpen, Mic, TrendingUp, User } from 'lucide-react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  hasActiveMistakes?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  hasActiveMistakes = false,
}) => {
  const navItems: { tab: ActiveTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: boolean }[] = [
    { tab: 'home', label: 'Home', icon: Home },
    { tab: 'learn', label: 'Learn', icon: BookOpen },
    { tab: 'practice', label: 'Practice', icon: Mic },
    { tab: 'progress', label: 'Progress', icon: TrendingUp, badge: hasActiveMistakes },
    { tab: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav 
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="max-w-xl mx-auto flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          const Icon = item.icon;

          return (
            <button
              key={item.tab}
              id={`nav-tab-${item.tab}`}
              onClick={() => onChangeTab(item.tab)}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-teal-700 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                )}
              </div>
              <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 rounded-full bg-teal-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
