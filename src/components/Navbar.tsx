/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Flame, Award, Globe, RotateCcw } from 'lucide-react';
import { LearnerProfile } from '../types';

interface NavbarProps {
  profile: LearnerProfile;
  onOpenProfile: () => void;
  onResetDemo: () => void;
  onRestartOnboarding: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  onOpenProfile,
  onResetDemo,
  onRestartOnboarding,
}) => {
  const nativeLabel = profile.nativeLanguage === 'hindi' ? 'Hindi (हिन्दी)' : profile.nativeLanguage === 'english' ? 'English' : 'Spanish';
  const targetLabel = profile.targetLanguage === 'english' ? 'English' : profile.targetLanguage === 'spanish' ? 'Spanish (Español)' : 'Hindi';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 font-display">LinguaAI</span>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200/60">
                Adaptive
              </span>
            </div>
            <div className="flex items-center text-[11px] text-slate-500 font-medium">
              <span className="capitalize">{profile.nativeLanguage}</span>
              <span className="mx-1 text-slate-300">→</span>
              <span className="text-teal-700 font-semibold capitalize">{profile.targetLanguage}</span>
              <span className="mx-1.5 text-slate-300">•</span>
              <span>{profile.level}</span>
            </div>
          </div>
        </div>

        {/* Stats Pill & Quick Actions */}
        <div className="flex items-center space-x-2">
          {/* Streak */}
          <div 
            id="navbar-streak-badge"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-700 text-xs font-semibold"
            title="Current Daily Streak"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{profile.streak}</span>
          </div>

          {/* XP */}
          <div 
            id="navbar-xp-badge"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-teal-800 text-xs font-semibold"
            title="Total Learning XP"
          >
            <Award className="w-3.5 h-3.5 text-teal-600" />
            <span>{profile.xp}</span>
          </div>

          {/* Demo Reset / Flow restart menu */}
          <button
            id="navbar-restart-onboarding-btn"
            onClick={onRestartOnboarding}
            title="Restart Onboarding Tour"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
