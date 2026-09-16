import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Cpu, Database, Calculator, Bot, Code2, Code, Coffee, Terminal, 
  Gem, Server, TerminalSquare, Binary, Regex, Component, Sparkles, ChevronRight, CheckCircle, ArrowRight,
  Flame, Briefcase, Award, Zap
} from 'lucide-react';

const ICON_MAP = {
  Cpu, Database, Calculator, Bot, Code2, Code, Coffee, Terminal,
  Gem, Server, TerminalSquare, Binary, Regex, Component
};

export default function PracticeSkills() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [patterns, setPatterns] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, patRes] = await Promise.all([
          api.get('/coding/categories'),
          api.get('/coding/placement-patterns')
        ]);
        setCategories(catRes.data || []);
        setPatterns(patRes.data || []);
      } catch (err) {
        console.error('Failed to load coding arena data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border border-violet-500/20">
        <div className="absolute right-0 top-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-bold">
            <Sparkles size={14} className="text-violet-400" /> Campus Placement Master Series
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Prepare & Master Programming Skills</h1>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Practice curriculum subject coding challenges and master the Top 20 Most Frequently Asked Placement Coding Patterns for TCS, Infosys, Amazon, Microsoft, and Google.
          </p>
        </div>
      </div>

      {/* Conducted Lab Programs Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Conducted Lab Programs</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Select a subject to practice lab coding challenges</p>
        </div>
        <button
          onClick={() => navigate('/student/coding/category/all')}
          className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 flex items-center gap-1 cursor-pointer"
        >
          View All Problems <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <>
          {/* Skill Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.map((cat) => {
              const IconComp = ICON_MAP[cat.icon] || Code;
              return (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/student/coding/category/${encodeURIComponent(cat.name)}`)}
                  className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-violet-500 dark:hover:border-violet-500 rounded-2xl p-6 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 group-hover:bg-violet-600 group-hover:text-white transition-colors flex items-center justify-center shadow-xs">
                        <IconComp size={24} />
                      </div>
                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-violet-500/10 group-hover:text-violet-500 border border-slate-200 dark:border-slate-700 transition-colors">
                        {cat.count} Problems
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-violet-600 dark:text-violet-400 group-hover:translate-x-1 transition-transform">
                    <span>Solve Challenges</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* NEW SECTION: Top Placement Coding Questions & Patterns Categorized By Subject */}
          {/* ========================================================================= */}
          <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
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
                const isActive = selectedSubject === subj;
                return (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
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
              {(selectedSubject === 'ALL' ? patterns : patterns.filter(p => (p.subject || '').toUpperCase() === selectedSubject)).map((pat) => (
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

                    {/* Company Tags & Placement Frequency */}
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
        </>
      )}
    </div>
  );
}
