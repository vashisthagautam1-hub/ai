/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LearnerProfile, 
  ActiveTab, 
  MistakeRecord, 
  Lesson, 
  AnswerEvaluation,
  Language,
  LearnerLevel,
  LearningGoal,
  DailyTime
} from './types';
import { storageService, DEFAULT_PROFILE } from './services/storageService';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { OnboardingModal } from './components/OnboardingModal';
import { HomeDashboard } from './components/HomeDashboard';
import { LearnView } from './components/LearnView';
import { PracticeView } from './components/PracticeView';
import { ProgressView } from './components/ProgressView';
import { ProfileView } from './components/ProfileView';

export default function App() {
  const [profile, setProfile] = useState<LearnerProfile>(() => {
    return storageService.getProfile() || DEFAULT_PROFILE;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [lessonTopic, setLessonTopic] = useState<string | undefined>(undefined);
  const [isRevision, setIsRevision] = useState<boolean>(false);
  const [targetedMistake, setTargetedMistake] = useState<MistakeRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check if first time user
  useEffect(() => {
    const existing = storageService.getProfile();
    if (!existing) {
      setShowOnboarding(true);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Onboarding completion handler
  const handleOnboardingComplete = (data: {
    nativeLanguage: Language;
    targetLanguage: Language;
    level: LearnerLevel;
    learningGoal: LearningGoal;
    dailyTime: DailyTime;
  }) => {
    const newProfile = storageService.createProfile({
      ...data,
      grammarWeaknesses: data.targetLanguage === 'english' && data.nativeLanguage === 'hindi'
        ? [
            { topic: 'Present Continuous (is/am/are + verb-ing)', count: 2, lastDetected: 'Diagnostic test' },
            { topic: 'Articles (a, an, the)', count: 1, lastDetected: 'Diagnostic test' }
          ]
        : [
            { topic: 'Ser vs Estar distinction', count: 2, lastDetected: 'Diagnostic test' }
          ],
      repeatedMistakes: data.targetLanguage === 'english' && data.nativeLanguage === 'hindi'
        ? [
            {
              id: 'initial-mistake-1',
              timestamp: Date.now(),
              mistakeType: 'grammar',
              mistake: 'incorrect verb structure ("am go" instead of "am going")',
              userAnswer: 'I am go to market.',
              correctAnswer: 'I am going to the market.',
              contextQuestion: 'Translate: मैं बाज़ार जा रहा हूँ।',
              explanation: 'Hindi speakers often omit "-ing" when using "am". Ongoing actions require verb-ing ("I am going").',
              severity: 'medium',
              recommendedPractice: 'Present Continuous Tense',
              repeatCount: 1,
              resolved: false,
            }
          ]
        : [],
    });

    setProfile(newProfile);
    setShowOnboarding(false);
    setActiveTab('learn');
    setLessonTopic(undefined);
    setTargetedMistake(null);
    showToast('Personalized AI curriculum generated! Starting lesson 1.');
  };

  // Start Lesson Handler
  const handleStartLesson = (topic?: string, revision = false) => {
    setLessonTopic(topic);
    setIsRevision(revision);
    setTargetedMistake(null);
    setActiveTab('learn');
  };

  // Drill specific diagnosed mistake
  const handleDrillMistake = (mistake: MistakeRecord) => {
    setTargetedMistake(mistake);
    setLessonTopic(mistake.recommendedPractice);
    setIsRevision(true);
    setActiveTab('learn');
    showToast(`Targeting diagnosed weakness: ${mistake.recommendedPractice}`);
  };

  // Record exercise answer
  const handleRecordAnswer = (
    exerciseId: string,
    question: string,
    evalResult: AnswerEvaluation,
    topic: string
  ) => {
    const updated = storageService.recordExerciseAnswer(
      profile,
      exerciseId,
      question,
      evalResult,
      topic
    );
    setProfile(updated);
  };

  // Record lesson completion
  const handleLessonComplete = (
    lesson: Lesson,
    score: number,
    accuracy: number,
    mistakesCount: number
  ) => {
    const updated = storageService.recordLessonComplete(
      profile,
      lesson,
      score,
      accuracy,
      mistakesCount
    );
    setProfile(updated);
    showToast(`+${score} XP earned! Lesson progress updated.`);
  };

  // Preset Switcher for Investors/Incubator Demo
  const handleLoadPreset = (preset: 'hindi_english' | 'english_spanish') => {
    if (preset === 'hindi_english') {
      const p = storageService.createProfile({
        nativeLanguage: 'hindi',
        targetLanguage: 'english',
        level: 'Beginner',
        learningGoal: 'Speaking',
        dailyTime: 15,
        grammarWeaknesses: [
          { topic: 'Present Continuous (is/am/are + verb-ing)', count: 3, lastDetected: 'Today' },
          { topic: 'Subject-Verb Agreement (he goes vs he go)', count: 2, lastDetected: 'Yesterday' }
        ],
        repeatedMistakes: [
          {
            id: 'preset-mistake-1',
            timestamp: Date.now() - 3600 * 1000 * 2,
            mistakeType: 'grammar',
            mistake: 'incorrect verb structure ("am go" instead of "am going")',
            userAnswer: 'I am go to market.',
            correctAnswer: 'I am going to the market.',
            contextQuestion: 'Translate: मैं बाज़ार जा रहा हूँ।',
            explanation: 'In English, with "am/is/are", use verb + ing for ongoing actions (present continuous). Never say "am go".',
            severity: 'medium',
            recommendedPractice: 'Present Continuous Tense',
            repeatCount: 2,
            resolved: false,
          }
        ],
        masteredTopics: ['Basic Greetings (Namaste / Hello)', 'Introducing Yourself'],
        topicsNeedingRevision: ['Present Continuous Tense']
      });
      setProfile(p);
      showToast('Loaded Hindi → English demo profile with diagnosed verb error.');
    } else {
      const p = storageService.createProfile({
        nativeLanguage: 'english',
        targetLanguage: 'spanish',
        level: 'Beginner',
        learningGoal: 'Speaking',
        dailyTime: 15,
        grammarWeaknesses: [
          { topic: 'Ser vs Estar distinction', count: 2, lastDetected: 'Today' }
        ],
        repeatedMistakes: [
          {
            id: 'preset-sp-1',
            timestamp: Date.now() - 3600 * 1000,
            mistakeType: 'grammar',
            mistake: 'Ser used instead of Estar for temporary state',
            userAnswer: 'Soy cansado hoy.',
            correctAnswer: 'Estoy cansado hoy.',
            contextQuestion: 'Translate: I am tired today.',
            explanation: 'Use "Estar" for physical states, health, or temporary emotions, not "Ser".',
            severity: 'medium',
            recommendedPractice: 'Ser vs Estar in Daily Contexts',
            repeatCount: 1,
            resolved: false,
          }
        ],
        masteredTopics: ['Spanish Greetings (Hola, Buenos Días)'],
        topicsNeedingRevision: ['Ser vs Estar in Daily Contexts']
      });
      setProfile(p);
      showToast('Loaded English → Spanish demo profile.');
    }
  };

  const handleResetDemo = () => {
    const reset = storageService.resetToDemo();
    setProfile(reset);
    showToast('Reset to initial demo learner state.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-top-3 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        profile={profile}
        onOpenProfile={() => setActiveTab('profile')}
        onResetDemo={handleResetDemo}
        onRestartOnboarding={() => setShowOnboarding(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 overflow-x-hidden">
        {activeTab === 'home' && (
          <HomeDashboard
            profile={profile}
            onStartLesson={handleStartLesson}
            onStartSpeaking={() => setActiveTab('practice')}
            onDrillMistake={handleDrillMistake}
          />
        )}

        {activeTab === 'learn' && (
          <LearnView
            profile={profile}
            initialTopic={lessonTopic}
            isRevision={isRevision}
            targetedMistake={targetedMistake}
            onLessonComplete={handleLessonComplete}
            onRecordAnswer={handleRecordAnswer}
            onGoToPractice={() => setActiveTab('practice')}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeView profile={profile} />
        )}

        {activeTab === 'progress' && (
          <ProgressView
            profile={profile}
            onDrillMistake={handleDrillMistake}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            profile={profile}
            onUpdateProfile={(updated) => {
              storageService.saveProfile(updated);
              setProfile(updated);
              showToast('Profile updated successfully.');
            }}
            onRestartOnboarding={() => setShowOnboarding(true)}
            onLoadPreset={handleLoadPreset}
          />
        )}
      </main>

      {/* Persistent Bottom Mobile Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          // If switching to learn directly from nav, reset targeted mistake to normal curriculum
          if (tab === 'learn' && activeTab !== 'learn') {
            setLessonTopic(undefined);
            setTargetedMistake(null);
          }
        }}
        hasActiveMistakes={profile.repeatedMistakes.some((m) => !m.resolved)}
      />

      {/* Onboarding Flow Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
      />

    </div>
  );
}
