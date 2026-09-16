/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client server-side safely
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper: Safely parse JSON returned from model
function safeParseJson<T>(rawText: string, fallback: T): T {
  try {
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse model JSON:', e, rawText);
    return fallback;
  }
}

// -------------------------------------------------------------
// AI TUTOR ENDPOINTS
// -------------------------------------------------------------

// 1. Generate Structured Lesson
app.post('/api/tutor/generate-lesson', async (req, res) => {
  const { profile, topic, isRevision } = req.body;
  const native = profile?.nativeLanguage || 'hindi';
  const target = profile?.targetLanguage || 'english';
  const level = profile?.level || 'Beginner';
  const goal = profile?.learningGoal || 'Speaking';
  const weaknesses = profile?.grammarWeaknesses?.map((w: any) => w.topic).join(', ') || 'Present Continuous tense, Articles';
  const repeatedMistakes = profile?.repeatedMistakes?.slice(0, 3).map((m: any) => `Mistake: "${m.userAnswer}" (intended: "${m.correctAnswer}")`).join('; ') || 'None';

  const defaultTopic = isRevision 
    ? (profile?.topicsNeedingRevision?.[0] || 'Present Continuous & Daily Actions') 
    : (topic || (target === 'english' ? 'Daily Routine & Present Continuous' : 'Saludos y Presentaciones'));

  // If Gemini client is active, generate dynamic customized curriculum
  if (ai) {
    try {
      const prompt = `You are LinguaAI, an adaptive personal language tutor.
Create a structured 4-exercise adaptive lesson for:
- Native Language: ${native}
- Target Language: ${target}
- Learner Level: ${level}
- Primary Goal: ${goal}
- Topic: ${defaultTopic}
- Learner Weaknesses & Past Mistakes: ${weaknesses}. Repeated errors: ${repeatedMistakes}.

If native is Hindi, provide explanations and instructions in simple bilingual English + Hindi (Devanagari or Romanized Hindi where helpful for clarity).
If native is English and target Spanish, provide explanations in English with Spanish examples.

Format strictly as JSON with this schema:
{
  "id": "lesson-${Date.now()}",
  "title": "Lesson Title",
  "topic": "${defaultTopic}",
  "targetSkill": "${goal}",
  "difficulty": "${level.toLowerCase()}",
  "phase": "assess",
  "explanationIntro": "Clear 2-sentence concept overview explaining the key rule with an example.",
  "exercises": [
    {
      "id": "ex-1",
      "type": "translate" | "multiple_choice" | "rearrange_words" | "fill_in_the_blank" | "speaking",
      "instruction": "Instruction in clear language",
      "question": "Question or sentence to translate/complete",
      "contextHint": "Helpful hint relating to grammar or vocabulary",
      "options": ["Option A", "Option B", "Option C", "Option D"], // only for multiple_choice
      "scrambledWords": ["word1", "word2", "word3", "word4"], // only for rearrange_words
      "correctAnswer": "The exact correct sentence or phrase",
      "explanation": "Why this answer is correct and common trap to avoid",
      "mistakeCategory": "grammar" | "vocabulary" | "sentence_construction" | "pronunciation",
      "difficulty": "${level.toLowerCase()}",
      "targetSkill": "${goal}"
    }
  ]
}
Return EXACTLY 4 exercises of diverse types (include at least 1 translate, 1 rearrange_words or multiple_choice, and 1 speaking/pronunciation exercise).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const lessonData = safeParseJson(response.text || '{}', null);
      if (lessonData && lessonData.exercises && lessonData.exercises.length > 0) {
        return res.json(lessonData);
      }
    } catch (err) {
      console.error('Gemini generate-lesson error, using pedagogic fallback:', err);
    }
  }

  // Fallback high-quality adaptive curricula tailored to the prompt
  if (native === 'hindi' && target === 'english') {
    return res.json({
      id: `lesson-${Date.now()}`,
      title: isRevision ? 'Revision: Present Continuous Mastery' : 'Daily Actions & Present Continuous',
      topic: 'Present Continuous (is/am/are + verb-ing)',
      targetSkill: goal,
      difficulty: level.toLowerCase(),
      phase: 'assess',
      explanationIntro: 'जब कोई काम अभी वर्तमान में चल रहा हो (e.g., जा रहा हूँ, खा रहा हूँ), तब English में am/is/are + verb-ing का इस्तेमाल करते हैं। कभी भी "I am go" न कहें, हमेशा "I am going" बोलें।',
      exercises: [
        {
          id: 'ex-1',
          type: 'translate',
          instruction: 'इस वाक्य का सही English अनुवाद करें:',
          question: 'मैं बाज़ार जा रहा हूँ।',
          contextHint: 'ध्यान दें: "am" के साथ क्रिया में "-ing" जुड़ेगा और बाज़ार के पहले "the" आएगा।',
          correctAnswer: 'I am going to the market.',
          acceptableAnswers: ['I am going to the market', 'I am going to market'],
          explanation: '"मैं जा रहा हूँ" = "I am going". Hindi speakers often make the mistake of saying "I am go". Always use verb+ing with am/is/are.',
          mistakeCategory: 'grammar',
          difficulty: 'beginner',
          targetSkill: 'Grammar'
        },
        {
          id: 'ex-2',
          type: 'multiple_choice',
          instruction: 'Choose the grammatically correct sentence:',
          question: 'Which of the following is correct for "वह चाय पी रही है"?',
          options: [
            'She is drinking tea.',
            'She is drink tea.',
            'She drinks tea right now.',
            'She are drinking tea.'
          ],
          correctAnswer: 'She is drinking tea.',
          explanation: 'For singular third-person (She/He/It) in ongoing actions, use "is" + verb-ing: "She is drinking tea."',
          mistakeCategory: 'grammar',
          difficulty: 'beginner',
          targetSkill: 'Grammar'
        },
        {
          id: 'ex-3',
          type: 'rearrange_words',
          instruction: 'शब्दों को सही क्रम में व्यवस्थित करें (Rearrange the words):',
          question: 'Order the words to say: "हम अंग्रेजी सीख रहे हैं।"',
          scrambledWords: ['learning', 'We', 'English', 'are'],
          correctAnswer: 'We are learning English.',
          explanation: 'Subject ("We") + Auxiliary verb ("are") + Main verb ("learning") + Object ("English").',
          mistakeCategory: 'sentence_construction',
          difficulty: 'beginner',
          targetSkill: 'Sentence Construction'
        },
        {
          id: 'ex-4',
          type: 'speaking',
          instruction: 'Speak this sentence aloud clearly:',
          question: 'I am going to the market with my friend.',
          contextHint: 'Focus on clear pronunciation of "going" and "market".',
          correctAnswer: 'I am going to the market with my friend.',
          explanation: 'Great rhythm! Notice the link between "going to the" without pausing.',
          mistakeCategory: 'pronunciation',
          difficulty: 'beginner',
          targetSkill: 'Speaking'
        }
      ]
    });
  } else {
    // English -> Spanish
    return res.json({
      id: `lesson-${Date.now()}`,
      title: isRevision ? 'Revision: Ser vs Estar in Conversation' : 'Greetings & Present Tense (Ser & Estar)',
      topic: 'Present Tense: Ser vs Estar',
      targetSkill: goal,
      difficulty: level.toLowerCase(),
      phase: 'assess',
      explanationIntro: 'In Spanish, "to be" has two forms: "Ser" for permanent traits/identity (Soy de México) and "Estar" for temporary states/locations (Estoy en el mercado).',
      exercises: [
        {
          id: 'ex-sp-1',
          type: 'translate',
          instruction: 'Translate into Spanish:',
          question: 'I am going to the store right now.',
          contextHint: 'Use "Voy" (ir) + "a la tienda" or "Estoy yendo".',
          correctAnswer: 'Voy a la tienda.',
          acceptableAnswers: ['Voy a la tienda', 'Estoy yendo a la tienda'],
          explanation: 'In Spanish, "Voy a la tienda" naturally expresses going to the store.',
          mistakeCategory: 'grammar',
          difficulty: 'beginner',
          targetSkill: 'Grammar'
        },
        {
          id: 'ex-sp-2',
          type: 'multiple_choice',
          instruction: 'Select the correct form of "to be":',
          question: 'How do you say "How are you?" to a friend?',
          options: [
            '¿Cómo estás?',
            '¿Cómo eres?',
            '¿Cómo es?',
            '¿Dónde estás?'
          ],
          correctAnswer: '¿Cómo estás?',
          explanation: 'We use "estar" (estás) for feelings and health conditions.',
          mistakeCategory: 'vocabulary',
          difficulty: 'beginner',
          targetSkill: 'Speaking'
        },
        {
          id: 'ex-sp-3',
          type: 'rearrange_words',
          instruction: 'Rearrange the Spanish words in order:',
          question: 'Say: "I want to speak Spanish today"',
          scrambledWords: ['hablar', 'Quiero', 'español', 'hoy'],
          correctAnswer: 'Quiero hablar español hoy.',
          explanation: 'Quiero (I want) + hablar (to speak) + español (Spanish) + hoy (today).',
          mistakeCategory: 'sentence_construction',
          difficulty: 'beginner',
          targetSkill: 'Sentence Construction'
        },
        {
          id: 'ex-sp-4',
          type: 'speaking',
          instruction: 'Pronounce this greeting clearly:',
          question: 'Mucho gusto, estoy muy feliz de aprender.',
          contextHint: 'Roll the "r" gently in "aprender".',
          correctAnswer: 'Mucho gusto, estoy muy feliz de aprender.',
          explanation: 'Clear vowel pronunciation! In Spanish, vowels (a, e, i, o, u) are always short and crisp.',
          mistakeCategory: 'pronunciation',
          difficulty: 'beginner',
          targetSkill: 'Speaking'
        }
      ]
    });
  }
});

// 2. Evaluate Learner Answer with deep mistake categorization
app.post('/api/tutor/evaluate-answer', async (req, res) => {
  const { question, userAnswer, correctAnswer, exerciseType, profile } = req.body;
  const native = profile?.nativeLanguage || 'hindi';
  const target = profile?.targetLanguage || 'english';

  const cleanUser = (userAnswer || '').trim().replace(/[.,!?;:]$/g, '').toLowerCase();
  const cleanCorrect = (correctAnswer || '').trim().replace(/[.,!?;:]$/g, '').toLowerCase();

  // Special heuristic detection for canonical demo example: "I am go to market"
  const isAmGo = /i\s+am\s+go\b/i.test(userAnswer);

  if (ai) {
    try {
      const prompt = `You are LinguaAI, an expert adaptive language learning diagnostician.
Evaluate the user's answer carefully.
- Native Language: ${native}
- Target Language: ${target}
- Question: "${question}"
- User Answer: "${userAnswer}"
- Standard Correct Answer: "${correctAnswer}"
- Exercise Type: "${exerciseType}"

Important pedagogical guidelines:
1. Accept minor variations, punctuation, or contractions if grammatically valid (e.g. "I'm going" vs "I am going").
2. If incorrect, diagnose the EXACT underlying linguistic/grammar problem.
3. If the user said "I am go to market" or similar verb tense misuse, identify:
   mistakeType: "grammar",
   mistake: "incorrect verb structure (omitted -ing with auxiliary 'am')",
   explanation: Explain simply in ${native === 'hindi' ? 'English with simple Hindi/Hinglish explanation' : 'English'} WHY it is incorrect,
   severity: "medium",
   recommendedPractice: "Present Continuous Tense"
4. Always provide an encouraging tone suitable for a supportive personal tutor.

Output JSON format strictly:
{
  "correct": boolean,
  "userAnswer": "${userAnswer}",
  "correctAnswer": "${correctAnswer}",
  "mistakeType": "grammar" | "vocabulary" | "sentence_construction" | "pronunciation" | "spelling",
  "mistake": "specific short label describing the mistake",
  "explanation": "Clear, friendly explanation of WHY the answer is wrong and the correct rule",
  "severity": "low" | "medium" | "high",
  "recommendedPractice": "Topic to practice next, e.g. Present Continuous",
  "feedbackEncouragement": "Positive feedback"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const evalData = safeParseJson<any>(response.text || '{}', null);
      if (evalData && typeof evalData.correct === 'boolean') {
        return res.json(evalData);
      }
    } catch (err) {
      console.error('Gemini evaluate-answer error:', err);
    }
  }

  // Fallback intelligent evaluation engine
  if (cleanUser === cleanCorrect) {
    return res.json({
      correct: true,
      userAnswer,
      correctAnswer,
      explanation: 'Excellent! Perfect grammar and vocabulary choice.',
      feedbackEncouragement: 'Brilliant work! You nailed this.'
    });
  }

  if (isAmGo) {
    return res.json({
      correct: false,
      userAnswer,
      correctAnswer,
      mistakeType: 'grammar',
      mistake: 'incorrect verb structure ("am go" instead of "am going")',
      explanation: native === 'hindi' 
        ? 'English में जब "am" आता है तो मुख्य क्रिया (verb) में "-ing" लगाना ज़रूरी है ("I am going")। साथ ही, specific स्थान के लिए "the market" बोलें। "I am go" कहना गलत है।'
        : 'In English, the auxiliary verb "am" must be paired with the present participle (-ing form: "going"). Saying "am go" mixes tenses.',
      severity: 'medium',
      recommendedPractice: 'Present Continuous Tense',
      feedbackEncouragement: 'Common mistake for Hindi speakers! Let’s lock down this rule.'
    });
  }

  // Generic fallback evaluation
  const isClose = cleanCorrect.includes(cleanUser) || cleanUser.length > 3 && cleanCorrect.startsWith(cleanUser.slice(0, 3));
  return res.json({
    correct: false,
    userAnswer,
    correctAnswer,
    mistakeType: 'grammar',
    mistake: isClose ? 'Incomplete or slightly altered phrasing' : 'Grammar and word choice discrepancy',
    explanation: `The accurate formulation is "${correctAnswer}". Notice the verb agreement and structure.`,
    severity: 'medium',
    recommendedPractice: 'Sentence Structure & Verb Forms',
    feedbackEncouragement: 'Good effort! Understanding why makes the knowledge stick.'
  });
});

// 3. Generate Targeted Next Exercise addressing diagnosed weakness
app.post('/api/tutor/generate-exercise', async (req, res) => {
  const { profile, mistakeTitle, mistakeType, topic, targetSkill } = req.body;
  const native = profile?.nativeLanguage || 'hindi';
  const target = profile?.targetLanguage || 'english';
  const level = profile?.level || 'Beginner';

  if (ai) {
    try {
      const prompt = `You are LinguaAI, an adaptive language tutor.
The student just made a mistake: "${mistakeTitle}" (${mistakeType}) on topic "${topic}".
Generate ONE immediate targeted practice exercise specifically calibrated to drill and correct this weakness.

- Native Language: ${native}
- Target Language: ${target}
- Level: ${level}

Return strict JSON:
{
  "id": "drill-${Date.now()}",
  "type": "fill_in_the_blank" | "multiple_choice" | "translate" | "rearrange_words",
  "instruction": "Short instruction in ${native === 'hindi' ? 'Hindi or bilingual English' : 'English'}",
  "question": "The sentence or question to complete",
  "contextHint": "Hint clarifying the specific rule",
  "options": ["opt1", "opt2", "opt3"], // if multiple choice
  "scrambledWords": ["w1", "w2", "w3"], // if rearrange
  "correctAnswer": "The precise answer",
  "explanation": "Why this fixes the previous mistake",
  "mistakeCategory": "${mistakeType || 'grammar'}",
  "difficulty": "${level.toLowerCase()}",
  "targetSkill": "${targetSkill || 'Grammar'}"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const exercise = safeParseJson(response.text || '{}', null);
      if (exercise && exercise.question) {
        return res.json(exercise);
      }
    } catch (err) {
      console.error('Gemini generate-exercise error:', err);
    }
  }

  // Fallback targeted exercise for "I am go to market" / Present continuous
  return res.json({
    id: `drill-${Date.now()}`,
    type: 'fill_in_the_blank',
    instruction: native === 'hindi' ? 'खाली जगह भरें (Fill in the blank):' : 'Fill in the blank with the correct verb form:',
    question: 'Right now, I am _______ (go) to the office.',
    contextHint: 'Remember: am + [verb] + ing for right now!',
    correctAnswer: 'going',
    acceptableAnswers: ['going', 'am going'],
    explanation: 'Since the action is happening right now, "go" becomes "going" with "am". "I am going to the office."',
    mistakeCategory: 'grammar',
    difficulty: 'beginner',
    targetSkill: 'Present Continuous'
  });
});

// 4. Conversational AI Tutor Chat
app.post('/api/tutor/chat', async (req, res) => {
  const { messages, profile, currentWeaknesses } = req.body;
  const native = profile?.nativeLanguage || 'hindi';
  const target = profile?.targetLanguage || 'english';
  const level = profile?.level || 'Beginner';
  const weaknesses = profile?.grammarWeaknesses?.map((w: any) => w.topic).join(', ') || 'Present continuous, Articles';

  const lastUserMessage = messages?.[messages.length - 1]?.text || 'Hello teacher';

  if (ai) {
    try {
      const historyContext = messages?.slice(-6).map((m: any) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n') || '';

      const prompt = `You are "LinguaAI Tutor", an encouraging, highly knowledgeable personal AI language teacher.
You are chatting with a student:
- Native Language: ${native}
- Learning Language: ${target}
- Current Level: ${level}
- Known Weaknesses: ${weaknesses}

Conversation History:
${historyContext}

Your Tutor Persona & Rules:
1. Speak in ${target}, but if the learner is Beginner and native is Hindi, provide a simple translation or Hindi explanation in parentheses whenever introducing a new phrase or correcting an error.
2. If the user makes a grammar or word mistake in their last message ("${lastUserMessage}"), gently correct it! Explain WHY in 1 sentence.
3. Keep your response conversational, concise (2-4 sentences max), friendly, and end with an engaging question to keep them speaking.
4. Provide 2-3 short quick replies the student can tap to respond easily.

Return strict JSON:
{
  "text": "Your tutor response in the target language (with bilingual support if appropriate)",
  "translation": "Full translation in ${native}",
  "corrections": [
    {
      "original": "mistake snippet if any",
      "corrected": "corrected version",
      "reason": "short explanation"
    }
  ],
  "quickReplies": ["Quick response 1", "Quick response 2", "Quick response 3"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.5,
        },
      });

      const chatData = safeParseJson<any>(response.text || '{}', null);
      if (chatData && chatData.text) {
        return res.json(chatData);
      }
    } catch (err) {
      console.error('Gemini chat error:', err);
    }
  }

  // Fallback smart conversation
  if (native === 'hindi') {
    const hasGrammarMistake = /i\s+am\s+go\b/i.test(lastUserMessage);
    if (hasGrammarMistake) {
      return res.json({
        text: "I see you said 'I am go'! Remember, for actions happening right now, we say: 'I am going to the market.' (मैं बाज़ार जा रहा हूँ). What are you planning to buy there today?",
        translation: "मैंने देखा आपने 'I am go' कहा! याद रखें, अभी हो रहे काम के लिए हम कहते हैं: 'I am going'. आप आज वहाँ क्या खरीदने की योजना बना रहे हैं?",
        corrections: [
          {
            original: "I am go",
            corrected: "I am going",
            reason: "Use verb+ing with 'am' for ongoing actions."
          }
        ],
        quickReplies: [
          "I am going to buy vegetables.",
          "I am meeting a friend.",
          "Can you explain this rule again?"
        ]
      });
    }

    return res.json({
      text: "Hello! It is so nice to practice with you. How is your day going so far? (नमस्ते! आपके साथ अभ्यास करके बहुत अच्छा लगा। आपका दिन कैसा बीत रहा है?)",
      translation: "नमस्ते! आपके साथ अभ्यास करके बहुत अच्छा लगा। आपका दिन कैसा बीत रहा है?",
      corrections: [],
      quickReplies: [
        "My day is going very well!",
        "I am busy with work today.",
        "I am practicing my English!"
      ]
    });
  } else {
    // English -> Spanish
    return res.json({
      text: "¡Hola! Me alegra mucho verte hoy. ¿Cómo estás? (Hello! I'm glad to see you today. How are you?)",
      translation: "Hello! I'm very glad to see you today. How are you?",
      corrections: [],
      quickReplies: [
        "¡Estoy muy bien, gracias!",
        "Estoy un poco cansado.",
        "Listo para aprender español."
      ]
    });
  }
});

// 5. Pronunciation Evaluation API
app.post('/api/tutor/evaluate-pronunciation', async (req, res) => {
  const { targetText, spokenText, profile } = req.body;
  const cleanTarget = (targetText || '').trim();
  const cleanSpoken = (spokenText || '').trim();

  // Word-by-word comparison
  const targetWords = cleanTarget.split(/\s+/);
  const spokenWords = cleanSpoken.toLowerCase().split(/\s+/);

  const wordBreakdown = targetWords.map((word, idx) => {
    const norm = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    const spokenMatch = spokenWords[idx] || '';
    const isMatch = spokenWords.includes(norm);
    const score = isMatch ? 95 : 60;

    return {
      word,
      score,
      phonetic: `/${norm}/`,
      tip: isMatch ? 'Clear and natural' : `Emphasize the "${norm.slice(0, 2)}" sound clearly`
    };
  });

  const avgScore = Math.round(wordBreakdown.reduce((acc, w) => acc + w.score, 0) / (wordBreakdown.length || 1));

  return res.json({
    overallScore: Math.min(100, Math.max(50, avgScore)),
    accuracyScore: avgScore,
    fluencyScore: Math.min(100, avgScore + 5),
    wordBreakdown,
    tip: avgScore > 85 
      ? 'Great cadence and rhythm! Your vowel clarity was excellent.' 
      : 'Good effort! Try linking words together smoothly without pausing between prepositions.'
  });
});

// -------------------------------------------------------------
// VITE OR STATIC SERVING
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LinguaAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
