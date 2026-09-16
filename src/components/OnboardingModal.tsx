/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Clock, 
  Target, 
  Compass, 
  Languages, 
  Bot,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { Language, LearnerLevel, LearningGoal, DailyTime, LearnerProfile } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: {
    nativeLanguage: Language;
    targetLanguage: Language;
    level: LearnerLevel;
    learningGoal: LearningGoal;
    dailyTime: DailyTime;
  }) => void;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(0);
  const [nativeLanguage, setNativeLanguage] = useState<Language>('hindi');
  const [targetLanguage, setTargetLanguage] = useState<Language>('english');
  const [level, setLevel] = useState<LearnerLevel>('Beginner');
  const [learningGoal, setLearningGoal] = useState<LearningGoal>('Speaking');
  const [dailyTime, setDailyTime] = useState<DailyTime>(15);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(0);

  if (!isOpen) return null;

  const totalSteps = 6;

  const handleStartGeneration = () => {
    setStep(6);
    setIsGeneratingPlan(true);

    const stages = [
      'Analyzing cross-lingual patterns for your language pair...',
      'Mapping common L1 transfer mistakes (verb agreement & articles)...',
      'Calibrating initial difficulty & pacing threshold...',
      'Personalized adaptive curriculum ready!'
    ];

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setGenerationStep(current);
      if (current >= stages.length - 1) {
        clearInterval(interval);
        setTimeout(() => {
          setIsGeneratingPlan(false);
        }, 600);
      }
    }, 700);
  };

  const handleFinish = () => {
    onComplete({
      nativeLanguage,
      targetLanguage,
      level,
      learningGoal,
      dailyTime
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Progress Bar */}
        {step > 0 && step < 6 && (
          <div className="w-full bg-slate-100 h-1.5">
            <div 
              className="bg-teal-600 h-1.5 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        )}

        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          
          {/* STEP 0: Welcome Screen */}
          {step === 0 && (
            <div className="space-y-6 text-center py-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200/70 text-teal-600 mx-auto shadow-sm">
                <Bot className="w-8 h-8" />
              </div>

              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold mb-3 border border-teal-200/50">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Next-Gen Language Education</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-display">
                  Meet LinguaAI
                </h1>
                <p className="text-sm md:text-base text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
                  An adaptive personal AI language tutor that learns how <span className="font-semibold text-slate-900">you</span> learn. Diagnoses mistakes, provides speaking practice, and personalizes every lesson.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 text-left pt-2">
                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="p-1.5 rounded-lg bg-teal-100/70 text-teal-700 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900">Continuous Mistake Diagnosis</h3>
                    <p className="text-xs text-slate-500">Doesn't just mark right or wrong; identifies underlying grammar and phonetic roots.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="p-1.5 rounded-lg bg-emerald-100/70 text-emerald-700 mt-0.5">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-slate-900">Zero-Overwhelm Adaptation</h3>
                    <p className="text-xs text-slate-500">Gradually raises or softens difficulty based on your real-time mastery.</p>
                  </div>
                </div>
              </div>

              <button
                id="onboarding-get-started-btn"
                onClick={() => setStep(1)}
                className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-md shadow-teal-700/20 flex items-center justify-center space-x-2 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 1: Native Language */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Step 1 of 5</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1 font-display">What is your native language?</h2>
                <p className="text-xs text-slate-500 mt-1">LinguaAI uses your native language logic to anticipate common grammar transfers.</p>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'hindi', label: 'Hindi (हिन्दी)', subtitle: 'Perfect for Indian language learners', flag: '🇮🇳' },
                  { id: 'english', label: 'English', subtitle: 'Native English speakers expanding abroad', flag: '🇬🇧' },
                  { id: 'spanish', label: 'Spanish (Español)', subtitle: 'Hispanoamérica y España', flag: '🇪🇸' },
                ].map((lang) => {
                  const isSelected = nativeLanguage === lang.id;
                  return (
                    <button
                      key={lang.id}
                      id={`native-lang-${lang.id}`}
                      onClick={() => {
                        setNativeLanguage(lang.id as Language);
                        if (lang.id === targetLanguage) {
                          setTargetLanguage(lang.id === 'hindi' ? 'english' : lang.id === 'english' ? 'spanish' : 'english');
                        }
                      }}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected 
                          ? 'border-teal-600 bg-teal-50/70 text-slate-900 ring-2 ring-teal-600/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{lang.label}</p>
                          <p className="text-xs text-slate-500">{lang.subtitle}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Target Language */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Step 2 of 5</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1 font-display">Which language do you want to learn?</h2>
                <p className="text-xs text-slate-500 mt-1">Initially optimized for high-impact Hindi → English and English → Spanish.</p>
              </div>

              <div className="space-y-3">
                {[
                  { id: 'english', label: 'English', subtitle: 'Global career, business & conversational fluency', flag: '🇺🇸', popularFor: 'hindi' },
                  { id: 'spanish', label: 'Spanish (Español)', subtitle: 'Castilian & Latin American conversational practice', flag: '🇪🇸', popularFor: 'english' },
                ]
                  .filter(l => l.id !== nativeLanguage)
                  .map((lang) => {
                    const isSelected = targetLanguage === lang.id;
                    return (
                      <button
                        key={lang.id}
                        id={`target-lang-${lang.id}`}
                        onClick={() => setTargetLanguage(lang.id as Language)}
                        className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                          isSelected 
                            ? 'border-teal-600 bg-teal-50/70 text-slate-900 ring-2 ring-teal-600/20' 
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{lang.flag}</span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-semibold text-slate-900">{lang.label}</p>
                              {lang.popularFor === nativeLanguage && (
                                <span className="text-[10px] bg-teal-100 text-teal-800 font-semibold px-2 py-0.5 rounded-full">
                                  Top Match
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{lang.subtitle}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* STEP 3: Current Level */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Step 3 of 5</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1 font-display">What is your current level?</h2>
                <p className="text-xs text-slate-500 mt-1">Be honest! LinguaAI automatically dials difficulty up or down as you practice.</p>
              </div>

              <div className="space-y-2.5">
                {[
                  { level: 'Beginner', desc: 'Know a few isolated words or simple greetings. Need step-by-step guidance.' },
                  { level: 'Elementary', desc: 'Can understand basic phrases but struggle to construct complete sentences.' },
                  { level: 'Intermediate', desc: 'Can hold simple conversations but make frequent grammar mistakes.' },
                  { level: 'Advanced', desc: 'Comfortable speaking; seeking native polish, nuanced vocabulary & accent.' }
                ].map((item) => {
                  const isSelected = level === item.level;
                  return (
                    <button
                      key={item.level}
                      id={`level-option-${item.level.toLowerCase()}`}
                      onClick={() => setLevel(item.level as LearnerLevel)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected 
                          ? 'border-teal-600 bg-teal-50/70 text-slate-900 ring-2 ring-teal-600/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-slate-900">{item.level}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-normal">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Learning Goal */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Step 4 of 5</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1 font-display">What is your primary goal?</h2>
                <p className="text-xs text-slate-500 mt-1">We tailor daily curriculum and interactive exercises around your priority.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { goal: 'Speaking', desc: 'Fluency in daily conversation & real dialogue', icon: '🗣️' },
                  { goal: 'Grammar', desc: 'Correct tenses, verb agreement & sentence structure', icon: '📐' },
                  { goal: 'Vocabulary', desc: 'Expand active lexicon for work and life', icon: '📚' },
                  { goal: 'Pronunciation', desc: 'Clear accent, phonetics & rhythm', icon: '🎙️' },
                  { goal: 'Overall', desc: 'Balanced mastery across all language dimensions', icon: '🌟' }
                ].map((item) => {
                  const isSelected = learningGoal === item.goal;
                  return (
                    <button
                      key={item.goal}
                      id={`goal-option-${item.goal.toLowerCase()}`}
                      onClick={() => setLearningGoal(item.goal as LearningGoal)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected 
                          ? 'border-teal-600 bg-teal-50/70 text-slate-900 ring-2 ring-teal-600/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{item.icon}</span>
                        {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                      </div>
                      <p className="text-sm font-semibold text-slate-900 mt-2">{item.goal}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Daily Time */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Step 5 of 5</span>
                <h2 className="text-xl font-bold text-slate-900 mt-1 font-display">How much time can you commit daily?</h2>
                <p className="text-xs text-slate-500 mt-1">Consistency beats cramming. Short daily sessions build enduring fluency.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { time: 5, label: '5 min / day', desc: 'Micro-learning on the go', badge: 'Casual' },
                  { time: 10, label: '10 min / day', desc: 'Steady, balanced progress', badge: 'Recommended' },
                  { time: 15, label: '15 min / day', desc: 'Accelerated spoken fluency', badge: 'Active' },
                  { time: 30, label: '30 min / day', desc: 'Deep immersion & speed', badge: 'Intensive' }
                ].map((item) => {
                  const isSelected = dailyTime === item.time;
                  return (
                    <button
                      key={item.time}
                      id={`time-option-${item.time}`}
                      onClick={() => setDailyTime(item.time as DailyTime)}
                      className={`p-4 rounded-2xl border text-left transition-all relative ${
                        isSelected 
                          ? 'border-teal-600 bg-teal-50/70 text-slate-900 ring-2 ring-teal-600/20' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Clock className={`w-4 h-4 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isSelected ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-base font-bold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Generation & Learning Plan Preview */}
          {step === 6 && (
            <div className="space-y-6 text-center py-2">
              {isGeneratingPlan ? (
                <div className="space-y-6 py-6">
                  <div className="w-16 h-16 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin mx-auto" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Configuring Your Personal AI Tutor</h3>
                    <p className="text-xs text-teal-700 font-medium mt-2 animate-pulse">
                      {generationStep === 0 && 'Analyzing cross-lingual patterns for your language pair...'}
                      {generationStep === 1 && 'Mapping common L1 transfer mistakes (verb agreement & articles)...'}
                      {generationStep === 2 && 'Calibrating initial difficulty & pacing threshold...'}
                      {generationStep >= 3 && 'Personalized adaptive curriculum ready!'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 text-left">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 font-display">Your Personalized Plan is Ready</h2>
                    <p className="text-xs text-slate-500 mt-1">Calibrated specifically for {nativeLanguage.toUpperCase()} → {targetLanguage.toUpperCase()}</p>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-xs text-slate-500 font-medium">Focus Path</span>
                      <span className="text-xs font-semibold text-teal-800 capitalize">{nativeLanguage} → {targetLanguage} ({level})</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-xs text-slate-500 font-medium">Primary Dimension</span>
                      <span className="text-xs font-semibold text-slate-900">{learningGoal}</span>
                    </div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-xs text-slate-500 font-medium">Daily Target</span>
                      <span className="text-xs font-semibold text-slate-900">{dailyTime} mins / day</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Diagnostic Module 1</span>
                      <span className="text-xs font-semibold text-slate-900">Present Continuous & Daily Actions</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200/60 flex items-start space-x-2.5">
                    <Sparkles className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <p className="text-xs text-teal-900 leading-relaxed">
                      {nativeLanguage === 'hindi' 
                        ? 'LinguaAI will provide explanations in simple Hindi whenever grammar nuances need clarity, and gradually transition to full English.'
                        : 'LinguaAI will explain rules in English and gradually expand your conversational Spanish immersion.'}
                    </p>
                  </div>

                  <button
                    id="onboarding-launch-lesson-btn"
                    onClick={handleFinish}
                    className="w-full py-3.5 px-6 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-md shadow-teal-700/20 flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>Start First Adaptive Lesson</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons for step 1..5 */}
        {step > 0 && step < 6 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
            <button
              id="onboarding-back-btn"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center space-x-1 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              id="onboarding-next-btn"
              onClick={() => {
                if (step === 5) {
                  handleStartGeneration();
                } else {
                  setStep(step + 1);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-sm shadow-teal-700/20 transition-all"
            >
              <span>{step === 5 ? 'Generate My Plan' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
