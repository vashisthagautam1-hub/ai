/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Service handling Text-to-Speech and Speech-to-Text with clean fallback / mock options

export interface SpeechRecognitionResultItem {
  transcript: string;
  isFinal: boolean;
}

export const speechService = {
  // Speaks given text in the requested target language
  speak(text: string, lang: 'english' | 'spanish' | 'hindi' = 'english'): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        console.warn('Speech synthesis not supported on this browser');
        resolve();
        return;
      }

      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for language learners
      utterance.pitch = 1.0;

      if (lang === 'spanish') {
        utterance.lang = 'es-ES';
      } else if (lang === 'hindi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-US';
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  },

  // Stop any active speech
  stopSpeaking(): void {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  },

  // Create an STT recognition listener or fallback to simulated speech
  createRecognizer(
    lang: 'english' | 'spanish' | 'hindi',
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void
  ): { start: () => void; stop: () => void; isSupported: boolean } {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return {
        isSupported: false,
        start: () => {
          console.log('[SpeechService] SpeechRecognition API not available in this environment. Falling back to simulated input.');
        },
        stop: () => {},
      };
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang === 'spanish' ? 'es-ES' : lang === 'hindi' ? 'hi-IN' : 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        onResult(text, !!finalTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('[SpeechService] Recognition error:', event.error);
        onError(event);
      };

      return {
        isSupported: true,
        start: () => {
          try {
            recognition.start();
          } catch (e) {
            console.warn('Recognition already started or error:', e);
          }
        },
        stop: () => {
          try {
            recognition.stop();
          } catch (e) {}
        }
      };
    } catch (e) {
      return {
        isSupported: false,
        start: () => {},
        stop: () => {}
      };
    }
  }
};
