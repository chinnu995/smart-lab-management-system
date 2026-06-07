import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Bot, Send, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Chatbot() {
  const [msgs, setMsgs] = useState([{ from: 'bot', text: 'Hi! Ask me about attendance, free labs, or your schedule.' }]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState([]);
  
  const endRef = useRef();
  const recognitionRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Load and cache voices for Web Speech API
  useEffect(() => {
    if (window.speechSynthesis) {
      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
      window.speechSynthesis.onvoiceschanged = updateVoices;
      updateVoices();
    }
  }, []);

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Stop any currently playing speech

    // Clean markdown styling so it reads naturally
    const cleanText = text.replace(/[*#_`~[\]-]/g, ' ').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // 1. Try to find the specific Samantha (macOS/iOS) or Microsoft Zira (Windows) voice first
    let femaleVoice = voices.find(v => v.name.toLowerCase().includes('samantha'));
    if (!femaleVoice) {
      femaleVoice = voices.find(v => v.name.toLowerCase().includes('zira'));
    }

    // 2. If neither is available, look for other common female voices, strictly avoiding male voices
    if (!femaleVoice) {
      const femaleKeywords = ['female', 'zira', 'hazel', 'sabina', 'haruka', 'heera', 'elsa', 'susan', 'en-us', 'google us english'];
      femaleVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const isMale = name.includes('male') && !name.includes('female');
        const isKnownMaleName = name.includes('david') || name.includes('ravi') || name.includes('george') || name.includes('mark');
        if (isMale || isKnownMaleName) return false;
        return femaleKeywords.some(kw => name.includes(kw));
      });
    }

    if (!femaleVoice) {
      femaleVoice = voices.find(v => v.gender === 'female');
    }

    if (!femaleVoice) {
      femaleVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const isMale = name.includes('male') && !name.includes('female');
        const isKnownMaleName = name.includes('david') || name.includes('ravi') || name.includes('george') || name.includes('mark');
        return v.lang.startsWith('en') && !isMale && !isKnownMaleName;
      });
    }

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    // Adjust pitch slightly higher for a friendly assistant tone
    utterance.pitch = 1.15;
    utterance.rate = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };

  const toggleListen = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setQ(transcript);
        toast.success("Speech recognized!");
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Please click the camera/microphone icon in the browser address bar to allow permissions.");
        } else if (event.error === 'no-speech') {
          toast.error("No speech detected. Please speak clearly into your microphone.");
        } else if (event.error === 'network') {
          toast.error("Speech recognition network error. Chrome's speech engine requires internet. Try Microsoft Edge or check your internet connection.", {
            duration: 5000
          });
        } else {
          toast.error(`Speech error: ${event.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error(err);
      toast.error("Failed to start speech recognition.");
      setIsListening(false);
    }
  };

  const send = async (e) => {
    e?.preventDefault();
    if (!q.trim()) return;
    const text = q;
    setQ('');
    setMsgs(m => [...m, { from: 'user', text }]);
    setBusy(true);
    
    // Mute speech recognition if listening
    if (isListening) {
      recognitionRef.current?.stop();
    }

    try {
      const { data } = await api.post('/chatbot', { query: text });
      setMsgs(m => [...m, { from: 'bot', text: data.reply }]);
      
      // Auto-read response if voice is enabled
      if (voiceEnabled) {
        speakText(data.reply);
      }
    } catch {
      const errMsg = 'Sorry, something went wrong.';
      setMsgs(m => [...m, { from: 'bot', text: errMsg }]);
      if (voiceEnabled) speakText(errMsg);
    } finally {
      setBusy(false);
    }
  };

  // Stop speaking when user exits chatbot
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="card max-w-3xl mx-auto flex flex-col h-[70vh] shadow-xl border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <h2 className="font-semibold flex items-center gap-2">
          <Bot className="text-primary" /> 
          AI Assistant <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold">(Zira)</span>
        </h2>
        
        <div className="flex items-center gap-2">
          {/* Mute/Unmute toggle */}
          <button 
            type="button"
            onClick={() => {
              const nextVal = !voiceEnabled;
              setVoiceEnabled(nextVal);
              if (!nextVal) window.speechSynthesis?.cancel();
            }}
            className={`p-2 rounded-lg transition-all ${
              voiceEnabled 
                ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-650'
            }`}
            title={voiceEnabled ? 'Mute voice agent' : 'Unmute voice agent'}
          >
            {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto space-y-2 pr-2">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="group relative flex items-center gap-2 max-w-[80%]">
              <div className={`px-4 py-2.5 rounded-2xl whitespace-pre-wrap text-sm shadow-sm ${
                m.from === 'user' 
                  ? 'bg-primary text-white rounded-br-sm' 
                  : 'bg-slate-100 dark:bg-slate-800/80 dark:text-slate-100 rounded-bl-sm border border-slate-200/50 dark:border-slate-700/50'
              }`}>
                {m.text}
              </div>
              
              {/* Speaker icon next to bot messages for replay capability */}
              {m.from === 'bot' && (
                <button
                  type="button"
                  onClick={() => speakText(m.text)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-200 dark:bg-slate-750 hover:bg-slate-300 transition-all text-slate-500 cursor-pointer border-0"
                  title="Read message aloud"
                >
                  <Volume2 size={12} />
                </button>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={send} className="flex gap-2 mt-3 items-center">
        <div className="relative flex-1">
          <input 
            className="input pr-10" 
            value={q} 
            onChange={e => setQ(e.target.value)} 
            placeholder={isListening ? "Listening... Speak now!" : "Ask anything…"} 
            disabled={busy}
          />
          
          {/* Speech-to-text Microphone button */}
          <button
            type="button"
            onClick={toggleListen}
            disabled={busy}
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-all cursor-pointer border-0 ${
              isListening 
                ? 'bg-rose-500 text-white animate-pulse' 
                : 'text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-750 hover:text-slate-700'
            }`}
            title={isListening ? 'Stop listening' : 'Talk to AI assistant'}
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
          </button>
        </div>
        
        <button disabled={busy} type="submit" className="btn-primary py-2.5 border-0">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
