import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  Cpu, Database, Calculator, Bot, Code2, Code, Coffee, Terminal, 
  Gem, Server, TerminalSquare, Binary, Regex, Component, Sparkles, ChevronRight, CheckCircle, ArrowRight,
  Flame, Briefcase, Award, Zap, BookOpen, Filter, Upload, FileText, Check, AlertCircle, X, Loader2, Search,
  CheckCircle2, PlusCircle, MinusCircle, Layers, Activity
} from 'lucide-react';
import { DEPARTMENTS } from '../../utils/deptUtils.js';

const ICON_MAP = {
  Cpu, Database, Calculator, Bot, Code2, Code, Coffee, Terminal,
  Gem, Server, TerminalSquare, Binary, Regex, Component, FileText: Terminal
};

// General Practice categories preserved so no existing cards are lost
const GENERAL_CATEGORIES = [
  { id: 'dsa', name: 'DSA', icon: 'Binary', count: 10, description: 'Data Structures & Algorithms, Trees, Graphs & Dynamic Programming' },
  { id: 'ada', name: 'ADA', icon: 'Cpu', count: 10, description: 'Analysis & Design of Algorithms, Sorting, Searching & Graphs' },
  { id: 'dbms', name: 'DBMS', icon: 'Database', count: 10, description: 'Database Management Systems, Relational Algebra & SQL' },
  { id: 'latex', name: 'LATEX', icon: 'FileText', count: 8, description: 'LaTeX Document Formatting, Mathematical Typesetting & Tables' },
  { id: 'mongodb', name: 'MONGODB', icon: 'Server', count: 10, description: 'NoSQL Document Database, Aggregation & BSON Queries' },
  { id: 'ai', name: 'AI', icon: 'Bot', count: 10, description: 'Artificial Intelligence, Heuristic Search & Machine Learning' },
  { id: 'java', name: 'JAVA', icon: 'Coffee', count: 12, description: 'Java OOPs, Primitive Types, Collections & Exception Handling' },
  { id: 'python', name: 'PYTHON', icon: 'Terminal', count: 12, description: 'Python Scripting, List Comprehensions & Data Structures' },
  { id: 'os', name: 'OPERATING SYSTEMS', icon: 'TerminalSquare', count: 10, description: 'Process Management, Synchronization & Shell Commands' }
];

export default function PracticeSkills() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  // Curriculum & Subjects State
  const [subjects, setSubjects] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [missingScheme, setMissingScheme] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab State: 'labs' (labs & electives) vs 'practice' (activity subjects)
  const [activeTab, setActiveTab] = useState('labs');

  // Semester Selector (default: current student semester, or 1)
  const [selectedSemester, setSelectedSemester] = useState(null);

  // Faculty / HOD Filter Controls
  const [facScheme, setFacScheme] = useState('all');
  const [facDept, setFacDept] = useState('all');
  const [facSemester, setFacSemester] = useState('all');

  // Placement Patterns & Top Companies State
  const [patterns, setPatterns] = useState([]);
  const [selectedPatternSubject, setSelectedPatternSubject] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [patternSearch, setPatternSearch] = useState('');

  // HOD CSV Modal
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvPreview, setCsvPreview] = useState(null);
  const [csvValidating, setCsvValidating] = useState(false);
  const [csvImporting, setCsvImporting] = useState(false);

  // Profile Modal for users with missing scheme
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileScheme, setProfileScheme] = useState('2022');
  const [profileDept, setProfileDept] = useState('Computer Science & Engineering');
  const [profileSem, setProfileSem] = useState(3);
  const [savingProfile, setSavingProfile] = useState(false);

  // Fetch schemes & subjects
  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (activeTab === 'practice') {
        params.include = 'activity';
      }

      if (user?.role !== 'student') {
        if (facScheme !== 'all') params.scheme = facScheme;
        if (facDept !== 'all') params.dept = facDept;
        if (facSemester !== 'all') params.semester = facSemester;
      }

      const [subRes, patRes, schRes] = await Promise.all([
        api.get('/coding/subjects', { params }),
        api.get('/coding/placement-patterns').catch(() => ({ data: [] })),
        api.get('/coding/schemes').catch(() => ({ data: [] }))
      ]);

      setPatterns(patRes.data || []);
      setSchemes(schRes.data || subRes.data?.schemes || []);

      if (user?.role === 'student') {
        const info = subRes.data?.studentInfo || null;
        setStudentInfo(info);
        if (selectedSemester === null && info?.semester) {
          setSelectedSemester(info.semester);
        }
        if (subRes.data?.missing_scheme) {
          setMissingScheme(true);
          setProfileModalOpen(true);
        } else {
          setMissingScheme(false);
        }
      }

      setSubjects(subRes.data?.subjects || []);
    } catch (err) {
      console.error('Failed to load coding curriculum subjects', err);
      setError('Unable to fetch curriculum subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [activeTab, selectedSemester, facScheme, facDept, facSemester]);

  // Handle Elective toggle
  const handleToggleElective = async (e, sub) => {
    e.stopPropagation();
    try {
      if (sub.chosen) {
        await api.delete(`/coding/electives/${sub.id}`);
        toast.success(`Dropped elective: ${sub.name}`);
      } else {
        await api.post(`/coding/electives/${sub.id}`);
        toast.success(`Chosen elective: ${sub.name}`);
      }
      setSubjects(prev => prev.map(s => s.id === sub.id ? { ...s, chosen: !s.chosen } : s));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update elective choice');
    }
  };

  // CSV Validation helper
  const handleCsvChange = async (text) => {
    setCsvText(text);
    if (!text.trim()) {
      setCsvPreview(null);
      return;
    }
    setCsvValidating(true);
    try {
      const res = await api.post('/coding/curriculum/preview', { csv_content: text });
      setCsvPreview(res.data);
    } catch (err) {
      setCsvPreview({ valid: false, error: err.response?.data?.error || 'Failed to parse CSV' });
    } finally {
      setCsvValidating(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result || '';
      handleCsvChange(content);
    };
    reader.readAsText(file);
  };

  const handleImportCurriculum = async () => {
    if (!csvText.trim()) {
      toast.error('Please upload or paste CSV curriculum content.');
      return;
    }
    setCsvImporting(true);
    try {
      const res = await api.post('/coding/curriculum/import', { csv_content: csvText });
      toast.success(res.data.message || 'Curriculum imported successfully!');
      setCsvModalOpen(false);
      setCsvText('');
      setCsvPreview(null);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to import curriculum CSV');
    } finally {
      setCsvImporting(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/auth/profile', {
        scheme: profileScheme,
        department: profileDept,
        semester: profileSem
      });
      toast.success('Profile updated successfully!');
      if (user) {
        setUser({ ...user, scheme: profileScheme, department: profileDept, semester: profileSem });
      }
      setProfileModalOpen(false);
      setMissingScheme(false);
      setSelectedSemester(profileSem);
      fetchSubjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Filter subjects for current view tab
  const displayedSubjects = subjects.filter(s => {
    if (activeTab === 'practice') return s.type === 'activity';
    return s.type !== 'activity';
  });

  // Filter placement patterns based on company, subject, difficulty, and search query
  const filteredPatterns = patterns.filter(pat => {
    if (selectedCompany !== 'ALL') {
      const hasComp = (pat.companyTags || []).some(c => c.toLowerCase() === selectedCompany.toLowerCase());
      if (!hasComp) return false;
    }
    if (selectedPatternSubject !== 'ALL') {
      if ((pat.subject || 'GENERAL').toUpperCase() !== selectedPatternSubject.toUpperCase()) return false;
    }
    if (selectedDifficulty !== 'ALL') {
      if ((pat.difficulty || '').toUpperCase() !== selectedDifficulty.toUpperCase()) return false;
    }
    if (patternSearch.trim()) {
      const q = patternSearch.toLowerCase();
      const matchTitle = (pat.title || '').toLowerCase().includes(q);
      const matchDesc = (pat.description || '').toLowerCase().includes(q);
      const matchPattern = (pat.patternName || '').toLowerCase().includes(q);
      const matchComp = (pat.companyTags || []).some(c => c.toLowerCase().includes(q));
      const matchSubj = (pat.subject || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchPattern && !matchComp && !matchSubj) return false;
    }
    return true;
  });

  const studentMaxSem = studentInfo?.semester || user?.semester || 1;
  const availableSemesters = Array.from({ length: studentMaxSem }, (_, i) => i + 1);

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border border-violet-500/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-bold">
              <Sparkles size={14} className="text-violet-400" /> VTU Scheme-Aware Coding Arena
            </span>

            {user?.role === 'student' && studentInfo?.scheme && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                <BookOpen size={12} /> {studentInfo.scheme} Scheme • Sem {studentInfo.semester} • {studentInfo.department}
              </span>
            )}
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight">Prepare & Master Curriculum Programming Skills</h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Practice VTU curriculum lab programs tailored strictly to your VTU Scheme, Department, and Semester. The database is the single source of truth.
          </p>
        </div>
      </div>

      {/* Legacy Student Complete Profile Banner */}
      {missingScheme && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={22} className="text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Profile Incomplete: Scheme Not Set</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Please choose your VTU Scheme (2022 or 2025) to view your syllabus lab programs.</p>
            </div>
          </div>
          <button
            onClick={() => setProfileModalOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
          >
            Complete Profile
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: My Lab Programs (Scheme-Based from DB) */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">My Lab Programs</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 uppercase">
                {user?.role === 'student' ? `${studentInfo?.scheme || ''} Scheme` : 'All Schemes'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Curriculum lab programs strictly matching your scheme and department.
            </p>
          </div>

          {/* Tabs: Lab Programs vs Practice (Activity) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('labs')}
                className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'labs'
                    ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Layers size={14} />
                <span>Lab Programs</span>
              </button>
              <button
                onClick={() => setActiveTab('practice')}
                className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'practice'
                    ? 'bg-white dark:bg-slate-700 text-amber-500 dark:text-amber-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Flame size={14} className={activeTab === 'practice' ? 'text-amber-500' : ''} />
                <span>Practice (Top Companies)</span>
              </button>
            </div>

            {user?.role !== 'student' && (
              <button
                onClick={() => setCsvModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs cursor-pointer transition"
              >
                <Upload size={14} />
                <span>Import CSV</span>
              </button>
            )}
          </div>
        </div>


        {/* Faculty / HOD Semester Selector only */}

        {/* Faculty / HOD Filter Controls */}
        {user?.role !== 'student' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Scheme</label>
              <select
                className="input text-xs w-full"
                value={facScheme}
                onChange={e => setFacScheme(e.target.value)}
              >
                <option value="all">All Schemes</option>
                <option value="2022">2022 Scheme</option>
                <option value="2025">2025 Scheme</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Department</label>
              <select
                className="input text-xs w-full"
                value={facDept}
                onChange={e => setFacDept(e.target.value)}
              >
                <option value="all">All Departments</option>
                <option value="CSE">CSE</option>
                {DEPARTMENTS.map(d => (
                  <option key={d.code} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Semester</label>
              <select
                className="input text-xs w-full"
                value={facSemester}
                onChange={e => setFacSemester(e.target.value)}
              >
                <option value="all">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Subject Cards Grid / Loading / Error / Empty States */}
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
            <button
              onClick={fetchSubjects}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : activeTab === 'practice' ? (
          /* ================================================================ */
          /* PRACTICE TAB: Top Placement Questions (Google, Microsoft, EdgeVerve, etc.) */
          /* ================================================================ */
          <div className="space-y-6">
            {/* Any Curriculum Activity Subjects first (if present) */}
            {displayedSubjects.length > 0 && (
              <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Curriculum Practice Modules
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {displayedSubjects.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => navigate(`/student/coding/subject/${sub.id}`)}
                      className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-violet-500 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-xs">
                            <Code2 size={20} />
                          </div>
                          {sub.code && (
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                              {sub.code}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors line-clamp-1">
                            {sub.name}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                            Sem {sub.semester} • {sub.program_count} Programs
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between text-xs font-semibold text-violet-600 dark:text-violet-400">
                        <span>Open Module</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Placement Practice Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/15 via-violet-500/10 to-transparent p-6 rounded-3xl border border-amber-500/30">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 shrink-0">
                  <Flame size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      Top Company Placement Coding Questions
                    </h2>
                    <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase">
                      Campus Recruitment Track
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Frequently asked placement coding patterns from top recruiters including <strong>Google</strong>, <strong>Microsoft</strong>, <strong>EdgeVerve</strong>, <strong>Amazon</strong>, <strong>Infosys</strong>, and <strong>TCS Digital</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-xs">
                  {filteredPatterns.length} of {patterns.length} Challenges
                </span>
              </div>
            </div>

            {/* Filter Bar: Companies, Search, Subject Select, Difficulty */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              {/* Row 1: Top Companies Filter */}
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                  Filter by Top Company
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {['ALL', 'Google', 'Microsoft', 'EdgeVerve', 'Amazon', 'Infosys', 'TCS Digital', 'Goldman Sachs'].map((comp) => {
                    const count = comp === 'ALL'
                      ? patterns.length
                      : patterns.filter(p => (p.companyTags || []).some(c => c.toLowerCase() === comp.toLowerCase())).length;
                    const isActive = selectedCompany === comp;
                    return (
                      <button
                        key={comp}
                        onClick={() => setSelectedCompany(comp)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-500/50 hover:bg-amber-500/5'
                        }`}
                      >
                        <span>{comp === 'ALL' ? '🏢 All Companies' : comp}</span>
                        <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                          isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Search + Difficulty + Subject select */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                {/* Search Bar */}
                <div className="md:col-span-5 relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by topic, pattern, or problem title..."
                    value={patternSearch}
                    onChange={(e) => setPatternSearch(e.target.value)}
                    className="input pl-9 text-xs w-full"
                  />
                  {patternSearch && (
                    <button
                      onClick={() => setPatternSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Difficulty Select */}
                <div className="md:col-span-3">
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="input text-xs w-full"
                  >
                    <option value="ALL">All Difficulties</option>
                    <option value="Easy">Easy (Foundation)</option>
                    <option value="Medium">Medium (Placement Standard)</option>
                    <option value="Hard">Hard (Advanced / FAANG)</option>
                  </select>
                </div>

                {/* Subject Category Select */}
                <div className="md:col-span-4">
                  <select
                    value={selectedPatternSubject}
                    onChange={(e) => setSelectedPatternSubject(e.target.value)}
                    className="input text-xs w-full"
                  >
                    <option value="ALL">All Subjects & Tracks</option>
                    {Array.from(new Set(patterns.map(p => (p.subject || 'GENERAL').toUpperCase()))).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Pattern Cards Grid */}
            {filteredPatterns.length === 0 ? (
              <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                  <AlertCircle size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No questions match your filter</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing the search query or selecting another company to view more questions.
                </p>
                <button
                  onClick={() => { setSelectedCompany('ALL'); setSelectedPatternSubject('ALL'); setSelectedDifficulty('ALL'); setPatternSearch(''); }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredPatterns.map((pat) => (
                  <div
                    key={pat.id || pat.slug}
                    onClick={() => navigate(`/student/coding/problem/${pat.slug}`)}
                    className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl p-5 shadow-xs hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 uppercase tracking-wider">
                            {pat.subject}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                            {pat.patternName}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                          pat.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                          pat.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-rose-500/10 text-rose-500'
                        }`}>
                          {pat.difficulty}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-snug">
                          {pat.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                          {pat.description}
                        </p>
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <Zap size={13} /> {pat.frequency}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {pat.companyTags?.map((comp) => {
                            const isFeatured = ['Google', 'Microsoft', 'EdgeVerve'].includes(comp);
                            return (
                              <span
                                key={comp}
                                className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${
                                  isFeatured
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {comp}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-extrabold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                      <span>Practice Challenge</span>
                      <ArrowRight size={15} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : displayedSubjects.length === 0 ? (
          /* Empty State: Programs coming soon */
          <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20 shadow-xs">
              <BookOpen size={32} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Programs coming soon</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                {user?.role === 'student'
                  ? `No lab programs are currently listed for Semester ${studentInfo?.semester || 1} under your curriculum. Check back soon.`
                  : 'No curriculum subjects found for the selected filter combination.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayedSubjects.map((sub) => {
              const isElective = sub.type === 'elective';
              const isActivity = sub.type === 'activity';

              return (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/student/coding/subject/${sub.id}`)}
                  className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                        <Code2 size={20} />
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        {sub.code && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800">
                            {sub.code}
                          </span>
                        )}
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {sub.program_count} {sub.program_count === 1 ? 'Program' : 'Programs'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
                        {sub.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {isElective && (
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            sub.chosen
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                          }`}>
                            {sub.chosen ? 'Elective: Chosen' : 'Elective'}
                          </span>
                        )}
                        {isActivity && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 border border-purple-500/30">
                            Practice Activity
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          Sem {sub.semester}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between text-xs font-semibold">
                    {isElective && user?.role === 'student' ? (
                      <button
                        onClick={(e) => handleToggleElective(e, sub)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          sub.chosen
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                        }`}
                      >
                        {sub.chosen ? <MinusCircle size={12} /> : <PlusCircle size={12} />}
                        <span>{sub.chosen ? 'Drop' : 'Choose'}</span>
                      </button>
                    ) : (
                      <span className="text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        View Programs <ChevronRight size={14} />
                      </span>
                    )}

                    <span className="text-slate-400 text-[10px] group-hover:text-violet-500 transition-colors">
                      Open Lab →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: General Practice — visible to faculty/HOD only */}
      {/* ========================================================================= */}
      {user?.role !== 'student' && (
        <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">General Practice</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Core foundational programming tracks and skill challenges</p>
            </div>
            <button
              onClick={() => navigate('/student/coding/category/all')}
              className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 flex items-center gap-1 cursor-pointer"
            >
              View All General Problems <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-5">
            {GENERAL_CATEGORIES.map((cat) => {
              const IconComp = ICON_MAP[cat.icon] || Code;
              return (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/student/coding/category/${encodeURIComponent(cat.name)}`)}
                  className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:bg-violet-600 group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                        <IconComp size={20} />
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-violet-500/10 group-hover:text-violet-500 border border-slate-200 dark:border-slate-700 transition-colors">
                        {cat.count} Challenges
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-4 flex items-center justify-between text-xs font-semibold text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform">
                    <span>Solve Challenges</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: Top Placement Coding Questions — visible to faculty/HOD only */}
      {/* ========================================================================= */}
      {user?.role !== 'student' && (
        <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-transparent p-5 rounded-2xl border border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                <Flame size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Top Placement Coding Questions & Patterns
                  </h2>
                  <span className="bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase">
                    Subject Categorized
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Most frequently asked placement coding problem patterns categorized by subject (Amazon, TCS Digital, Infosys SP, Google, Microsoft)
                </p>
              </div>
            </div>
          </div>

          {/* Subject Tabs Navigation Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {['ALL', ...Array.from(new Set(patterns.map(p => (p.subject || 'GENERAL').toUpperCase())))].map((subj) => {
            const count = subj === 'ALL' ? patterns.length : patterns.filter(p => (p.subject || '').toUpperCase() === subj).length;
            const isActive = selectedPatternSubject === subj;
            return (
              <button
                key={subj}
                onClick={() => setSelectedPatternSubject(subj)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/5'
                }`}
              >
                <span>{subj === 'ALL' ? 'All Subjects' : subj}</span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Placement Patterns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(selectedPatternSubject === 'ALL' ? patterns : patterns.filter(p => (p.subject || '').toUpperCase() === selectedPatternSubject)).map((pat) => (
            <div
              key={pat.id}
              onClick={() => navigate(`/student/coding/problem/${pat.slug}`)}
              className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl p-5 shadow-xs hover:shadow-xl transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 uppercase tracking-wider">
                      {pat.subject}
                    </span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                      {pat.patternName}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                    pat.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                    pat.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-rose-500/10 text-rose-500'
                  }`}>
                    {pat.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-snug">
                    {pat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {pat.description}
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <Zap size={13} /> {pat.frequency}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {pat.companyTags?.map((comp) => (
                      <span
                        key={comp}
                        className="text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-extrabold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Practice Pattern Challenge</span>
                <ArrowRight size={15} />
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Complete Profile Modal (One-time prompt for users with no scheme) */}
      {/* ========================================================================= */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-violet-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Complete Your Academic Profile</h3>
              </div>
              {!missingScheme && (
                <button onClick={() => setProfileModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              To show your exact VTU curriculum lab programs, please specify your VTU Scheme, Department, and Semester.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  VTU Syllabus Scheme
                </label>
                <select
                  value={profileScheme}
                  onChange={e => setProfileScheme(e.target.value)}
                  className="input text-xs w-full"
                  required
                >
                  <option value="2022">2022 Scheme (VTU CBCS)</option>
                  <option value="2025">2025 Scheme (VTU NEP/CBCS)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department
                </label>
                <select
                  value={profileDept}
                  onChange={e => setProfileDept(e.target.value)}
                  className="input text-xs w-full"
                  required
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                  {DEPARTMENTS.filter(d => d.name !== 'Computer Science & Engineering').map(d => (
                    <option key={d.code} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Semester
                </label>
                <select
                  value={profileSem}
                  onChange={e => setProfileSem(parseInt(e.target.value))}
                  className="input text-xs w-full"
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md cursor-pointer transition flex items-center justify-center gap-2"
              >
                {savingProfile ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <span>Save & Unlock Lab Programs</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: HOD Curriculum CSV Upload & Preview Modal */}
      {/* ========================================================================= */}
      {csvModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Upload size={18} className="text-violet-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Import VTU Curriculum CSV</h3>
              </div>
              <button
                onClick={() => setCsvModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload or paste a CSV file containing syllabus programs.
                Columns required: <code className="font-mono text-violet-600 dark:text-violet-400">scheme, dept, semester, subject_code, subject_name, subject_type, program_no, title, description, source_pdf</code>
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Upload CSV File
                </label>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 dark:file:bg-violet-950 dark:file:text-violet-300 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Or Paste CSV Data
                </label>
                <textarea
                  rows={4}
                  value={csvText}
                  onChange={e => handleCsvChange(e.target.value)}
                  placeholder="scheme,dept,semester,subject_code,subject_name,subject_type,program_no,title,description,source_pdf"
                  className="input font-mono text-[11px] w-full"
                />
              </div>

              {/* Validation Status & Preview */}
              {csvValidating && (
                <div className="p-3 text-xs text-slate-400 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Validating CSV structure...</span>
                </div>
              )}

              {csvPreview && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Validation Result:</span>
                    {csvPreview.valid ? (
                      <span className="text-emerald-600 flex items-center gap-1 font-bold">
                        <Check size={14} /> All {csvPreview.validCount} rows valid
                      </span>
                    ) : (
                      <span className="text-rose-600 flex items-center gap-1 font-bold">
                        <X size={14} /> {csvPreview.error || `${csvPreview.rejectedCount} row(s) invalid`}
                      </span>
                    )}
                  </div>

                  {csvPreview.rejected && csvPreview.rejected.length > 0 && (
                    <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl p-3 text-xs text-rose-700 dark:text-rose-300 max-h-32 overflow-y-auto font-mono text-[11px]">
                      {csvPreview.rejected.map((r, i) => (
                        <div key={i}>Line {r.line}: {r.errors.join('; ')}</div>
                      ))}
                    </div>
                  )}

                  {csvPreview.preview && csvPreview.preview.length > 0 && (
                    <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                      <table className="w-full text-[11px] text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <tr>
                            <th className="p-2">Scheme</th>
                            <th className="p-2">Dept</th>
                            <th className="p-2">Sem</th>
                            <th className="p-2">Code</th>
                            <th className="p-2">Prog #</th>
                            <th className="p-2">Title</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                          {csvPreview.preview.map((r, i) => (
                            <tr key={i}>
                              <td className="p-2">{r.scheme}</td>
                              <td className="p-2">{r.dept}</td>
                              <td className="p-2">{r.semester}</td>
                              <td className="p-2">{r.subject_code}</td>
                              <td className="p-2">{r.program_no}</td>
                              <td className="p-2 max-w-[150px] truncate">{r.title}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setCsvModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={csvImporting || !csvPreview || !csvPreview.valid}
                onClick={handleImportCurriculum}
                className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md cursor-pointer transition flex items-center gap-2 disabled:opacity-50"
              >
                {csvImporting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <span>Confirm & Import</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
