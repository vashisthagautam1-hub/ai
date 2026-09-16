/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LearnerProfile, MistakeRecord, Lesson, AnswerEvaluation } from '../types';

const PROFILE_STORAGE_KEY = 'linguaai_learner_profile_v1';
const LESSONS_STORAGE_KEY = 'linguaai_saved_lessons_v1';

export const DEFAULT_PROFILE: LearnerProfile = {
  id: 'learner-demo-1',
  nativeLanguage: 'hindi',
  targetLanguage: 'english',
  level: 'Beginner',
  learningGoal: 'Speaking',
  dailyTime: 15,
  xp: 180,
  streak: 3,
  lastActiveDate: new Date().toISOString().split('T')[0],
  vocabularyLearned: [
    'greetings', 'market', 'commute', 'delicious', 'schedule', 'polite', 'introduce'
  ],
  grammarWeaknesses: [
    { topic: 'Present Continuous (is/am/are + verb-ing)', count: 3, lastDetected: 'Today' },
    { topic: 'Subject-Verb Agreement (he goes vs he go)', count: 2, lastDetected: 'Yesterday' }
  ],
  repeatedMistakes: [
    {
      id: 'mistake-demo-1',
      timestamp: Date.now() - 3600 * 1000 * 2,
      mistakeType: 'grammar',
      mistake: 'incorrect verb structure ("am go" instead of "am going")',
      userAnswer: 'I am go to market.',
      correctAnswer: 'I am going to the market.',
      contextQuestion: 'Translate: मैं बाज़ार जा रहा हूँ।',
      explanation: 'In English, with "am/is/are", use verb + ing for ongoing actions (present continuous). Also include the article "the market".',
      severity: 'medium',
      recommendedPractice: 'Present Continuous Tense',
      repeatCount: 2,
      resolved: false,
    },
    {
      id: 'mistake-demo-2',
      timestamp: Date.now() - 3600 * 1000 * 24,
      mistakeType: 'sentence_construction',
      mistake: 'Missing article "a" / "the"',
      userAnswer: 'She is doctor in hospital.',
      correctAnswer: 'She is a doctor in a hospital.',
      contextQuestion: 'Translate: वह अस्पताल में डॉक्टर है।',
      explanation: 'Countable singular professions in English always take an indefinite article "a/an".',
      severity: 'low',
      recommendedPractice: 'Articles: A, An, The',
      repeatCount: 1,
      resolved: false,
    }
  ],
  masteredTopics: [
    'Basic Greetings (Namaste / Hello)',
    'Introducing Yourself (My name is...)',
    'Numbers 1-50'
  ],
  topicsNeedingRevision: [
    'Present Continuous vs Simple Present',
    'Articles with Singular Nouns'
  ],
  currentDifficulty: 'beginner',
  lessonHistory: [
    {
      lessonId: 'lesson-hist-1',
      date: 'Yesterday',
      accuracy: 80,
      score: 120,
      mistakesCount: 1,
      topic: 'Everyday Travel & Commute'
    }
  ],
  stats: {
    totalExercisesAnswered: 24,
    correctAnswers: 19,
    speakingMinutes: 14,
    pronunciationAvg: 82
  }
};

export const storageService = {
  getProfile(): LearnerProfile | null {
    try {
      const data = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  saveProfile(profile: LearnerProfile): void {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  },

  createProfile(init: Partial<LearnerProfile>): LearnerProfile {
    const profile: LearnerProfile = {
      ...DEFAULT_PROFILE,
      ...init,
      id: 'learner-' + Math.random().toString(36).substring(2, 9),
      lastActiveDate: new Date().toISOString().split('T')[0],
      repeatedMistakes: init.repeatedMistakes || [],
      grammarWeaknesses: init.grammarWeaknesses || [],
      masteredTopics: init.masteredTopics || [],
      topicsNeedingRevision: init.topicsNeedingRevision || [],
      vocabularyLearned: init.vocabularyLearned || ['hello', 'please', 'thank you'],
      lessonHistory: init.lessonHistory || [],
      stats: {
        totalExercisesAnswered: 0,
        correctAnswers: 0,
        speakingMinutes: 0,
        pronunciationAvg: 85
      }
    };
    this.saveProfile(profile);
    return profile;
  },

  recordExerciseAnswer(
    profile: LearnerProfile,
    exerciseId: string,
    questionText: string,
    evaluation: AnswerEvaluation,
    topic: string
  ): LearnerProfile {
    const updated = { ...profile };
    updated.stats.totalExercisesAnswered += 1;

    if (evaluation.correct) {
      updated.stats.correctAnswers += 1;
      updated.xp += 15;

      // Check if this resolved an existing repeated mistake
      if (evaluation.recommendedPractice) {
        updated.repeatedMistakes = updated.repeatedMistakes.map(m => {
          if (m.recommendedPractice.toLowerCase() === evaluation.recommendedPractice?.toLowerCase()) {
            return { ...m, resolved: true };
          }
          return m;
        });
      }

      // If learner answered correctly and difficulty was beginner, check if can scale
      if (updated.stats.correctAnswers % 8 === 0 && updated.currentDifficulty === 'beginner') {
        updated.currentDifficulty = 'elementary';
      }
    } else {
      // Mistake occurred
      const mistakeType = evaluation.mistakeType || 'grammar';
      const mistakeTitle = evaluation.mistake || 'Incorrect formulation';
      const practiceTopic = evaluation.recommendedPractice || topic || 'General Grammar';

      // Check if already in repeated mistakes
      const existingIdx = updated.repeatedMistakes.findIndex(
        m => m.mistake.toLowerCase().includes(mistakeTitle.toLowerCase()) || 
             m.recommendedPractice.toLowerCase() === practiceTopic.toLowerCase()
      );

      if (existingIdx >= 0) {
        const existing = updated.repeatedMistakes[existingIdx];
        updated.repeatedMistakes[existingIdx] = {
          ...existing,
          repeatCount: existing.repeatCount + 1,
          timestamp: Date.now(),
          userAnswer: evaluation.userAnswer,
          correctAnswer: evaluation.correctAnswer,
          resolved: false,
          explanation: evaluation.explanation,
        };
      } else {
        const newRecord: MistakeRecord = {
          id: 'mistake-' + Date.now(),
          timestamp: Date.now(),
          mistakeType,
          mistake: mistakeTitle,
          userAnswer: evaluation.userAnswer,
          correctAnswer: evaluation.correctAnswer,
          contextQuestion: questionText,
          explanation: evaluation.explanation,
          severity: evaluation.severity || 'medium',
          recommendedPractice: practiceTopic,
          repeatCount: 1,
          resolved: false,
        };
        updated.repeatedMistakes.unshift(newRecord);
      }

      // Add to grammar weaknesses
      const weakIdx = updated.grammarWeaknesses.findIndex(w => w.topic.toLowerCase() === practiceTopic.toLowerCase());
      if (weakIdx >= 0) {
        updated.grammarWeaknesses[weakIdx].count += 1;
        updated.grammarWeaknesses[weakIdx].lastDetected = 'Just now';
      } else {
        updated.grammarWeaknesses.push({
          topic: practiceTopic,
          count: 1,
          lastDetected: 'Just now'
        });
      }

      // Add to topics needing revision
      if (!updated.topicsNeedingRevision.includes(practiceTopic)) {
        updated.topicsNeedingRevision.push(practiceTopic);
      }
    }

    this.saveProfile(updated);
    return updated;
  },

  recordLessonComplete(profile: LearnerProfile, lesson: Lesson, score: number, accuracy: number, mistakesCount: number): LearnerProfile {
    const updated = { ...profile };
    updated.xp += score;
    updated.lessonHistory.unshift({
      lessonId: lesson.id,
      date: 'Today',
      accuracy,
      score,
      mistakesCount,
      topic: lesson.topic
    });

    if (accuracy >= 80 && !updated.masteredTopics.includes(lesson.topic)) {
      updated.masteredTopics.push(lesson.topic);
      // Remove from revision if previously there
      updated.topicsNeedingRevision = updated.topicsNeedingRevision.filter(t => t !== lesson.topic);
    }

    this.saveProfile(updated);
    return updated;
  },

  resetToDemo(): LearnerProfile {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem(LESSONS_STORAGE_KEY);
    return DEFAULT_PROFILE;
  }
};
