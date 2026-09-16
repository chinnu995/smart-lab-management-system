import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Play, Send, Upload, CheckCircle2, XCircle, Clock, Lock,
  RotateCcw, Trophy, FileText, MessageSquare, ListFilter, Sparkles, Terminal, Code2, AlertTriangle, ChevronDown
} from 'lucide-react';

const DEFAULT_LANG_STARTERS = {
  c: `#include <stdio.h>\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your solution here\n    return 0;\n}\n`,
  java: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n    }\n}\n`,
  python: `# Write your solution below\nimport sys\n\ndef solve():\n    # Read input from STDIN and print output to STDOUT\n    pass\n\nif __name__ == "__main__":\n    solve()\n`,
  javascript: `// Write your JavaScript solution below\nconst fs = require('fs');\n\nfunction solve() {\n    const input = fs.readFileSync(0, 'utf-8');\n    // Write your code here\n}\n\nsolve();\n`,
  sql: `-- Write your SQL query below\nSELECT * FROM table_name;\n`
};

export default function HackerRankIDE() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Problem State
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('problem'); // 'problem', 'submissions', 'leaderboard', 'discussions'

  // Code & Language State
  const [language, setLanguage] = useState('java');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [useCustomInput, setUseCustomInput] = useState(false);

  // Execution & Submissions State
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Fetch Problem Details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/coding/problems/${id}`);
        setProblem(res.data);

        if (res.data.isSubmitted && res.data.userSubmission) {
          const sub = res.data.userSubmission;
          setLanguage(sub.language || 'java');
          setCode(sub.code || '');
        } else {
          const starter = res.data.starterCode || {};
          const defaultLang = starter.java ? 'java' : starter.python ? 'python' : starter.c ? 'c' : starter.cpp ? 'cpp' : starter.javascript ? 'javascript' : 'java';
          setLanguage(defaultLang);
          setCode(starter[defaultLang] || DEFAULT_LANG_STARTERS[defaultLang] || '');
        }
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to load coding challenge details');
        navigate('/student/coding');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  // Handle Language Change
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const starter = problem?.starterCode || {};
    setCode(starter[newLang] || DEFAULT_LANG_STARTERS[newLang] || '');
  };

  // Fetch Submissions
  const fetchSubmissions = async () => {
    try {
      const res = await api.get(`/coding/problems/${problem.problemId}/submissions`);
      setSubmissions(res.data || []);
    } catch (e) {}
  };

  // Fetch Leaderboard
  const fetchLeaderboard = async () => {
    try {
      const res = await api.get(`/coding/problems/${problem.problemId}/leaderboard`);
      setLeaderboard(res.data || []);
    } catch (e) {}
  };

  useEffect(() => {
    if (!problem) return;
    if (activeTab === 'submissions') fetchSubmissions();
    if (activeTab === 'leaderboard') fetchLeaderboard();
  }, [activeTab, problem]);

  // Run Code Handler
  const handleRunCode = async () => {
    if (running || submitting) return;
    setRunning(true);
    setRunResult(null);
    const tid = toast.loading('Executing sample test cases...');
    try {
      const res = await api.post('/coding/run', {
        problemId: problem.problemId,
        language,
        code,
        customInput: useCustomInput ? customInput : undefined
      });
      toast.dismiss(tid);
      setRunResult(res.data);
      if (res.data.allPassed) {
        toast.success('Sample Testcases Passed!');
      } else if (res.data.custom && res.data.passed) {
        toast.success('Custom Code Executed');
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

  // Submit Code Handler
  const handleSubmitCode = async () => {
    if (running || submitting) return;
    setSubmitting(true);
    setRunResult(null);
    const tid = toast.loading('Evaluating solution against hidden test cases...');
    try {
      const res = await api.post('/coding/submit', {
        problemId: problem.problemId,
        language,
        code
      });
      toast.dismiss(tid);
      setRunResult({
        isSubmission: true,
        ...res.data
      });
      if (res.data.allPassed) {
        toast.success('Congratulations! Challenge Solved!');
        fetchSubmissions();
      } else {
        toast.error(`Submission Status: ${res.data.status}`);
      }
    } catch (err) {
      toast.dismiss(tid);
      toast.error(err.response?.data?.error || 'Submission error');
    } finally {
      setSubmitting(false);
    }
  };

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

  if (loading || !problem) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-white">
        <div className="animate-spin w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const lineCount = (code.match(/\n/g) || []).length + 1;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-950 text-slate-100 font-sans overflow-hidden -m-6 relative">
      {/* Top Header Bar */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/coding')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer border-0 bg-transparent"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            {problem.title}
          </h1>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            problem.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
            problem.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
          }`}>
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <button
            onClick={() => {
              const starter = problem?.starterCode || {};
              setCode(starter[language] || DEFAULT_LANG_STARTERS[language] || '');
              toast.success('Code reset to template');
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition cursor-pointer"
            title="Reset code template"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Dual Panel Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* ========================================================================= */}
        {/* LEFT PANEL: Problem Description, Submissions, Leaderboard */}
        {/* ========================================================================= */}
        <div className="w-1/2 border-r border-slate-800 flex flex-col bg-slate-900 overflow-hidden">
          {/* Navigation Tabs Bar */}
          <div className="h-10 bg-slate-950 border-b border-slate-800 flex items-center px-2 gap-1 text-xs font-bold shrink-0">
            {[
              { id: 'problem', label: 'Problem', icon: FileText },
              { id: 'submissions', label: 'Submissions', icon: Clock },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              { id: 'discussions', label: 'Discussions', icon: MessageSquare }
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition cursor-pointer border-0 ${
                    active
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Left Panel Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-300 text-sm leading-relaxed">
            {activeTab === 'problem' && (
              <>
                {/* Problem Statement */}
                <div className="space-y-3">
                  <div className="prose prose-invert max-w-none text-slate-300 text-sm whitespace-pre-line">
                    {problem.description}
                  </div>
                </div>

                {/* Input Format */}
                {problem.inputFormat && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Input Format</h3>
                    <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800 font-mono">
                      {problem.inputFormat}
                    </p>
                  </div>
                )}

                {/* Output Format */}
                {problem.outputFormat && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Output Format</h3>
                    <p className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800 font-mono">
                      {problem.outputFormat}
                    </p>
                  </div>
                )}

                {/* Constraints */}
                {problem.constraints && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Constraints</h3>
                    <pre className="text-xs text-slate-300 bg-slate-950/70 p-3 rounded-lg border border-slate-800 font-mono whitespace-pre-wrap">
                      {problem.constraints}
                    </pre>
                  </div>
                )}

                {/* Sample Test Cases (5 Total) */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-violet-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <CheckCircle2 size={15} /> Sample Test Cases ({problem.sampleCases?.length || 5} Testcases)
                  </h3>
                  {(problem.sampleCases || []).map((sc, idx) => (
                    <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-400 font-mono text-[11px] font-bold border border-violet-500/20">
                        Test Case #{idx + 1}
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Input:</span>
                          <pre className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed select-all">
                            {sc.input || '(empty input)'}
                          </pre>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected Output:</span>
                          <pre className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed select-all">
                            {sc.output || '(empty output)'}
                          </pre>
                        </div>
                      </div>
                      {sc.explanation && (
                        <p className="text-[11px] text-slate-400 italic pt-1">
                          Note: {sc.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-white">Your Past Submissions</h3>
                {!submissions.length ? (
                  <p className="text-xs text-slate-500">No submissions recorded for this challenge yet.</p>
                ) : (
                  <div className="space-y-3">
                    {submissions.map((s) => (
                      <div key={s.submission_id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="space-y-1">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                            s.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {s.status}
                          </span>
                          <p className="text-slate-400 font-mono text-[11px] pt-1">
                            Passed {s.passed_cases}/{s.total_cases} testcases • {s.language}
                          </p>
                        </div>
                        <div className="text-right text-[11px] text-slate-400 font-mono">
                          <div>{s.execution_time_ms} ms</div>
                          <div>{new Date(s.submitted_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'leaderboard' && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-white">Challenge Leaderboard</h3>
                {!leaderboard.length ? (
                  <p className="text-xs text-slate-500">Be the first to solve this challenge and take the top spot!</p>
                ) : (
                  <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                          <th className="p-3">Rank</th>
                          <th className="p-3">Student</th>
                          <th className="p-3">USN</th>
                          <th className="p-3 text-center">Runtime</th>
                          <th className="p-3 text-right">Language</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {leaderboard.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40 text-slate-200">
                            <td className="p-3 font-bold text-violet-400">#{idx + 1}</td>
                            <td className="p-3 font-semibold text-white">{row.full_name}</td>
                            <td className="p-3 font-mono text-slate-400">{row.usn}</td>
                            <td className="p-3 text-center font-mono text-emerald-400 font-bold">{row.execution_time_ms} ms</td>
                            <td className="p-3 text-right uppercase text-slate-400 font-mono">{row.language}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'discussions' && (
              <div className="space-y-3 text-xs text-slate-400 text-center py-12">
                <MessageSquare size={36} className="mx-auto text-slate-700" />
                <p>Discussion forum for this challenge will open once test series ends.</p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT PANEL: HackerRank Code Editor & Execution Drawer */}
        {/* ========================================================================= */}
        <div className="w-1/2 flex flex-col bg-slate-950 overflow-hidden">
          {/* Language Selector Header */}
          <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <Code2 size={15} className="text-violet-400" />
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
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
              Line: {lineCount} Col: 1
            </div>
          </div>

          {/* Code Editor Container */}
          <div className="flex-1 flex relative font-mono text-xs leading-relaxed overflow-hidden bg-slate-950">
            {/* Line Numbers Gutter */}
            <div className="w-12 bg-slate-950/80 border-r border-slate-800 text-slate-600 select-none py-3 text-right pr-3 font-mono text-[11px] shrink-0">
              {Array.from({ length: Math.max(lineCount, 25) }, (_, i) => (
                <div key={i + 1}>{i + 1}</div>
              ))}
            </div>

            {/* Editable Textarea */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const start = e.target.selectionStart;
                  const end = e.target.selectionEnd;
                  const newCode = code.substring(0, start) + '    ' + code.substring(end);
                  setCode(newCode);
                  setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd = start + 4;
                  }, 0);
                }
              }}
              spellCheck="false"
              className="flex-1 bg-transparent text-amber-200/90 p-3 focus:outline-none resize-none font-mono text-xs leading-relaxed whitespace-pre overflow-auto"
            />
          </div>

          {/* Test Case Output Drawer / Result Console */}
          {runResult && (
            <div className="bg-slate-900 border-t border-slate-800 p-4 max-h-56 overflow-y-auto space-y-3 shrink-0 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Terminal size={14} className="text-violet-400" />
                  {runResult.isSubmission ? 'Submission Evaluation Result' : 'Sample Test Run Result'}
                </span>
                <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                  runResult.allPassed || runResult.status === 'Accepted'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {runResult.status || (runResult.allPassed ? 'All Testcases Passed' : 'Testcase Failed')}
                </span>
              </div>

              {/* Single stdout output for custom input */}
              {runResult.custom ? (
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold">Standard Output:</span>
                  <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-200 font-mono text-xs whitespace-pre-wrap">
                    {runResult.stdout || 'No output produced'}
                  </pre>
                </div>
              ) : (
                /* Multi testcase results */
                <div className="space-y-2">
                  {(runResult.results || []).map((res, i) => (
                    <div key={i} className={`p-3 rounded-lg border font-mono text-xs space-y-1.5 ${
                      res.passed
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1">
                          {res.passed ? <CheckCircle2 size={14} className="text-emerald-400" /> : <XCircle size={14} className="text-rose-400" />}
                          Test Case #{res.testCase}
                        </span>
                        <span className="text-[10px] text-slate-400">{res.executionTimeMs} ms</span>
                      </div>

                      {!res.passed && (
                        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold uppercase">Expected Output:</span>
                            <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-slate-200 mt-1 whitespace-pre-wrap">
                              {res.expectedOutput}
                            </pre>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] font-bold uppercase">Your Output:</span>
                            <pre className="bg-slate-950 p-2 rounded border border-slate-800 text-rose-300 mt-1 whitespace-pre-wrap">
                              {res.actualOutput}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Custom Input Drawer Checkbox */}
          {useCustomInput && (
            <div className="bg-slate-900 border-t border-slate-800 p-3 space-y-1.5 shrink-0">
              <label className="text-[11px] font-bold text-slate-400 block">Custom Standard Input (stdin):</label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Enter custom input lines..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded p-2 text-xs font-mono focus:outline-none focus:border-violet-500 h-16 resize-none"
              />
            </div>
          )}

          {/* Action Control Bar */}
          <div className="h-14 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-300">
              {/* File upload option */}
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer text-slate-200">
                <Upload size={14} /> Upload Code as File
                <input type="file" onChange={handleFileUpload} className="hidden" accept=".java,.py,.js,.cpp,.c,.sql,.txt" />
              </label>

              {/* Test custom input checkbox */}
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-400 hover:text-slate-200">
                <input
                  type="checkbox"
                  checked={useCustomInput}
                  onChange={(e) => setUseCustomInput(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-0 cursor-pointer"
                />
                Test against custom input
              </label>
            </div>

            {/* Run & Submit Buttons */}
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
                {submitting ? 'Submitting...' : 'Submit Code'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
