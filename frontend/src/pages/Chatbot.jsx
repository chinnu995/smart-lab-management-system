import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Bot, Send, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Chatbot() {
  const [msgs, setMsgs] = useState([{ 
    from: 'bot', 
    text: "Hey there! 👋 I'm Zira, your dedicated Smart Lab Assistant. Ask me anything about your attendance, free lab availability, lab manuals, test schedules & scores, rankings, complaints, or announcements! (Note: I am specialized strictly for Smart Lab tasks and do not answer general queries or write code)." 
  }]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voices, setVoices] = useState([]);
  
  const endRef = useRef();
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const resumeIntervalRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Load and cache voices for Web Speech API across Chrome and other browsers
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices && availableVoices.length > 0) {
          setVoices(availableVoices);
        }
      };
      
      window.speechSynthesis.onvoiceschanged = updateVoices;
      updateVoices();
    }
  }, []);

  const speakText = (text) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Stop ongoing speech & clear keep-alive interval
    window.speechSynthesis.cancel();
    if (resumeIntervalRef.current) {
      clearInterval(resumeIntervalRef.current);
      resumeIntervalRef.current = null;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Clean markdown styling so it reads naturally
    const cleanText = text.replace(/[*#_`~[\]-]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Dynamically fetch voices (Chrome loads voices asynchronously)
    const liveVoices = window.speechSynthesis.getVoices();
    const voiceList = (liveVoices && liveVoices.length > 0) ? liveVoices : voices;

    if (voiceList && voiceList.length > 0) {
      // 1. Try female voices: Zira, Samantha, Google UK English Female, Google US English
      let femaleVoice = voiceList.find(v => {
        const name = v.name.toLowerCase();
        return name.includes('samantha') || name.includes('zira') || name.includes('google uk english female');
      });

      if (!femaleVoice) {
        const femaleKeywords = ['female', 'zira', 'samantha', 'jenny', 'aria', 'hazel', 'google us english', 'elsa', 'heera', 'susan'];
        femaleVoice = voiceList.find(v => {
          const name = v.name.toLowerCase();
          const isMale = name.includes('male') && !name.includes('female');
          const isKnownMaleName = name.includes('david') || name.includes('ravi') || name.includes('george') || name.includes('mark');
          if (isMale || isKnownMaleName) return false;
          return femaleKeywords.some(kw => name.includes(kw));
        });
      }

      if (!femaleVoice) {
        femaleVoice = voiceList.find(v => {
          const name = v.name.toLowerCase();
          const isMale = name.includes('male') && !name.includes('female');
          const isKnownMaleName = name.includes('david') || name.includes('ravi') || name.includes('george') || name.includes('mark');
          return (v.lang.startsWith('en') || v.lang.startsWith('en-')) && !isMale && !isKnownMaleName;
        });
      }

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
    }
    
    utterance.pitch = 1.15;
    utterance.rate = 1.0;
    
    // Retain reference to utterance object to prevent Chrome garbage collection bug
    utteranceRef.current = utterance;

    utterance.onend = () => {
      utteranceRef.current = null;
      if (resumeIntervalRef.current) {
        clearInterval(resumeIntervalRef.current);
        resumeIntervalRef.current = null;
      }
    };

    utterance.onerror = (err) => {
      console.error("Speech synthesis utterance error:", err);
      utteranceRef.current = null;
      if (resumeIntervalRef.current) {
        clearInterval(resumeIntervalRef.current);
        resumeIntervalRef.current = null;
      }
    };

    window.speechSynthesis.speak(utterance);

    // Chrome workaround: Chrome speech synthesis pauses after 14-15 seconds if not explicitly resumed
    resumeIntervalRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else if (!window.speechSynthesis.speaking) {
        clearInterval(resumeIntervalRef.current);
        resumeIntervalRef.current = null;
      }
    }, 10000);
  };

  const toggleListen = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && !window.isSecureContext) {
      toast.error("Google Chrome requires HTTPS or localhost to enable Speech Recognition.", { duration: 5000 });
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    // Stop any existing recognition before starting a new one
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    // Explicitly check & request microphone permissions first so Chrome triggers the permission prompt
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release tracks immediately so speech recognition has exclusive mic access
        stream.getTracks().forEach(t => t.stop());
      }
    } catch (permErr) {
      console.error("Microphone permission error:", permErr);
      toast.error("Microphone access denied or not available. Please allow mic permissions in browser address bar.");
      setIsListening(false);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = window.navigator.language || 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e) => {
        if (e.results && e.results[0] && e.results[0][0]) {
          const transcript = e.results[0][0].transcript;
          if (transcript && transcript.trim()) {
            setQ(transcript);
            toast.success(`Speech Sent: "${transcript}"`, { icon: '🎙️', duration: 3000 });
            // Direct JARVIS voice mode: Auto-send recognized speech straight to Zira
            sendText(transcript);
          }
        }
      };

      rec.onerror = async (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        
        let isBrave = false;
        try {
          if (navigator.brave && typeof navigator.brave.isBrave === 'function') {
            isBrave = await navigator.brave.isBrave();
          }
        } catch {}

        if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Please click the lock/mic icon in your address bar to allow microphone access.");
        } else if (event.error === 'service-not-allowed') {
          toast.error("Speech recognition service not allowed by browser/OS settings.");
        } else if (event.error === 'no-speech') {
          toast.error("No speech detected. Please speak clearly into your microphone.");
        } else if (event.error === 'network') {
          if (isBrave) {
            toast.error("Brave Browser blocks Google speech API by default. Please enable 'Use Google services for speech recognition' in brave://settings/privacy, or use Google Chrome / MS Edge.", {
              duration: 9000
            });
          } else {
            toast.error("Chrome speech engine requires internet to reach Google speech servers. Check your connection or try Microsoft Edge.", {
              duration: 8000
            });
          }
        } else if (event.error !== 'aborted') {
          toast.error(`Speech error: ${event.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      toast.error("Failed to start speech recognition.");
      setIsListening(false);
    }
  };

  // Stop speaking and listening when user exits chatbot
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (resumeIntervalRef.current) {
        clearInterval(resumeIntervalRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const sendText = async (textToSend) => {
    if (!textToSend || !textToSend.trim()) return;
    const text = textToSend.trim();
    setQ('');
    setMsgs(m => [...m, { from: 'user', text }]);
    setBusy(true);

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
    }

    try {
      const { data } = await api.post('/chatbot', { query: text });
      setMsgs(m => [...m, { from: 'bot', text: data.reply }]);

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

  const send = (e) => {
    e?.preventDefault();
    sendText(q);
  };

  return (
    <div className="card max-w-3xl mx-auto flex flex-col h-[70vh] shadow-xl border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
        <h2 className="font-semibold flex items-center gap-2">
          <Bot className="text-primary" /> 
          AI Assistant <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold">(Zira)</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> JARVIS Mode (Direct Speech)
          </span>
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

      {/* Zira Quick Scope Prompt Pills */}
      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
        {[
          '📊 My Attendance & 75%',
          '🧪 Available Free Labs',
          '📚 Lab Manuals',
          '💻 Coding Lab Tests',
          '📝 MCQ Tests & Scores',
          '🏆 My Rank & Toppers',
          '⚠️ Check Complaints',
          '📢 Recent Announcements'
        ].map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            disabled={busy}
            onClick={() => sendText(prompt)}
            className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600 text-slate-700 dark:text-slate-200 px-2.5 py-1 rounded-full border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form onSubmit={send} className="flex gap-2 mt-2 items-center">
        <div className="relative flex-1">
          <input 
            className="input pr-10" 
            value={q} 
            onChange={e => setQ(e.target.value)} 
            placeholder={isListening ? "Listening... Speak now!" : "Ask Zira about attendance, free labs, manuals, tests, ranks..."} 
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
