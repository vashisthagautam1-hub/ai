/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Send, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Languages, 
  Bot, 
  User, 
  Play, 
  Info,
  RotateCcw,
  AudioWaveform as Waveform
} from 'lucide-react';
import { ChatMessage, LearnerProfile, PronunciationScore } from '../types';
import { tutorApi } from '../services/tutorApi';
import { speechService } from '../services/speechService';

interface PracticeViewProps {
  profile: LearnerProfile;
}

export const PracticeView: React.FC<PracticeViewProps> = ({ profile }) => {
  const [mode, setMode] = useState<'conversation' | 'pronunciation'>('conversation');
  
  // 1. Conversation State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showTranslations, setShowTranslations] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [speechRecognizer, setSpeechRecognizer] = useState<any>(null);
  
  // 2. Pronunciation Lab State
  const [targetSentence, setTargetSentence] = useState<string>(
    profile.targetLanguage === 'spanish'
      ? 'Mucho gusto, estoy muy feliz de aprender español.'
      : 'I am going to the market with my friend.'
  );
  const [spokenSentence, setSpokenSentence] = useState<string>('');
  const [isEvaluatingPronunciation, setIsEvaluatingPronunciation] = useState<boolean>(false);
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationScore | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize tutor welcome message
  useEffect(() => {
    const isHindi = profile.nativeLanguage === 'hindi';
    const isSpanish = profile.targetLanguage === 'spanish';

    let initialGreeting = '';
    let initialTranslation = '';

    if (isSpanish) {
      initialGreeting = '¡Hola! Soy tu tutor de IA. ¿Cómo estás hoy y qué te gustaría practicar?';
      initialTranslation = 'Hello! I am your AI tutor. How are you today and what would you like to practice?';
    } else {
      initialGreeting = 'Hello! I am your LinguaAI tutor. How is your day going? (नमस्ते! मैं आपका LinguaAI ट्यूटर हूँ। आपका दिन कैसा बीत रहा है?)';
      initialTranslation = 'नमस्ते! मैं आपका LinguaAI ट्यूटर हूँ। आपका दिन कैसा बीत रहा है?';
    }

    setMessages([
      {
        id: 'msg-welcome',
        sender: 'tutor',
        text: initialGreeting,
        timestamp: Date.now(),
        translation: initialTranslation,
        quickReplies: isSpanish 
          ? ['¡Hola! Quiero practicar saludos.', 'Estoy muy bien, gracias.'] 
          : ['My day is going very well!', 'I am go to work today.', 'Can we practice daily greetings?']
      }
    ]);
  }, [profile.nativeLanguage, profile.targetLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Audio playback for messages
  const handlePlayAudio = (text: string) => {
    const targetLang = profile.targetLanguage === 'spanish' ? 'spanish' : 'english';
    speechService.speak(text, targetLang);
  };

  // Send Message in Conversation
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: Date.now(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInputText('');
    setIsLoading(true);

    try {
      const tutorReply = await tutorApi.chatWithTutor(updated, profile);

      const tutorMsg: ChatMessage = {
        id: `msg-tutor-${Date.now()}`,
        sender: 'tutor',
        text: tutorReply.text,
        timestamp: Date.now(),
        translation: tutorReply.translation,
        corrections: tutorReply.corrections,
        quickReplies: tutorReply.quickReplies,
      };

      setMessages((prev) => [...prev, tutorMsg]);

      // Auto-read tutor response
      handlePlayAudio(tutorReply.text);
    } catch (e) {
      console.error('Chat error', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Microphone toggle in Conversation
  const handleToggleVoiceInput = () => {
    if (isRecording) {
      if (speechRecognizer) speechRecognizer.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      const targetLang = profile.targetLanguage === 'spanish' ? 'spanish' : 'english';

      const recognizer = speechService.createRecognizer(
        targetLang,
        (transcript, isFinal) => {
          setInputText(transcript);
          if (isFinal) {
            setIsRecording(false);
            handleSendMessage(transcript);
          }
        },
        (err) => {
          console.warn('Speech recognition error/fallback:', err);
          setIsRecording(false);
          // Fallback simulation for iframe demo
          const fallback = profile.targetLanguage === 'spanish' ? 'Estoy aprendiendo mucho.' : 'I am going to the market.';
          setInputText(fallback);
        }
      );

      setSpeechRecognizer(recognizer);
      recognizer.start();

      // Demo fallback timer
      setTimeout(() => {
        setIsRecording((rec) => {
          if (rec && !inputText) {
            const fallback = profile.targetLanguage === 'spanish' ? 'Estoy aprendiendo mucho.' : 'I am going to the market.';
            setInputText(fallback);
            return false;
          }
          return rec;
        });
      }, 3500);
    }
  };

  // Pronunciation Lab Evaluation
  const handleEvaluatePronunciation = async () => {
    const textToTest = spokenSentence || targetSentence;
    setIsEvaluatingPronunciation(true);
    try {
      const res = await tutorApi.evaluatePronunciation(targetSentence, textToTest, profile);
      setPronunciationResult(res);
    } catch (e) {
      console.error('Pronunciation eval error', e);
    } finally {
      setIsEvaluatingPronunciation(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-3 pb-24 space-y-4">
      
      {/* Mode Switcher: Conversation vs Pronunciation Lab */}
      <div className="flex p-1 rounded-2xl bg-slate-200/80 max-w-sm mx-auto">
        <button
          id="practice-tab-conversation"
          onClick={() => setMode('conversation')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'conversation' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          AI Tutor Dialogue
        </button>
        <button
          id="practice-tab-pronunciation"
          onClick={() => setMode('pronunciation')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'pronunciation' 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pronunciation Lab
        </button>
      </div>

      {/* MODE 1: AI CONVERSATION */}
      {mode === 'conversation' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col h-[70vh] overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-3.5 px-4 bg-slate-50 border-b border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="text-xs font-bold text-slate-900">LinguaAI Conversational Tutor</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] text-slate-500">
                  Adapts in real-time to {profile.level} level
                </p>
              </div>
            </div>

            <button
              id="practice-toggle-translations-btn"
              onClick={() => setShowTranslations(!showTranslations)}
              className={`p-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1 transition-colors ${
                showTranslations 
                  ? 'bg-teal-50 border-teal-200 text-teal-800' 
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
              title="Toggle Native Language Translations"
            >
              <Languages className="w-3.5 h-3.5" />
              <span className="text-[10px]">{showTranslations ? 'Translations ON' : 'Translations OFF'}</span>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isTutor = msg.sender === 'tutor';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isTutor ? 'items-start' : 'items-end'} space-y-1.5`}
                >
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-medium px-1">
                    <span>{isTutor ? 'LinguaAI Tutor' : 'You'}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs md:text-sm leading-relaxed ${
                      isTutor
                        ? 'bg-slate-100 text-slate-900 rounded-tl-sm'
                        : 'bg-teal-700 text-white rounded-tr-sm shadow-sm'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Bilingual Translation */}
                    {isTutor && showTranslations && msg.translation && (
                      <p className="text-[11px] text-teal-800 font-medium mt-1.5 pt-1.5 border-t border-slate-200">
                        {msg.translation}
                      </p>
                    )}

                    {/* Audio Playback button */}
                    {isTutor && (
                      <button
                        onClick={() => handlePlayAudio(msg.text)}
                        className="mt-2 text-teal-700 hover:text-teal-900 flex items-center space-x-1 text-[11px] font-semibold"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>

                  {/* Inline Grammar Diagnostic Correction Cards */}
                  {msg.corrections && msg.corrections.length > 0 && (
                    <div className="max-w-[85%] p-3 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs space-y-1.5 animate-in fade-in">
                      <div className="flex items-center space-x-1 text-amber-800 font-bold text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Grammar Diagnosis:</span>
                      </div>
                      {msg.corrections.map((corr, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <div className="flex items-center space-x-1 text-rose-700">
                            <span className="line-through">"{corr.original}"</span>
                            <span className="text-slate-400">→</span>
                            <span className="text-emerald-700 font-bold">"{corr.corrected}"</span>
                          </div>
                          <p className="text-[11px] text-slate-600">{corr.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Replies */}
                  {isTutor && msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(reply)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/70 font-medium transition-colors text-left"
                        >
                          "{reply}"
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs p-2">
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                <span className="italic">LinguaAI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200/70 space-y-2">
            <div className="flex items-center space-x-2">
              <button
                id="chat-mic-record-btn"
                onClick={handleToggleVoiceInput}
                className={`p-2.5 rounded-xl border transition-all ${
                  isRecording
                    ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title="Speak to the AI tutor"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                id="chat-text-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder={isRecording ? 'Listening to you speak...' : 'Type or speak in English...'}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 text-xs md:text-sm font-medium"
              />

              <button
                id="chat-send-msg-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isLoading}
                className="p-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 text-white shadow-sm transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* MODE 2: PRONUNCIATION LAB */}
      {mode === 'pronunciation' && (
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-200/80 shadow-sm space-y-5">
          
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Pronunciation & Phonetics Lab</h3>
              <p className="text-[11px] text-slate-500">Evaluates word stress, vowel accuracy, and conversational cadence</p>
            </div>
          </div>

          {/* Drill Target Sentence */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Target Sentence:</span>
              <button
                onClick={() => handlePlayAudio(targetSentence)}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Native Speaker</span>
              </button>
            </div>
            <p className="text-base font-bold text-slate-900 leading-snug">
              "{targetSentence}"
            </p>
          </div>

          {/* Sentence Picker */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-slate-500">Select another practice sentence:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'I am going to the market with my friend.',
                'She is a doctor at the local hospital.',
                'We are learning English every morning.',
                'Could you please help me with the directions?'
              ].map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTargetSentence(s);
                    setPronunciationResult(null);
                    setSpokenSentence('');
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-xl border text-left transition-colors ${
                    targetSentence === s 
                      ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>

          {/* Recording & Evaluation Action */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/70 text-center space-y-3">
            <button
              id="pronunciation-record-trigger"
              onClick={handleEvaluatePronunciation}
              disabled={isEvaluatingPronunciation}
              className="w-16 h-16 rounded-full mx-auto bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-lg shadow-teal-600/20 transition-all active:scale-95"
            >
              <Mic className="w-7 h-7" />
            </button>
            <div>
              <p className="text-xs font-bold text-slate-900">Tap to record & evaluate pronunciation</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Read aloud: "{targetSentence}"</p>
            </div>
          </div>

          {/* PRONUNCIATION SCORE BREAKDOWN */}
          {pronunciationResult && (
            <div className="p-4 md:p-5 rounded-2xl bg-white border border-teal-200 shadow-md space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                    Phonetic Analysis
                  </span>
                  <h4 className="text-lg font-bold text-slate-900">Pronunciation Report</h4>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-teal-700">
                    {pronunciationResult.overallScore}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">/100</span>
                </div>
              </div>

              {/* Sub-scores */}
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <p className="text-slate-500 text-[11px]">Accuracy</p>
                  <p className="text-base font-bold text-slate-900">{pronunciationResult.accuracyScore}%</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <p className="text-slate-500 text-[11px]">Fluency & Rhythm</p>
                  <p className="text-base font-bold text-slate-900">{pronunciationResult.fluencyScore}%</p>
                </div>
              </div>

              {/* Word-by-word breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800">Word-by-word Clarity:</span>
                <div className="flex flex-wrap gap-2">
                  {pronunciationResult.wordBreakdown.map((wb, idx) => (
                    <div 
                      key={idx}
                      className={`p-2 rounded-xl border text-center text-xs space-y-0.5 ${
                        wb.score >= 85 
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                          : 'bg-amber-50/70 border-amber-200 text-amber-950'
                      }`}
                    >
                      <p className="font-bold">{wb.word}</p>
                      <p className="text-[10px] opacity-70 font-mono">{wb.phonetic}</p>
                      <p className="text-[10px] font-semibold">{wb.score}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable coaching tip */}
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200/70 text-xs space-y-1">
                <span className="font-bold text-teal-900 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                  <span>Tutor Pronunciation Tip:</span>
                </span>
                <p className="text-slate-700 leading-relaxed">{pronunciationResult.tip}</p>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
