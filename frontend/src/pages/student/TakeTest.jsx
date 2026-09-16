import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Clock, ChevronLeft, ChevronRight, Send, AlertTriangle, CheckCircle2, 
  XCircle, Sparkles, Brain, Lightbulb, Target, ArrowLeft, RefreshCw, BookOpen, Check, X,
  ShieldAlert, Maximize2, Shield
} from 'lucide-react';

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
  const [result, setResult] = useState(null);   // { score, total, percentage, review, aiFeedback }
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'correct', 'incorrect'

  // Malpractice & Proctoring State
  const [warningCount, setWarningCount] = useState(0);
  const [malpracticeModal, setMalpracticeModal] = useState({ open: false, reason: '', count: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const requestFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    }
  };

  // Fetch test details or past result
  useEffect(() => {
    const load = async () => {
      try {
        // First try fetching test questions
        const res = await api.get(`/tests/${testId}`);
        setTest(res.data);
        setQuestions(res.data.questions || []);
        setTimeLeft((res.data.duration || 10) * 60);
      } catch (err) {
        // If already submitted or test unavailable, attempt to load result
        try {
          const resResult = await api.get(`/tests/${testId}/my-result`);
          setResult(resResult.data);
        } catch (resErr) {
          toast.error('Failed to load test details');
          navigate('/student/tests');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [testId, navigate]);

  // Attempt auto-fullscreen when test is loaded
  useEffect(() => {
    if (test && !result) {
      requestFullscreen();
    }
  }, [test, result]);

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
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      toast.success(`Test Completed! Score: ${res.data.score}/${res.data.total}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit test');
    } finally {
      setSubmitting(false);
    }
  }, [answers, testId, submitting, result]);

  // Proctoring & Tab Switch Listener
  useEffect(() => {
    if (!test || result) return;

    let isSubmittingAuto = false;

    const reportMalpractice = async (reason) => {
      setWarningCount(prev => {
        const newCount = prev + 1;

        api.post('/tests/malpractice-log', {
          testId,
          testType: 'mcq',
          subject: test?.subject,
          reason,
          warningCount: newCount
        }).catch(() => {});

        if (newCount >= 3) {
          if (!isSubmittingAuto) {
            isSubmittingAuto = true;
            toast.error('🚨 MAX MALPRACTICE WARNINGS EXCEEDED (3/3). Test is auto-submitting now!');
            if (document.exitFullscreen && document.fullscreenElement) {
              document.exitFullscreen().catch(() => {});
            }
            handleSubmit();
          }
        } else {
          setMalpracticeModal({ open: true, reason, count: newCount });
        }

        return newCount;
      });
    };

    const handleFullscreenChange = () => {
      const inFS = !!document.fullscreenElement;
      setIsFullscreen(inFS);
      if (!inFS && !result) {
        reportMalpractice('Exited Fullscreen Proctored Mode');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !result) {
        reportMalpractice('Switched Browser Tab or Minimized Window');
      }
    };

    const handleBlur = () => {
      if (!result) {
        reportMalpractice('Window Focus Lost (Alt-Tab / External Application)');
      }
    };

    // Intercept clicks on sidebar buttons, navbar links, and external UI elements
    const handleGlobalClick = (e) => {
      if (!test || result) return;
      const testRoot = document.getElementById('proctored-test-root');
      if (testRoot && !testRoot.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        reportMalpractice('Attempted to click sidebar / navigation button during test');
      }
    };

    // Intercept browser refresh / tab close
    const handleBeforeUnload = (e) => {
      if (!test || result) return;
      e.preventDefault();
      reportMalpractice('Attempted to refresh or close test page');
      e.returnValue = '';
      return '';
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('click', handleGlobalClick, true);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('click', handleGlobalClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [test, result, testId, handleSubmit]);

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

  // =========================================================================
  // Detailed Test Result & AI Improvement Suggestions Screen
  // =========================================================================
  if (result) {
    const pct = result.percentage !== undefined ? result.percentage : Math.round((result.score / result.total) * 100);
    const reviewList = result.review || [];
    const ai = result.aiFeedback || {};

    const filteredReview = reviewList.filter(item => {
      if (filterTab === 'correct') return item.isCorrect;
      if (filterTab === 'incorrect') return !item.isCorrect;
      return true;
    });

    const correctCount = reviewList.filter(r => r.isCorrect).length;
    const incorrectCount = reviewList.length - correctCount;

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-violet-900 via-slate-900 to-purple-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-violet-500/20">
          <div className="absolute right-0 top-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-bold">
                <Sparkles size={14} className="text-violet-400" />
                MCQ Test Assessment Completed
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {result.subject || test?.subject || 'MCQ Test'} Performance Result
              </h1>
              <p className="text-xs md:text-sm text-violet-200/80">
                Detailed answer key, right vs wrong responses, and AI study improvement tips.
              </p>
            </div>

            {/* Score Badge Circle */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 shadow-xl backdrop-blur-md ${
                pct >= 80 ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' :
                pct >= 50 ? 'bg-amber-500/10 border-amber-500 text-amber-400' :
                'bg-rose-500/10 border-rose-500 text-rose-400'
              }`}>
                <span className="text-3xl font-black font-mono tracking-tighter">{pct}%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                  {result.score} / {result.total} Correct
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 🤖 AI Improvement Suggestions & Insights Box */}
        <div className="card bg-gradient-to-br from-violet-50/90 to-purple-50/90 dark:from-slate-900/90 dark:to-violet-950/40 border-2 border-violet-200 dark:border-violet-800/60 shadow-lg p-6 rounded-3xl space-y-5">
          <div className="flex items-center justify-between border-b border-violet-200 dark:border-violet-800/50 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-600 text-white flex items-center justify-center shadow-md">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
                  AI Academic Coach Insights
                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-600 text-white">
                    Powered by Gemini AI
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Personalized performance analysis and study recommendations
                </p>
              </div>
            </div>
          </div>

          {/* AI Summary Assessment */}
          {ai.summary && (
            <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-violet-100 dark:border-slate-700 shadow-sm text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed flex items-start gap-3">
              <Brain size={20} className="text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 dark:text-white font-bold block mb-1">Performance Summary:</strong>
                {ai.summary}
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Strong Concepts Mastered ({correctCount})
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium pl-1">
                {(ai.strengths || []).map((st, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    {st}
                  </li>
                ))}
              </ul>
            </div>

            {/* Concepts needing review */}
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Target size={16} /> Concepts Needing Revision ({incorrectCount})
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium pl-1">
                {(ai.weaknesses || []).map((wk, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                    <span className="truncate">{wk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Recommended Study Action Plan */}
          {ai.recommendations && ai.recommendations.length > 0 && (
            <div className="bg-white/90 dark:bg-slate-800/90 p-4 rounded-2xl border border-violet-200 dark:border-slate-700 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                <Lightbulb size={16} className="text-amber-500" /> AI Recommended Action Plan for Improvement
              </h4>
              <div className="grid md:grid-cols-3 gap-3 pt-1">
                {ai.recommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-200 flex flex-col justify-between">
                    <span className="text-[10px] font-extrabold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">
                      Step {i + 1}
                    </span>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Answer Key & Breakdown Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white flex items-center gap-2">
                <BookOpen size={18} className="text-violet-500" /> Detailed Question Answer Key
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect correct options vs options you selected
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                All ({reviewList.length})
              </button>
              <button
                onClick={() => setFilterTab('correct')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterTab === 'correct'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600'
                }`}
              >
                Correct ({correctCount})
              </button>
              <button
                onClick={() => setFilterTab('incorrect')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterTab === 'incorrect'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-rose-600'
                }`}
              >
                Incorrect ({incorrectCount})
              </button>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-4">
            {filteredReview.map((item, idx) => {
              const qIndex = reviewList.findIndex(r => r.questionId === item.questionId);
              return (
                <div
                  key={item.questionId}
                  className={`card p-5 rounded-2xl border-2 transition-all ${
                    item.isCorrect
                      ? 'border-emerald-500/30 bg-emerald-500/[0.02] dark:bg-emerald-950/[0.05]'
                      : 'border-rose-500/30 bg-rose-500/[0.02] dark:bg-rose-950/[0.05]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center text-white ${
                        item.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}>
                        {qIndex + 1}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        item.isCorrect
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                      }`}>
                        {item.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 leading-relaxed">
                    {item.question}
                  </h4>

                  {/* Options List */}
                  <div className="grid sm:grid-cols-2 gap-2.5">
                    {['a', 'b', 'c', 'd'].map(optKey => {
                      const optText = item.options[optKey];
                      const isUserSelected = item.selectedOption === optKey;
                      const isCorrectOption = item.correctOption === optKey;

                      let styleClass = 'border-slate-200 dark:border-slate-700/70 bg-slate-50/50 dark:bg-slate-850/50 text-slate-700 dark:text-slate-300';
                      let icon = null;

                      if (isCorrectOption) {
                        styleClass = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold shadow-xs';
                        icon = <Check size={16} className="text-emerald-500 shrink-0" />;
                      } else if (isUserSelected && !item.isCorrect) {
                        styleClass = 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold shadow-xs';
                        icon = <X size={16} className="text-rose-500 shrink-0" />;
                      }

                      return (
                        <div
                          key={optKey}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 text-xs transition ${styleClass}`}
                        >
                          <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold uppercase shrink-0 ${
                            isCorrectOption ? 'bg-emerald-500 text-white' :
                            isUserSelected && !item.isCorrect ? 'bg-rose-500 text-white' :
                            'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}>
                            {optKey}
                          </span>
                          <span className="flex-1">{optText}</span>
                          {icon}
                          {isUserSelected && (
                            <span className="text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              Your Pick
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center pt-4">
          <button
            onClick={() => navigate('/student/tests')}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition cursor-pointer"
          >
            <ArrowLeft size={16} /> Return to My Tests
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  const answeredCount = Object.keys(answers).length;
  const isUrgent = timeLeft < 60;

  return (
    <div id="proctored-test-root" className="space-y-4 relative">
      {/* Proctored Security & Anti-Cheating Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white px-5 py-2.5 rounded-xl flex items-center justify-between border border-rose-500/30 shadow-md text-xs font-semibold">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-rose-400 animate-pulse shrink-0" />
          <span>Proctored Assessment Active — Fullscreen & Tab Monitoring Enabled</span>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-[11px] ${
            warningCount === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
            warningCount === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
            'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
          }`}>
            Malpractice Warnings: {warningCount} / 3
          </span>

          {!isFullscreen && (
            <button
              onClick={requestFullscreen}
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded text-[11px] font-bold transition shadow-xs cursor-pointer border-0"
            >
              <Maximize2 size={12} /> Enter Fullscreen
            </button>
          )}
        </div>
      </div>

      {/* Malpractice Warning Modal Overlay */}
      {malpracticeModal.open && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl text-white animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-extrabold px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Proctoring Violation #{malpracticeModal.count} of 3
              </span>
              <h3 className="text-xl font-black mt-3 text-rose-400">MALPRACTICE WARNING</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {malpracticeModal.reason}
              </p>
              <p className="text-[11px] text-rose-300 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 mt-3 font-semibold">
                ⚠️ Notice: This activity has been recorded and directly transmitted to your subject faculty. (3 violations will auto-terminate your test).
              </p>
            </div>
            <button
              onClick={() => {
                setMalpracticeModal({ open: false, reason: '', count: 0 });
                requestFullscreen();
              }}
              className="w-full bg-rose-600 hover:bg-rose-500 font-bold text-xs py-3 rounded-xl transition shadow-lg cursor-pointer border-0"
            >
              I Understand & Resume Test (Return to Fullscreen)
            </button>
          </div>
        </div>
      )}

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
