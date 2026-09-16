/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Play, 
  Mic, 
  Flame, 
  Award, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { LearnerProfile, MistakeRecord } from '../types';

interface HomeDashboardProps {
  profile: LearnerProfile;
  onStartLesson: (topic?: string, isRevision?: boolean) => void;
  onStartSpeaking: () => void;
  onDrillMistake: (mistake: MistakeRecord) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  onStartLesson,
  onStartSpeaking,
  onDrillMistake,
}) => {
  const primaryWeakness = profile.grammarWeaknesses?.[0];
  const activeMistakes = profile.repeatedMistakes?.filter(m => !m.resolved) || [];
  const masteredCount = profile.masteredTopics?.length || 0;
  const progressPercent = Math.min(100, Math.round((profile.stats.correctAnswers / Math.max(1, profile.stats.totalExercisesAnswered + 10)) * 100));

  const targetLangLabel = profile.targetLanguage === 'english' ? 'English' : profile.targetLanguage === 'spanish' ? 'Spanish' : 'Hindi';

  return (
    <div className="space-y-6 pb-24 max-w-xl mx-auto px-4 pt-4">
      
      {/* 1. Daily Progress & Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-teal-500/15 blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-teal-200">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Personalized AI Curriculum</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs font-medium text-slate-300">
              <Clock className="w-3.5 h-3.5" />
              <span>{profile.dailyTime}m daily target</span>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-bold tracking-tight font-display text-white">
            Today's Adaptive Session
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-md leading-relaxed">
            {primaryWeakness 
              ? `Tutor priority: Reinforcing "${primaryWeakness.topic}" based on recent responses.` 
              : `Ready to expand your ${targetLangLabel} vocabulary and conversational confidence.`}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2.5 mt-5 pt-5 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-2.5 border border-white/10">
              <div className="flex items-center space-x-1 text-amber-400 mb-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                <span className="text-xs font-semibold">Streak</span>
              </div>
              <p className="text-lg font-bold text-white">{profile.streak} Days</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-2.5 border border-white/10">
              <div className="flex items-center space-x-1 text-teal-400 mb-1">
                <Award className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Score</span>
              </div>
              <p className="text-lg font-bold text-white">{profile.xp} XP</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-2.5 border border-white/10">
              <div className="flex items-center space-x-1 text-emerald-400 mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Accuracy</span>
              </div>
              <p className="text-lg font-bold text-white">
                {profile.stats.totalExercisesAnswered > 0 
                  ? `${Math.round((profile.stats.correctAnswers / profile.stats.totalExercisesAnswered) * 100)}%` 
                  : '85%'}
              </p>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            <button
              id="home-start-today-lesson-btn"
              onClick={() => onStartLesson()}
              className="w-full py-3.5 px-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md shadow-teal-500/25 flex items-center justify-center space-x-2 transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Continue Lesson</span>
            </button>

            <button
              id="home-start-speaking-practice-btn"
              onClick={onStartSpeaking}
              className="w-full py-3.5 px-4 rounded-2xl bg-white/15 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all backdrop-blur-sm"
            >
              <Mic className="w-4 h-4 text-teal-300" />
              <span>Practice Speaking</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Today's Recommended Lesson Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recommended Next Module</h3>
              <p className="text-[11px] text-slate-500">Formulated by AI tutor loop</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200/60">
            {profile.currentDifficulty.toUpperCase()}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-900">
              {profile.targetLanguage === 'english' ? 'Present Continuous & Commute' : 'Ser vs Estar in Daily Contexts'}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {profile.nativeLanguage === 'hindi' 
              ? 'Addressing common verb form confusion (e.g. avoiding "I am go" in favor of "I am going to the market").'
              : 'Mastering temporary emotional states and spatial locations with Estar.'}
          </p>
          <div className="flex items-center space-x-4 pt-1 text-[11px] text-slate-500">
            <span>⏱️ 5 mins</span>
            <span>🎯 4 interactive drills</span>
            <span>⚡ +25 XP</span>
          </div>
        </div>

        <button
          id="home-launch-recommended-module"
          onClick={() => onStartLesson(profile.targetLanguage === 'english' ? 'Present Continuous Mastery' : 'Ser vs Estar')}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors"
        >
          <span>Start This Module</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 3. AI Diagnosed Weak Areas & Mistakes to Review */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Diagnosed Weak Areas</h3>
              <p className="text-[11px] text-slate-500">Identified from previous exercises</p>
            </div>
          </div>
          {activeMistakes.length > 0 && (
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              {activeMistakes.length} to resolve
            </span>
          )}
        </div>

        {activeMistakes.length === 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-center space-y-1">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="text-xs font-semibold text-emerald-900">No active mistake clusters!</p>
            <p className="text-[11px] text-emerald-700">All previous grammar anomalies have been reviewed and reinforced.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeMistakes.map((mistake) => (
              <div 
                key={mistake.id}
                className="p-3.5 rounded-2xl border border-amber-200/80 bg-amber-50/40 space-y-2 transition-all hover:bg-amber-50/80"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                      {mistake.mistakeType}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1.5">{mistake.mistake}</h4>
                  </div>
                  {mistake.repeatCount > 1 && (
                    <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                      Repeated {mistake.repeatCount}x
                    </span>
                  )}
                </div>

                <div className="bg-white/80 rounded-xl p-2.5 border border-amber-100 text-xs space-y-1">
                  <div className="flex items-center space-x-1 text-rose-600">
                    <span className="font-semibold text-[11px]">Your input:</span>
                    <span className="line-through">{mistake.userAnswer}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-700 font-medium">
                    <span className="font-semibold text-[11px]">Correct:</span>
                    <span>{mistake.correctAnswer}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-snug">
                  {mistake.explanation}
                </p>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500">
                    Practice topic: {mistake.recommendedPractice}
                  </span>
                  <button
                    id={`drill-mistake-btn-${mistake.id}`}
                    onClick={() => onDrillMistake(mistake)}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-sm transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Drill This</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Vocabulary & Mastered Topics Progress */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Words Learned</span>
          <p className="text-2xl font-bold text-slate-900">{profile.vocabularyLearned.length}</p>
          <div className="flex flex-wrap gap-1 pt-1">
            {profile.vocabularyLearned.slice(0, 4).map((w) => (
              <span key={w} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                {w}
              </span>
            ))}
            {profile.vocabularyLearned.length > 4 && (
              <span className="text-[10px] text-slate-400 font-medium">+{profile.vocabularyLearned.length - 4} more</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Mastered Topics</span>
          <p className="text-2xl font-bold text-emerald-600">{masteredCount}</p>
          <div className="flex flex-wrap gap-1 pt-1">
            {profile.masteredTopics.slice(0, 2).map((t) => (
              <span key={t} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-md font-medium truncate max-w-[120px]">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
