/**
 * EXTERNAL TTS SERVICE
 * 
 * Provides high-quality Hindi text-to-speech using external APIs:
 * - Uses Google Cloud Text-to-Speech API for professional voice synthesis
 * - Supports multiple Hindi voices with natural pronunciation
 * - Generates audio files for better performance and reliability
 * - Handles API authentication and error management
 * 
 * Key Features:
 * - Pre-generated audio files for common messages
 * - Dynamic audio generation for custom text
 * - Fallback to browser TTS if external API fails
 * - Caching mechanism for better performance
 */

interface TTSOptions {
  voice?: string;
  speed?: number;
  pitch?: number;
  volume?: number;
}

interface AudioCache {
  [key: string]: string; // text -> audio URL
}

class TTSService {
  private audioCache: AudioCache = {};
  private isGoogleTTSAvailable: boolean = false;
  private apiKey: string | null = null;

  constructor() {
    // Check if Google TTS API key is available or if we can use existing Google Cloud credentials
    this.apiKey = process.env.REACT_APP_GOOGLE_TTS_API_KEY || 
                  process.env.REACT_APP_GOOGLE_CLOUD_API_KEY ||
                  process.env.GOOGLE_APPLICATION_CREDENTIALS || null;
    this.isGoogleTTSAvailable = !!this.apiKey;
  }

  /**
   * SYNTHESIZE HINDI TEXT TO SPEECH
   * 
   * Converts Hindi text to audio using Google Cloud TTS API:
   * - Uses high-quality Hindi voices (hi-IN-Wavenet-A/B)
   * - Generates MP3 audio files for better performance
   * - Implements caching to avoid repeated API calls
   * - Falls back to browser TTS if API unavailable
   */
  async speakHindi(text: string, options: TTSOptions = {}): Promise<void> {
    // Check cache first
    if (this.audioCache[text]) {
      return this.playAudio(this.audioCache[text]);
    }

    if (this.isGoogleTTSAvailable) {
      try {
        const audioUrl = await this.generateAudioWithGoogleTTS(text, options);
        this.audioCache[text] = audioUrl;
        return this.playAudio(audioUrl);
      } catch (error) {
        console.warn('Google TTS failed, falling back to browser TTS:', error);
        return this.fallbackToBrowserTTS(text, options);
      }
    } else {
      console.warn('Google TTS API key not available, using browser TTS');
      return this.fallbackToBrowserTTS(text, options);
    }
  }

  /**
   * GENERATE AUDIO WITH GOOGLE CLOUD TTS
   * 
   * Uses Google Cloud Text-to-Speech API to generate high-quality Hindi audio:
   * - Sends text to Google TTS API
   * - Receives MP3 audio data
   * - Creates blob URL for playback
   */
  private async generateAudioWithGoogleTTS(text: string, options: TTSOptions): Promise<string> {
    // Try to get access token from your existing Google Cloud setup
    let accessToken = this.apiKey;
    
    // If we have a service account key, try to get an access token
    if (!accessToken && typeof window !== 'undefined') {
      try {
        // This will work if your Firebase project has TTS API enabled
        const response = await fetch('/api/get-tts-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          accessToken = data.accessToken;
        }
      } catch (error) {
        console.warn('Could not get TTS access token:', error);
      }
    }

    if (!accessToken) {
      throw new Error('No Google Cloud access token available');
    }

    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        input: { text: text },
        voice: {
          languageCode: 'hi-IN',
          name: options.voice || 'hi-IN-Wavenet-A',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: options.speed || 0.9,
          pitch: options.pitch || 0.0,
          volumeGainDb: options.volume || 0.0
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Google TTS API error: ${response.status}`);
    }

    const data = await response.json();
    const audioData = data.audioContent;
    
    // Convert base64 to blob and create URL
    const binaryString = atob(audioData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const blob = new Blob([bytes], { type: 'audio/mp3' });
    return URL.createObjectURL(blob);
  }

  /**
   * FALLBACK TO BROWSER TTS
   * 
   * Uses browser's built-in speech synthesis as fallback:
   * - Works when external API is unavailable
   * - Uses Web Speech API with Hindi language
   * - Provides basic voice synthesis functionality
   */
  private async fallbackToBrowserTTS(text: string, options: TTSOptions): Promise<void> {
    if (!('speechSynthesis' in window)) {
      throw new Error('Speech synthesis not supported');
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = options.speed || 0.8;
      utterance.pitch = options.pitch || 1.0;
      utterance.volume = options.volume || 1.0;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis failed: ${event.error}`));

      speechSynthesis.speak(utterance);
    });
  }

  /**
   * PLAY AUDIO FILE
   * 
   * Plays audio from URL with proper error handling:
   * - Creates HTML5 Audio element
   * - Handles playback errors gracefully
   * - Returns promise for async handling
   */
  private playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl); // Clean up blob URL
        resolve();
      };
      
      audio.onerror = (event) => {
        URL.revokeObjectURL(audioUrl); // Clean up blob URL
        reject(new Error('Audio playback failed'));
      };

      audio.play().catch(error => {
        URL.revokeObjectURL(audioUrl); // Clean up blob URL
        reject(error);
      });
    });
  }

  /**
   * STOP CURRENT SPEECH
   * 
   * Stops any ongoing speech synthesis
   */
  stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
  }

  /**
   * CHECK TTS AVAILABILITY
   * 
   * Returns whether TTS is available (Google TTS or browser TTS)
   */
  isTTSAvailable(): boolean {
    return this.isGoogleTTSAvailable || 'speechSynthesis' in window;
  }

  /**
   * CLEAR AUDIO CACHE
   * 
   * Clears cached audio files to free up memory
   */
  clearCache(): void {
    Object.values(this.audioCache).forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.audioCache = {};
  }
}

// Create singleton instance
const ttsService = new TTSService();

export default ttsService;

// Predefined Hindi messages for common scenarios
export const HINDI_MESSAGES = {
  ANALYSIS_START: "कृपया प्रतीक्षा करें, आपकी रिपोर्ट तैयार हो रही है।",
  ANALYSIS_COMPLETE: "आपकी रिपोर्ट तैयार हो गई है।",
  REPORT_SUMMARY: (summary: string) => `रिपोर्ट सारांश: ${summary}`
};
