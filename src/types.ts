/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'hindi' | 'english' | 'spanish';

export type LearnerLevel = 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced';

export type LearningGoal = 'Speaking' | 'Grammar' | 'Vocabulary' | 'Pronunciation' | 'Overall';

export type DailyTime = 5 | 10 | 15 | 30;

export type MistakeType = 
  | 'grammar' 
  | 'vocabulary' 
  | 'sentence_construction' 
  | 'pronunciation' 
  | 'spelling' 
  | 'other';

export interface MistakeRecord {
  id: string;
  timestamp: number;
  mistakeType: MistakeType;
  mistake: string;
  userAnswer: string;
  correctAnswer: string;
  contextQuestion: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high';
  recommendedPractice: string;
  repeatCount: number;
  resolved: boolean;
}

export type ExerciseType = 
  | 'multiple_choice' 
  | 'fill_in_the_blank' 
  | 'translate' 
  | 'rearrange_words' 
  | 'short_answer' 
  | 'speaking';

export interface Exercise {
  id: string;
  type: ExerciseType;
  instruction: string;
  question: string;
  contextHint?: string;
  options?: string[];
  scrambledWords?: string[];
  correctAnswer: string;
  acceptableAnswers?: string[];
  explanation: string;
  mistakeCategory: MistakeType;
  difficulty: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  targetSkill: string;
  audioPrompt?: string;
}

export interface PronunciationScore {
  overallScore: number; // 0 - 100
  accuracyScore: number;
  fluencyScore: number;
  wordBreakdown: {
    word: string;
    score: number;
    phonetic?: string;
    tip?: string;
  }[];
  tip: string;
}

export interface AnswerEvaluation {
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
  mistakeType?: MistakeType;
  mistake?: string;
  explanation: string;
  severity?: 'low' | 'medium' | 'high';
  recommendedPractice?: string;
  feedbackEncouragement?: string;
  pronunciationScore?: PronunciationScore;
}

export interface Lesson {
  id: string;
  title: string;
  topic: string;
  targetSkill: string;
  difficulty: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  phase: 'assess' | 'teach' | 'practice' | 'correct' | 'reassess' | 'adapt';
  explanationIntro: string;
  exercises: Exercise[];
  targetedWeakness?: string;
  isRevision?: boolean;
}

export interface LearnerProfile {
  id: string;
  nativeLanguage: Language;
  targetLanguage: Language;
  level: LearnerLevel;
  learningGoal: LearningGoal;
  dailyTime: DailyTime;
  xp: number;
  streak: number;
  lastActiveDate: string;
  vocabularyLearned: string[];
  grammarWeaknesses: { topic: string; count: number; lastDetected: string }[];
  repeatedMistakes: MistakeRecord[];
  masteredTopics: string[];
  topicsNeedingRevision: string[];
  currentDifficulty: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  lessonHistory: {
    lessonId: string;
    date: string;
    accuracy: number;
    score: number;
    mistakesCount: number;
    topic: string;
  }[];
  stats: {
    totalExercisesAnswered: number;
    correctAnswers: number;
    speakingMinutes: number;
    pronunciationAvg: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: number;
  translation?: string;
  corrections?: {
    original: string;
    corrected: string;
    reason: string;
  }[];
  quickReplies?: string[];
  audioUrl?: string;
}

export type ActiveTab = 'home' | 'learn' | 'practice' | 'progress' | 'profile';
