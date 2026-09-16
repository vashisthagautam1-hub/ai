/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  Globe, 
  Settings, 
  Sparkles, 
  Shield, 
  RotateCcw, 
  Check, 
  Code, 
  ChevronRight,
  Database,
  Flame,
  Clock
} from 'lucide-react';
import { LearnerProfile, Language, LearnerLevel, LearningGoal, DailyTime } from '../types';

interface ProfileViewProps {
  profile: LearnerProfile;
  onUpdateProfile: (updated: LearnerProfile) => void;
  onRestartOnboarding: () => void;
  onLoadPreset: (preset: 'hindi_english' | 'english_spanish') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onRestartOnboarding,
  onLoadPreset,
}) => {
  const [showJsonState, setShowJsonState] = useState<boolean>(false);

  const handleUpdate = (partial: Partial<LearnerProfile>) => {
    onUpdateProfile({ ...profile, ...partial });
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-3 pb-24 space-y-5">
      
      {/* 1. Profile Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center space-x-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-xl">
          {profile.targetLanguage === 'english' ? '🇬🇧' : '🇪🇸'}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900 font-display">LinguaAI Learner</h2>
            <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full">
              ID: {profile.id.slice(0, 8)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Native: <span className="font-semibold capitalize text-slate-700">{profile.nativeLanguage}</span> • Learning: <span className="font-semibold capitalize text-teal-700">{profile.targetLanguage}</span>
          </p>
        </div>
      </div>

      {/* 2. Language Pair & Target Settings */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Curriculum Settings</h3>
        
        {/* Language switcher */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600">Language Pair</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onLoadPreset('hindi_english')}
              className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                profile.nativeLanguage === 'hindi' && profile.targetLanguage === 'english'
                  ? 'border-teal-600 bg-teal-50 text-teal-950 font-semibold ring-2 ring-teal-600/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="text-base mr-1.5">🇮🇳 → 🇬🇧</span>
              <span>Hindi → English</span>
            </button>

            <button
              onClick={() => onLoadPreset('english_spanish')}
              className={`p-3 rounded-2xl border text-left text-xs transition-all ${
                profile.nativeLanguage === 'english' && profile.targetLanguage === 'spanish'
                  ? 'border-teal-600 bg-teal-50 text-teal-950 font-semibold ring-2 ring-teal-600/20'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="text-base mr-1.5">🇬🇧 → 🇪🇸</span>
              <span>English → Spanish</span>
            </button>
          </div>
        </div>

        {/* Current Level */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-slate-600">Learner Level</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Beginner', 'Elementary', 'Intermediate', 'Advanced'] as LearnerLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => handleUpdate({ level: lvl, currentDifficulty: lvl.toLowerCase() as any })}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  profile.level === lvl
                    ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-slate-600">Priority Goal</label>
          <div className="grid grid-cols-3 gap-2">
            {(['Speaking', 'Grammar', 'Vocabulary', 'Pronunciation', 'Overall'] as LearningGoal[]).map((goal) => (
              <button
                key={goal}
                onClick={() => handleUpdate({ learningGoal: goal })}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                  profile.learningGoal === goal
                    ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Time */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-semibold text-slate-600">Daily Target (minutes)</label>
          <div className="grid grid-cols-4 gap-2">
            {([5, 10, 15, 30] as DailyTime[]).map((time) => (
              <button
                key={time}
                onClick={() => handleUpdate({ dailyTime: time })}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all ${
                  profile.dailyTime === time
                    ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {time}m / day
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Investor / Startup Architecture Inspection */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-teal-800">
            <Database className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">AI Personalization State</h3>
          </div>
          <button
            onClick={() => setShowJsonState(!showJsonState)}
            className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showJsonState ? 'Hide JSON' : 'Inspect Profile JSON'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          The AI tutor continuously passes this structured learner profile to Gemini to calibrate vocabulary choices, identify repeated grammar errors, and generate targeted revision lessons.
        </p>

        {showJsonState && (
          <div className="p-3 bg-slate-900 rounded-2xl text-[11px] text-teal-300 font-mono overflow-x-auto max-h-72 border border-slate-800 animate-in fade-in">
            <pre>{JSON.stringify(profile, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* 4. Demo Controls */}
      <div className="space-y-2.5">
        <button
          id="profile-restart-onboarding"
          onClick={onRestartOnboarding}
          className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center space-x-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restart Onboarding Tour</span>
        </button>
      </div>

    </div>
  );
};
