/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Flame, 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  BookOpen, 
  Mic, 
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { LearnerProfile, MistakeRecord } from '../types';

interface ProgressViewProps {
  profile: LearnerProfile;
  onDrillMistake: (mistake: MistakeRecord) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ profile, onDrillMistake }) => {
  const [filterType, setFilterType] = useState<string>('all');

  const accuracy = profile.stats.totalExercisesAnswered > 0
    ? Math.round((profile.stats.correctAnswers / profile.stats.totalExercisesAnswered) * 100)
    : 85;

  const mistakes = profile.repeatedMistakes || [];
  const filteredMistakes = filterType === 'all' 
    ? mistakes 
    : mistakes.filter(m => m.mistakeType === filterType);

  const skillsBreakdown = [
    { skill: 'Grammar', score: Math.max(50, accuracy - 5), desc: 'Verb tense & agreement', color: 'bg-teal-500' },
    { skill: 'Vocabulary', score: Math.min(95, profile.vocabularyLearned.length * 10), desc: 'Active vocabulary bank', color: 'bg-emerald-500' },
    { skill: 'Speaking', score: profile.stats.speakingMinutes > 0 ? 82 : 75, desc: 'Conversational fluency & cadence', color: 'bg-blue-500' },
    { skill: 'Pronunciation', score: profile.stats.pronunciationAvg || 84, desc: 'Phonetic & intonation clarity', color: 'bg-indigo-500' }
  ];

  return (
    <div className="max-w-xl mx-auto px-4 pt-3 pb-24 space-y-5">
      
      {/* 1. Header Overview Card */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
              Personal Performance Index
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1.5 font-display">Learner Progress & Retention</h2>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-base">
            {accuracy}%
          </div>
        </div>

        {/* 4-stat metric grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60 text-center">
            <span className="text-[11px] text-slate-500">Total Exercises</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{profile.stats.totalExercisesAnswered}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60 text-center">
            <span className="text-[11px] text-slate-500">Lessons Completed</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{profile.lessonHistory.length + 1}</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60 text-center">
            <span className="text-[11px] text-slate-500">Active Streak</span>
            <p className="text-lg font-bold text-amber-600 mt-0.5">{profile.streak} Days</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60 text-center">
            <span className="text-[11px] text-slate-500">Speaking Practice</span>
            <p className="text-lg font-bold text-teal-700 mt-0.5">{profile.stats.speakingMinutes || 15}m</p>
          </div>
        </div>
      </div>

      {/* 2. Core Skill Competency Breakdown */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Skill Competency Breakdown</h3>
        
        <div className="space-y-3.5">
          {skillsBreakdown.map((item) => (
            <div key={item.skill} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-900">{item.skill}</span>
                  <span className="text-slate-400 text-[11px] ml-1.5">• {item.desc}</span>
                </div>
                <span className="font-bold text-slate-900">{item.score}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`${item.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Common Mistakes Ledger & Diagnostic Engine */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Diagnostic Mistake Ledger</h3>
            <p className="text-[11px] text-slate-500">Continuously monitored by AI tutor to generate revisions</p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-[11px]">
            {['all', 'grammar', 'sentence_construction'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-0.5 rounded-lg capitalize transition-colors ${
                  filterType === type 
                    ? 'bg-white font-bold text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {type === 'sentence_construction' ? 'Syntax' : type}
              </button>
            ))}
          </div>
        </div>

        {filteredMistakes.length === 0 ? (
          <div className="p-4 rounded-2xl bg-slate-50 text-center text-xs text-slate-500">
            No mistakes recorded under this category.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMistakes.map((m) => (
              <div 
                key={m.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  m.resolved 
                    ? 'bg-slate-50/70 border-slate-200 text-slate-600' 
                    : 'bg-amber-50/50 border-amber-200/80 text-amber-950'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        {m.mistakeType}
                      </span>
                      {m.resolved ? (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Resolved</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          Seen {m.repeatCount}x
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">{m.mistake}</h4>
                  </div>

                  {!m.resolved && (
                    <button
                      onClick={() => onDrillMistake(m)}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold flex items-center space-x-1 shadow-xs transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Drill</span>
                    </button>
                  )}
                </div>

                <div className="bg-white/90 p-2.5 rounded-xl border border-slate-100 text-xs mt-2 space-y-1">
                  <div className="flex items-center space-x-1 text-rose-600">
                    <span className="font-semibold text-[10px] text-slate-400">User formulation:</span>
                    <span className="line-through">{m.userAnswer}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-700 font-medium">
                    <span className="font-semibold text-[10px] text-slate-400">Correct formulation:</span>
                    <span>{m.correctAnswer}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                  {m.explanation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Mastered Topics vs Topics Requiring Revision */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Mastered */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Mastered Topics</h4>
          </div>
          <div className="space-y-1.5">
            {profile.masteredTopics.map((topic, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs font-medium text-emerald-900 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{topic}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revision */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-amber-700">
            <RotateCcw className="w-4 h-4" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Targeted for Revision</h4>
          </div>
          <div className="space-y-1.5">
            {profile.topicsNeedingRevision.map((topic, idx) => (
              <div key={idx} className="p-2 rounded-xl bg-amber-50/60 border border-amber-100 text-xs font-medium text-amber-900 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{topic}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};
