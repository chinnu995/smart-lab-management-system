import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Play, Send, Upload, CheckCircle2, XCircle, Clock, Lock,
  RotateCcw, Trophy, FileText, Terminal, Code2, AlertTriangle, ShieldAlert, Maximize2, Award
} from 'lucide-react';

const DEFAULT_LANG_STARTERS = {
  c: `#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
  java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n    }\n}\n`,
  python: `# Write your solution below\nimport sys\n\ndef solve():\n    # Read input from STDIN and print output to STDOUT\n    pass\n\nif __name__ == "__main__":\n    solve()\n`,
  javascript: `// Write your JavaScript solution below\nconst fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf-8');\n    // Write your code here\n}\n\nsolve();\n`,
  sql: `-- Write your SQL query below\nSELECT * FROM table_name;\n`
};

export default function TakeCodingTest() {
  const { testId } = useParams();
  const navigate = useNavigate();

  // Test & Problem State
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Code & Execution State
  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [useCustomInput, setUseCustomInput] = useState(false);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(600); // seconds

  // Malpractice & Proctoring State
  const [warningCount, setWarningCount] = useState(0);
  const [malpracticeModal, setMalpracticeModal] = useState({ open: false, reason: '', count: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const requestFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    }
  };

  // Fetch Assigned Coding Problem & Test Details
  useEffect(() => {
    const fetchTestDetails = async () => {
      try {
        const res = await api.get(`/tests/coding/${testId}`);
        setTestData(res.data);
        setTimeLeft((res.data.duration || 10) * 60);

        if (res.data.isSubmitted && res.data.userSubmission) {
          const sub = res.data.userSubmission;
          setLanguage(sub.language || 'java');
          setCode(sub.code || '');
          setSubmissionResult({
            score: res.data.userSubmission.score || 100,
            submittedAt: res.data.userSubmission.submittedAt
          });
        } else {
          const prob = res.data.assignedProblem || {};
          const starter = prob.starterCode || {};
          const defaultLang = starter.java ? 'java' : starter.python ? 'python' : starter.c ? 'c' : starter.cpp ? 'cpp' : 'java';
          setLanguage(defaultLang);
          setCode(starter[defaultLang] || DEFAULT_LANG_STARTERS[defaultLang] || '');
        }
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to load assigned coding lab test');
        navigate('/student/tests');
      } finally {
        setLoading(false);
      }
    };
    fetchTestDetails();
  }, [testId, navigate]);

  // Auto-fullscreen when test is loaded
  useEffect(() => {
    if (testData && !testData.isSubmitted) {
      requestFullscreen();
    }
  }, [testData]);

  // Exam Countdown Timer
  useEffect(() => {
    if (!testData || testData.isSubmitted || submissionResult) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('⏰ Time limit reached! Auto-submitting your coding test solution now...');
          handleSubmitCode();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testData, submissionResult]);

  // Handle Language Change
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const starter = testData?.assignedProblem?.starterCode || {};
    setCode(starter[newLang] || DEFAULT_LANG_STARTERS[newLang] || '');
  };

  // Run Sample Testcases
  const handleRunCode = async () => {
    if (running || submitting || submissionResult) return;
    setRunning(true);
    setRunResult(null);
    const tid = toast.loading('Executing sample test cases...');
    try {
      const res = await api.post('/coding/run', {
        problemId: testData.assignedProblem.problem_id,
        language,
        code,
        customInput: useCustomInput ? customInput : undefined
      });
      toast.dismiss(tid);
      setRunResult(res.data);
      if (res.data.allPassed) {
        toast.success('Sample Testcases Passed!');
      } else {
        toast.error('Testcase evaluation failed');
      }
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.response?.data?.error || 'Execution failed');
    } finally {
      setRunning(false);
    }
  };

  // Submit Final Solution for Coding Test
  const handleSubmitCode = async () => {
    if (running || submitting || submissionResult) return;
    setSubmitting(true);
    setRunResult(null);
    const tid = toast.loading('Evaluating solution against hidden test cases...');
    try {
      const res = await api.post(`/tests/coding/${testId}/submit`, {
        problemId: testData.assignedProblem.problem_id,
        language,
        code
      });
      toast.dismiss(tid);
      setSubmissionResult(res.data);
      toast.success('🎉 Coding Lab Test Submitted Successfully!');
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Tab Switch & Proctoring Security Listener
  useEffect(() => {
    if (!testData || testData.isSubmitted || submissionResult) return;

    let isSubmittingAuto = false;

    const reportMalpractice = async (reason) => {
      setWarningCount(prev => {
        const newCount = prev + 1;

        api.post('/tests/malpractice-log', {
          testId: testData.testId,
          problemId: testData.assignedProblem?.problem_id,
          testType: 'coding',
          subject: testData.subject,
          reason,
          warningCount: newCount
        }).catch(() => {});

        if (newCount >= 3) {
          if (!isSubmittingAuto) {
            isSubmittingAuto = true;
            toast.error('🚨 MAX MALPRACTICE WARNINGS EXCEEDED (3/3). Test auto-submitting now!');
            if (document.exitFullscreen && document.fullscreenElement) {
              document.exitFullscreen().catch(() => {});
            }
            handleSubmitCode();
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
      if (!inFS && !submissionResult) {
        reportMalpractice('Exited Fullscreen Proctored Mode during Coding Test');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !submissionResult) {
        reportMalpractice('Switched Browser Tab or Minimized Window during Coding Test');
      }
    };

    const handleBlur = () => {
      if (!submissionResult) {
        reportMalpractice('Window Focus Lost (Alt-Tab / External App) during Coding Test');
      }
    };

    // Capture-phase click interception
    const handleGlobalClick = (e) => {
      if (submissionResult) return;
      const rootEl = document.getElementById('proctored-coding-test-root');
      if (rootEl && !rootEl.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        reportMalpractice('Attempted to click sidebar / navigation button during Coding Test');
      }
    };

    // Before unload / tab close
    const handleBeforeUnload = (e) => {
      if (submissionResult) return;
      e.preventDefault();
      reportMalpractice('Attempted to refresh or close Coding Test page');
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
  }, [testData, submissionResult, handleSubmitCode]);

  // Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCode(evt.target.result);
      toast.success(`Uploaded ${file.name}`);
    };
    reader.readAsText(file);
  };

  if (loading || !testData) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-white">
        <div className="animate-spin w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const problem = testData.assignedProblem || {};
  const lineCount = (code.match(/\n/g) || []).length + 1;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div id="proctored-coding-test-root" className="flex flex-col h-[calc(100vh-80px)] bg-slate-950 text-slate-100 font-sans overflow-hidden -m-6 relative">
      {/* Malpractice Warning Modal Overlay */}
      {malpracticeModal.open && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
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
                ⚠️ Notice: This activity has been recorded and transmitted to your subject faculty. (3 violations will auto-terminate your test).
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

      {/* Top Proctored Security Header Bar */}
      {!submissionResult && (
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white px-4 py-1.5 flex items-center justify-between border-b border-rose-500/30 text-xs font-semibold shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert size={15} className="text-rose-400 animate-pulse shrink-0" />
            <span>Proctored Coding Test: <strong>{testData.subject}</strong> — Batch #{testData.batchIndex} (Q{testData.questionNumberInBatch} of {testData.totalInPool} Assigned)</span>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1 font-mono font-bold text-xs px-2.5 py-0.5 rounded-full ${
              timeLeft < 180 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' : 'bg-slate-800 text-amber-300 border border-slate-700'
            }`}>
              <Clock size={13} /> {timeFormatted}
            </div>

            <span className={`px-2.5 py-0.5 rounded-full font-bold font-mono text-[10px] ${
              warningCount === 0 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
              warningCount === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
            }`}>
              Warnings: {warningCount} / 3
            </span>

            {!isFullscreen && (
              <button
                onClick={requestFullscreen}
                className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer border-0"
              >
                <Maximize2 size={11} /> Fullscreen
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL: Assigned Problem Statement */}
        <div className="w-1/2 border-r border-slate-800 flex flex-col bg-slate-900 overflow-hidden">
          <div className="h-10 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4 text-xs font-bold shrink-0">
            <span className="text-violet-400 flex items-center gap-1.5">
              <FileText size={14} /> Assigned Problem Details
            </span>
            <span className="bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded font-mono text-[10px] border border-violet-500/20">
              Batch #{testData.batchIndex} • Q{testData.questionNumberInBatch} of {testData.totalInPool}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 text-sm leading-relaxed">
            {/* Title & Difficulty */}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold text-white">{problem.title || 'Assigned Coding Program'}</h1>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  problem.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  problem.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {problem.difficulty || 'Medium'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Subject: {testData.subject} Lab Practical Exam</p>
            </div>

            {/* Description */}
            <div className="prose prose-invert max-w-none text-slate-300 text-sm whitespace-pre-line bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              {problem.description || 'Complete the assigned lab program solution.'}
            </div>

            {/* Input & Output Format */}
            {problem.inputFormat && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase text-slate-400">Input Format</h3>
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
                  {problem.inputFormat}
                </p>
              </div>
            )}

            {problem.outputFormat && (
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase text-slate-400">Output Format</h3>
                <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
                  {problem.outputFormat}
                </p>
              </div>
            )}

            {/* Sample Testcases */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase text-violet-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <CheckCircle2 size={15} /> Sample Test Cases
              </h3>
              {(problem.sample_cases || []).map((sc, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-violet-400 font-mono">Test Case #{idx + 1}</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Input:</span>
                      <pre className="bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto">
                        {sc.input || '(empty)'}
                      </pre>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Expected Output:</span>
                      <pre className="bg-slate-900 p-2.5 rounded border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto">
                        {sc.output || '(empty)'}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Code Editor & Submission Console */}
        <div className="w-1/2 flex flex-col bg-slate-950 overflow-hidden">
          {/* Header */}
          <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <Code2 size={15} className="text-violet-400" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                disabled={!!submissionResult}
                className="bg-slate-950 text-slate-200 border border-slate-700 rounded px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option value="java">Java</option>
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
                <option value="sql">SQL</option>
              </select>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Line: {lineCount}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex relative font-mono text-xs leading-relaxed overflow-hidden bg-slate-950">
            <div className="w-12 bg-slate-950/80 border-r border-slate-800 text-slate-600 select-none py-3 text-right pr-3 font-mono text-[11px] shrink-0">
              {Array.from({ length: Math.max(lineCount, 25) }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={!!submissionResult}
              spellCheck="false"
              className="flex-1 bg-transparent text-amber-200/90 p-3 focus:outline-none resize-none font-mono text-xs leading-relaxed whitespace-pre overflow-auto"
            />
          </div>

          {/* Submission Result / Sample Console */}
          {submissionResult ? (
            <div className="bg-slate-900 border-t border-slate-800 p-6 text-center space-y-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <Award size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Coding Test Submitted</h3>
                <p className="text-xs text-slate-400 mt-1">Score: <strong className="text-emerald-400 text-sm">{submissionResult.score || 100} / 100</strong></p>
              </div>
              <button
                onClick={() => navigate('/student/tests')}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer border-0"
              >
                Return to My Tests
              </button>
            </div>
          ) : (
            runResult && (
              <div className="bg-slate-900 border-t border-slate-800 p-4 max-h-48 overflow-y-auto space-y-2 shrink-0 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Terminal size={14} className="text-violet-400" /> Sample Execution Result
                  </span>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                    runResult.allPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {runResult.allPassed ? 'Sample Testcases Passed' : 'Testcase Failed'}
                  </span>
                </div>
                {(runResult.results || []).map((res, i) => (
                  <div key={i} className={`p-2 rounded border font-mono text-[11px] ${
                    res.passed ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                  }`}>
                    Test Case #{res.testCase}: {res.passed ? 'PASSED' : `FAILED (Expected: ${res.expectedOutput}, Got: ${res.actualOutput})`}
                  </div>
                ))}
              </div>
            )
          )}

          {/* Action Control Bar */}
          {!submissionResult && (
            <div className="h-14 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between shrink-0">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer text-xs text-slate-200">
                <Upload size={14} /> Upload File
                <input type="file" onChange={handleFileUpload} className="hidden" accept=".java,.py,.js,.cpp,.c,.sql,.txt" />
              </label>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRunCode}
                  disabled={running || submitting}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2 rounded-lg transition border border-slate-700 cursor-pointer"
                >
                  <Play size={14} className="text-emerald-400" />
                  {running ? 'Running...' : 'Run Code'}
                </button>

                <button
                  onClick={handleSubmitCode}
                  disabled={running || submitting}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-5 py-2 rounded-lg transition shadow-md cursor-pointer border-0"
                >
                  <Send size={14} />
                  {submitting ? 'Submitting...' : 'Submit Coding Test'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
