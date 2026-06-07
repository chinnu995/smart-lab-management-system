import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Clock, ChevronLeft, ChevronRight, Send, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function TakeTest() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});   // { questionId: 'a'|'b'|'c'|'d' }
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);  // seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);   // { score, total }

  // Fetch test details
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/tests/${testId}`);
        setTest(res.data);
        setQuestions(res.data.questions || []);
        setTimeLeft((res.data.duration || 10) * 60);
      } catch (err) {
        toast.error('Failed to load test');
        navigate('/student/tests');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [testId]);

  // Timer
  useEffect(() => {
    if (!test || result) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, test, result]);

  const handleSelect = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = useCallback(async () => {
    if (submitting || result) return;
    setSubmitting(true);
    const answerArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId: Number(questionId),
      selectedOption
    }));
    try {
      const res = await api.post(`/tests/${testId}/submit`, { answers: answerArray });
      setResult(res.data);
      toast.success(`Score: ${res.data.score}/${res.data.total}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  }, [answers, testId, submitting, result]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-10 h-10 border-3 border-violet-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Result Screen
  if (result) {
    const pct = Math.round((result.score / result.total) * 100);
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="card text-center py-12">
          <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-extrabold ${
            pct >= 70 ? 'bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/30' :
            pct >= 40 ? 'bg-amber-500/10 text-amber-500 border-2 border-amber-500/30' :
            'bg-rose-500/10 text-rose-500 border-2 border-rose-500/30'
          }`}>
            {pct}%
          </div>
          <h2 className="text-2xl font-bold mb-2">Test Complete!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-1">
            Subject: <strong>{test?.subject}</strong>
          </p>
          <p className="text-lg font-mono font-bold mb-6">
            Score: <span className={pct >= 70 ? 'text-emerald-500' : pct >= 40 ? 'text-amber-500' : 'text-rose-500'}>{result.score}</span> / {result.total}
          </p>
          <button
            onClick={() => navigate('/student/tests')}
            className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm px-6 py-2.5 rounded-lg cursor-pointer hover:opacity-90 transition"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const isUrgent = timeLeft <= 60;

  return (
    <div className="space-y-4">
      {/* Top Bar: Subject + Timer */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3">
        <div>
          <h2 className="font-bold text-lg">{test?.subject}</h2>
          <p className="text-[11px] text-slate-400">
            Question {currentQ + 1} of {questions.length} • {answeredCount}/{questions.length} answered
          </p>
        </div>
        <div className={`flex items-center gap-2 font-mono font-extrabold text-xl px-4 py-2 rounded-lg ${
          isUrgent
            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30 animate-pulse'
            : 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20'
        }`}>
          <Clock size={18} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-300"
          style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      {q && (
        <div className="card">
          <div className="mb-6">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-500 bg-violet-500/10 px-2 py-0.5 rounded">
              Question {currentQ + 1}
            </span>
            <h3 className="text-base font-semibold mt-3 leading-relaxed">{q.question}</h3>
          </div>

          <div className="space-y-3">
            {['a', 'b', 'c', 'd'].map(opt => {
              const isSelected = answers[q.questionId] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => handleSelect(q.questionId, opt)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-sm cursor-pointer ${
                    isSelected
                      ? 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-300 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold uppercase shrink-0 ${
                    isSelected
                      ? 'bg-violet-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {opt}
                  </span>
                  <span className="flex-1">{q.options[opt]}</span>
                  {isSelected && <CheckCircle2 size={18} className="text-violet-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQ(c => Math.max(0, c - 1))}
          disabled={currentQ === 0}
          className="flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {/* Question dots */}
        <div className="flex gap-1.5 flex-wrap justify-center">
          {questions.map((qq, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                i === currentQ
                  ? 'bg-violet-500 text-white shadow-md scale-110'
                  : answers[qq.questionId]
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentQ < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(c => Math.min(questions.length - 1, c + 1))}
            className="flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            <Send size={16} /> {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        )}
      </div>

      {/* Warning if time is low */}
      {isUrgent && (
        <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-lg px-4 py-2 text-xs font-semibold animate-pulse">
          <AlertTriangle size={14} /> Less than 1 minute remaining! Test will auto-submit when time runs out.
        </div>
      )}
    </div>
  );
}
