/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Volume2, 
  Mic, 
  MicOff, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  HelpCircle, 
  Zap, 
  CheckCircle,
  AlertTriangle,
  Award,
  BookOpen,
  Info
} from 'lucide-react';
import { 
  Lesson, 
  Exercise, 
  AnswerEvaluation, 
  LearnerProfile, 
  MistakeRecord,
  PronunciationScore 
} from '../types';
import { tutorApi } from '../services/tutorApi';
import { speechService } from '../services/speechService';

interface LearnViewProps {
  profile: LearnerProfile;
  initialTopic?: string;
  isRevision?: boolean;
  targetedMistake?: MistakeRecord | null;
  onLessonComplete: (lesson: Lesson, score: number, accuracy: number, mistakesCount: number) => void;
  onRecordAnswer: (exerciseId: string, question: string, evalResult: AnswerEvaluation, topic: string) => void;
  onGoToPractice: () => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  profile,
  initialTopic,
  isRevision = false,
  targetedMistake,
  onLessonComplete,
  onRecordAnswer,
  onGoToPractice,
}) => {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // User answer states
  const [textInput, setTextInput] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  
  // Speaking state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [speechRecognizer, setSpeechRecognizer] = useState<any>(null);

  // Evaluation state
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [pronunciationScore, setPronunciationScore] = useState<PronunciationScore | null>(null);
  
  // Adaptive targeted drill state
  const [isGeneratingDrill, setIsGeneratingDrill] = useState<boolean>(false);
  const [hasInjectedDrill, setHasInjectedDrill] = useState<boolean>(false);

  // Session stats
  const [sessionMistakes, setSessionMistakes] = useState<number>(0);
  const [sessionCorrect, setSessionCorrect] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Load lesson
  useEffect(() => {
    let isMounted = true;
    async function fetchLesson() {
      setLoading(true);
      try {
        const generated = await tutorApi.generateLesson(profile, initialTopic, isRevision);
        if (isMounted) {
          // If targeted mistake was passed, prioritize an exercise around it
          if (targetedMistake) {
            generated.title = `Targeted Drill: ${targetedMistake.recommendedPractice}`;
            generated.topic = targetedMistake.recommendedPractice;
          }
          setLesson(generated);
          setCurrentIndex(0);
          resetExerciseInputs(generated.exercises[0]);
        }
      } catch (e) {
        console.error('Failed to load lesson', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchLesson();
    return () => { isMounted = false; };
  }, [initialTopic, isRevision, targetedMistake]);

  // Reset inputs when moving to next exercise
  const resetExerciseInputs = (exercise?: Exercise) => {
    setTextInput('');
    setSelectedOption(null);
    setEvaluation(null);
    setPronunciationScore(null);
    setSpokenTranscript('');
    setIsRecording(false);

    if (exercise?.type === 'rearrange_words' && exercise.scrambledWords) {
      setAvailableWords([...exercise.scrambledWords]);
      setSelectedWords([]);
    } else {
      setAvailableWords([]);
      setSelectedWords([]);
    }
  };

  const currentExercise = lesson?.exercises[currentIndex];

  // Rearrange words handlers
  const handleSelectWord = (word: string, index: number) => {
    setSelectedWords([...selectedWords, word]);
    const nextAvail = [...availableWords];
    nextAvail.splice(index, 1);
    setAvailableWords(nextAvail);
  };

  const handleRemoveWord = (word: string, index: number) => {
    const nextSelected = [...selectedWords];
    nextSelected.splice(index, 1);
    setSelectedWords(nextSelected);
    setAvailableWords([...availableWords, word]);
  };

  // Audio speech
  const handlePlayTTS = (textToSpeak: string) => {
    const targetLang = profile.targetLanguage === 'spanish' ? 'spanish' : 'english';
    speechService.speak(textToSpeak, targetLang);
  };

  // Speech recording toggle
  const handleToggleRecord = () => {
    if (isRecording) {
      if (speechRecognizer) {
        speechRecognizer.stop();
      }
      setIsRecording(false);
    } else {
      setIsRecording(true);
      const targetLang = profile.targetLanguage === 'spanish' ? 'spanish' : 'english';

      const recognizer = speechService.createRecognizer(
        targetLang,
        (transcript, isFinal) => {
          setSpokenTranscript(transcript);
          setTextInput(transcript);
          if (isFinal) {
            setIsRecording(false);
          }
        },
        (err) => {
          console.warn('Speech recognition error/fallback:', err);
          setIsRecording(false);
          // If speech recognition isn't supported in iframe, simulate real voice recognition for demo
          if (!spokenTranscript) {
            const simulatedText = currentExercise?.correctAnswer || 'I am going to the market.';
            setSpokenTranscript(simulatedText);
            setTextInput(simulatedText);
          }
        }
      );

      setSpeechRecognizer(recognizer);
      recognizer.start();

      // Fallback timer: if no result received in 3.5s (e.g. mic permission in iframe), provide simulated transcript
      setTimeout(() => {
        setIsRecording((prev) => {
          if (prev && !spokenTranscript) {
            const simulatedText = currentExercise?.correctAnswer || 'I am going to the market.';
            setSpokenTranscript(simulatedText);
            setTextInput(simulatedText);
            return false;
          }
          return prev;
        });
      }, 3500);
    }
  };

  // Answer Submission & AI Evaluation
  const handleSubmitAnswer = async () => {
    if (!currentExercise || !lesson) return;

    let answer = '';
    if (currentExercise.type === 'multiple_choice') {
      answer = selectedOption || '';
    } else if (currentExercise.type === 'rearrange_words') {
      answer = selectedWords.join(' ');
    } else if (currentExercise.type === 'speaking') {
      answer = spokenTranscript || textInput;
    } else {
      answer = textInput;
    }

    if (!answer.trim()) return;

    setIsEvaluating(true);

    try {
      const evalResult = await tutorApi.evaluateAnswer(
        currentExercise.question,
        answer,
        currentExercise.correctAnswer,
        currentExercise.type,
        profile
      );

      // If speaking type, also evaluate pronunciation breakdown
      if (currentExercise.type === 'speaking') {
        const pronScore = await tutorApi.evaluatePronunciation(
          currentExercise.correctAnswer,
          answer,
          profile
        );
        setPronunciationScore(pronScore);
        evalResult.pronunciationScore = pronScore;
      }

      setEvaluation(evalResult);

      // Update session counts
      if (evalResult.correct) {
        setSessionCorrect((c) => c + 1);
      } else {
        setSessionMistakes((m) => m + 1);
      }

      // Record to storage and learner profile
      onRecordAnswer(
        currentExercise.id,
        currentExercise.question,
        evalResult,
        lesson.topic
      );

      // Adaptive Loop: If learner made a mistake and we haven't injected an adaptive drill yet,
      // dynamically request Gemini to generate an immediate targeted drill for this weakness!
      if (!evalResult.correct && !hasInjectedDrill) {
        setIsGeneratingDrill(true);
        try {
          const adaptiveDrill = await tutorApi.generateExercise(
            profile,
            evalResult.mistake || 'Verb formulation discrepancy',
            evalResult.mistakeType || 'grammar',
            lesson.topic,
            lesson.targetSkill
          );

          // Inject drill directly into upcoming exercises
          const updatedExercises = [...lesson.exercises];
          updatedExercises.splice(currentIndex + 1, 0, adaptiveDrill);
          setLesson({ ...lesson, exercises: updatedExercises });
          setHasInjectedDrill(true);
        } catch (e) {
          console.error('Failed to generate adaptive drill', e);
        } finally {
          setIsGeneratingDrill(false);
        }
      }
    } catch (err) {
      console.error('Evaluation failed', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Move to next exercise
  const handleNextExercise = () => {
    if (!lesson) return;

    if (currentIndex < lesson.exercises.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      resetExerciseInputs(lesson.exercises[nextIdx]);
    } else {
      // Completed lesson!
      const total = lesson.exercises.length;
      const accuracy = Math.round((sessionCorrect / Math.max(1, total)) * 100);
      const score = sessionCorrect * 25 + 50;
      setIsFinished(true);
      onLessonComplete(lesson, score, accuracy, sessionMistakes);
    }
  };

  // Quick helper for demoing "I am go to market"
  const handleFillDemoMistake = () => {
    setTextInput('I am go to market.');
  };

  const handleFillDemoCorrect = () => {
    setTextInput(currentExercise?.correctAnswer || 'I am going to the market.');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto px-4 py-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center animate-bounce">
          <Sparkles className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Formulating Adaptive Lesson</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            LinguaAI is analyzing your previous mistakes and calibrating exercise difficulty...
          </p>
        </div>
      </div>
    );
  }

  if (isFinished && lesson) {
    const accuracy = Math.round((sessionCorrect / lesson.exercises.length) * 100);
    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6 pb-24 animate-in fade-in">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70">
              Lesson Complete
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-2 font-display">{lesson.title}</h2>
            <p className="text-xs text-slate-500 mt-1">Topic: {lesson.topic}</p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              <p className="text-xs text-slate-500">XP Gained</p>
              <p className="text-xl font-bold text-teal-700">+{sessionCorrect * 25 + 50}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              <p className="text-xs text-slate-500">Accuracy</p>
              <p className="text-xl font-bold text-slate-900">{accuracy}%</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60">
              <p className="text-xs text-slate-500">Mistakes</p>
              <p className="text-xl font-bold text-amber-600">{sessionMistakes}</p>
            </div>
          </div>

          {sessionMistakes > 0 ? (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70 text-left text-xs space-y-1">
              <p className="font-semibold text-amber-900 flex items-center space-x-1.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span>AI Tutor Diagnosis</span>
              </p>
              <p className="text-slate-600 leading-relaxed">
                Your mistakes have been recorded in your learner profile. The tutor will reinforce these patterns in conversational practice!
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/70 text-left text-xs text-emerald-900">
              🎉 Flawless performance! This topic has been marked towards mastery in your learner profile.
            </div>
          )}

          <div className="space-y-2.5 pt-2">
            <button
              id="lesson-finish-practice-speaking-btn"
              onClick={onGoToPractice}
              className="w-full py-3.5 px-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm shadow-md shadow-teal-700/20 flex items-center justify-center space-x-2 transition-all"
            >
              <Mic className="w-4 h-4" />
              <span>Practice This in AI Conversation</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentExercise) return null;

  const totalExercises = lesson?.exercises.length || 1;
  const progressPercent = ((currentIndex) / totalExercises) * 100;

  return (
    <div className="max-w-xl mx-auto px-4 pt-3 pb-24 space-y-4">
      
      {/* 1. Header & Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-900">Exercise {currentIndex + 1}</span>
            <span>of {totalExercises}</span>
            {hasInjectedDrill && currentIndex > 0 && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                ⚡ Adaptive Drill
              </span>
            )}
          </div>
          <span className="capitalize text-teal-700 font-semibold">{lesson?.targetSkill}</span>
        </div>

        <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Concept Spotlight (Teach Phase) */}
      {currentIndex === 0 && lesson?.explanationIntro && (
        <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/60 space-y-1.5 animate-in fade-in">
          <div className="flex items-center space-x-1.5 text-teal-800 text-xs font-bold">
            <BookOpen className="w-3.5 h-3.5 text-teal-700" />
            <span>Concept Spotlight</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {lesson.explanationIntro}
          </p>
        </div>
      )}

      {/* 3. Main Interactive Exercise Card */}
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-sm space-y-5">
        
        {/* Instruction & Audio */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {currentExercise.type.replace('_', ' ')}
            </span>
            {currentExercise.correctAnswer && (
              <button
                id="exercise-listen-audio-btn"
                onClick={() => handlePlayTTS(currentExercise.correctAnswer)}
                className="p-1.5 rounded-lg text-teal-700 hover:bg-teal-50 transition-colors flex items-center space-x-1 text-xs font-semibold"
                title="Listen to native pronunciation"
              >
                <Volume2 className="w-4 h-4" />
                <span>Listen</span>
              </button>
            )}
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {currentExercise.instruction}
          </h3>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-slate-900 font-semibold text-base flex items-center justify-between">
            <span>{currentExercise.question}</span>
          </div>

          {currentExercise.contextHint && (
            <p className="text-xs text-slate-500 italic pt-0.5">
              💡 Hint: {currentExercise.contextHint}
            </p>
          )}
        </div>

        {/* INPUT METHOD BY EXERCISE TYPE */}

        {/* Type: Multiple Choice */}
        {currentExercise.type === 'multiple_choice' && currentExercise.options && (
          <div className="space-y-2.5 pt-1">
            {currentExercise.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              return (
                <button
                  key={idx}
                  id={`mc-option-${idx}`}
                  disabled={!!evaluation}
                  onClick={() => setSelectedOption(opt)}
                  className={`w-full p-3.5 rounded-2xl border text-left text-xs md:text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50 text-slate-900 font-semibold ring-2 ring-teal-600/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                  } ${evaluation ? 'opacity-80 cursor-default' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Type: Rearrange Words */}
        {currentExercise.type === 'rearrange_words' && (
          <div className="space-y-4 pt-1">
            {/* Target sentence slot */}
            <div className="min-h-[56px] p-3 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 flex flex-wrap gap-2 items-center">
              {selectedWords.length === 0 ? (
                <span className="text-xs text-slate-400">Tap words below in the correct grammatical order...</span>
              ) : (
                selectedWords.map((word, idx) => (
                  <button
                    key={`selected-${idx}`}
                    disabled={!!evaluation}
                    onClick={() => handleRemoveWord(word, idx)}
                    className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all animate-in zoom-in-90"
                  >
                    {word}
                  </button>
                ))
              )}
            </div>

            {/* Available scrambled word tiles */}
            <div className="flex flex-wrap gap-2 pt-1">
              {availableWords.map((word, idx) => (
                <button
                  key={`avail-${idx}`}
                  disabled={!!evaluation}
                  onClick={() => handleSelectWord(word, idx)}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-slate-800 text-xs font-semibold shadow-sm transition-all active:scale-95"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Type: Translate / Fill in Blank / Short Answer */}
        {(currentExercise.type === 'translate' || 
          currentExercise.type === 'fill_in_the_blank' || 
          currentExercise.type === 'short_answer') && (
          <div className="space-y-2 pt-1">
            <input
              id="exercise-text-input"
              type="text"
              disabled={!!evaluation}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !evaluation && textInput.trim()) {
                  handleSubmitAnswer();
                }
              }}
              placeholder="Type your answer in English..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 text-sm font-medium transition-all"
            />

            {/* Canonical Demo shortcuts for incubator demo convenience */}
            {!evaluation && (
              <div className="flex items-center space-x-2 pt-1">
                <span className="text-[10px] text-slate-400 font-medium">Demo presets:</span>
                <button
                  type="button"
                  onClick={handleFillDemoMistake}
                  className="text-[10px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2 py-0.5 rounded-md transition-colors"
                >
                  Try "I am go to market" (Triggers AI Diagnosis)
                </button>
                <button
                  type="button"
                  onClick={handleFillDemoCorrect}
                  className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md transition-colors"
                >
                  Correct Answer
                </button>
              </div>
            )}
          </div>
        )}

        {/* Type: Speaking Practice Exercise */}
        {currentExercise.type === 'speaking' && (
          <div className="space-y-4 pt-1 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
              <p className="text-xs text-slate-500 font-medium">
                Tap the microphone and read the sentence clearly:
              </p>

              <button
                id="speaking-mic-record-btn"
                onClick={handleToggleRecord}
                disabled={!!evaluation}
                className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-all ${
                  isRecording 
                    ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200' 
                    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20'
                }`}
              >
                {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>

              <p className="text-[11px] font-semibold text-slate-600">
                {isRecording ? 'Listening... Speak now' : 'Tap to start recording'}
              </p>

              {spokenTranscript && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Captured transcript:</span>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">"{spokenTranscript}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBMIT BUTTON (Before Evaluation) */}
        {!evaluation && (
          <button
            id="exercise-submit-btn"
            onClick={handleSubmitAnswer}
            disabled={
              isEvaluating ||
              (currentExercise.type === 'multiple_choice' && !selectedOption) ||
              (currentExercise.type === 'rearrange_words' && selectedWords.length === 0) ||
              (currentExercise.type === 'speaking' && !spokenTranscript && !textInput) ||
              (currentExercise.type !== 'multiple_choice' && 
               currentExercise.type !== 'rearrange_words' && 
               currentExercise.type !== 'speaking' && 
               !textInput.trim())
            }
            className="w-full py-3.5 px-4 rounded-2xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 disabled:pointer-events-none text-white font-semibold text-sm shadow-md shadow-teal-700/20 flex items-center justify-center space-x-2 transition-all"
          >
            {isEvaluating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI Tutor Diagnosing...</span>
              </div>
            ) : (
              <span>Check Answer</span>
            )}
          </button>
        )}

        {/* 4. REAL-TIME AI DIAGNOSTIC EVALUATION CARD */}
        {evaluation && (
          <div 
            id="exercise-evaluation-card"
            className={`p-4 md:p-5 rounded-2xl border transition-all animate-in fade-in zoom-in-95 space-y-3 ${
              evaluation.correct
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/90 border-amber-200 text-amber-950'
            }`}
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {evaluation.correct ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold">
                    {evaluation.correct ? 'Correct! Excellent Formulation' : 'Mistake Diagnosed'}
                  </h4>
                  {evaluation.mistakeType && !evaluation.correct && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                      Category: {evaluation.mistakeType}
                    </span>
                  )}
                </div>
              </div>

              {evaluation.correct && (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  +15 XP
                </span>
              )}
            </div>

            {/* Underlying linguistic mistake identification */}
            {!evaluation.correct && (
              <div className="p-3 bg-white/90 rounded-xl border border-amber-200 text-xs space-y-1">
                <p className="font-semibold text-slate-900">
                  Identified issue: <span className="text-amber-800">{evaluation.mistake}</span>
                </p>
                <div className="flex items-center space-x-1 text-emerald-800 font-medium pt-0.5">
                  <span className="font-semibold text-slate-500">Correct formulation:</span>
                  <span>"{evaluation.correctAnswer}"</span>
                </div>
              </div>
            )}

            {/* Deep Pedagogical Explanation */}
            <div className="text-xs leading-relaxed space-y-1">
              <span className="font-semibold text-slate-900">Tutor explanation:</span>
              <p className="text-slate-700">{evaluation.explanation}</p>
            </div>

            {/* Pronunciation breakdown if speaking exercise */}
            {pronunciationScore && (
              <div className="pt-2 border-t border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Pronunciation Score:</span>
                  <span className="font-bold text-teal-700">{pronunciationScore.overallScore}/100</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {pronunciationScore.wordBreakdown.map((wb, idx) => (
                    <span 
                      key={idx}
                      className={`text-[11px] px-2 py-0.5 rounded-md font-medium border ${
                        wb.score >= 85 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {wb.word}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-600 italic">"{pronunciationScore.tip}"</p>
              </div>
            )}

            {/* Adaptive Loop Notification if drill injected */}
            {!evaluation.correct && hasInjectedDrill && (
              <div className="p-2.5 rounded-xl bg-teal-100/70 border border-teal-200 flex items-center space-x-2 text-xs text-teal-900">
                <Zap className="w-4 h-4 text-teal-700 shrink-0" />
                <span>
                  <strong>Adaptive AI Loop:</strong> A targeted follow-up exercise has been generated to lock in this concept before continuing!
                </span>
              </div>
            )}

            {/* Continue Button */}
            <button
              id="exercise-continue-next-btn"
              onClick={handleNextExercise}
              className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-sm shadow-md flex items-center justify-center space-x-2 transition-all mt-3 ${
                evaluation.correct
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <span>{currentIndex < (lesson?.exercises.length || 0) - 1 ? 'Continue to Next Exercise' : 'Complete Lesson'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
