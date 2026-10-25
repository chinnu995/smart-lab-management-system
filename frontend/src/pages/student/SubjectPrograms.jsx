import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, BookOpen, Code2, AlertTriangle, ShieldAlert, FileText, CheckCircle2,
  ExternalLink, Sparkles, Terminal, Play
} from 'lucide-react';

export default function SubjectPrograms() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      setError(null);
      setForbidden(false);
      try {
        const res = await api.get(`/coding/subjects/${id}/programs`);
        setSubject(res.data.subject || null);
        setPrograms(res.data.programs || []);
      } catch (err) {
        if (err.response?.status === 403) {
          setForbidden(true);
          setError(err.response?.data?.error || 'Access forbidden: this subject is outside your scheme or department.');
        } else if (err.response?.status === 404) {
          setError('Subject not found.');
        } else {
          setError('Failed to load programs for this subject.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, [id]);

  const renderBadge = (prog) => {
    const title = prog.title || '';
    const isOpenEnded = title.trim().toLowerCase().startsWith('part b:');
    const isComplex = title.trim().toLowerCase().startsWith('complex (not for cie)');
    const lang = prog.language || 'python';

    return (
      <div className="flex flex-wrap items-center gap-1.5 mt-1">
        {isOpenEnded && (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            Open-ended
          </span>
        )}
        {isComplex && (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
            Complex
          </span>
        )}
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 uppercase">
          {lang}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb & Return */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/student/coding')}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Coding Arena
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full"></div>
        </div>
      ) : forbidden ? (
        <div className="card bg-rose-500/10 border border-rose-500/20 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">403 Access Forbidden</h3>
          <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
          <button
            onClick={() => navigate('/student/coding')}
            className="mt-3 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Return to My Subjects
          </button>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-violet-500/20 relative overflow-hidden">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-violet-500/30 text-violet-300 border border-violet-500/40">
                  {subject?.code}
                </span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                  {subject?.type}
                </span>
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Sem {subject?.semester} • {subject?.scheme_name || 'VTU'}
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight">{subject?.name}</h1>
              {subject?.description && (
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {subject?.description}
                </p>
              )}
            </div>
          </div>

          {/* Programs List */}
          {programs.length === 0 ? (
            <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20 shadow-xs">
                <BookOpen size={32} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Programs coming soon</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  No programs are currently listed for this subject in the curriculum database.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
                <span>{programs.length} Syllabus Programs</span>
              </div>

              <div className="space-y-3">
                {programs.map((prog) => (
                  <div
                    key={prog.id || prog.program_no}
                    className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-violet-500/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-violet-500/20">
                          #{prog.program_no}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {prog.title}
                        </h3>
                      </div>

                      {prog.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-9">
                          {prog.description}
                        </p>
                      )}

                      <div className="pl-9 flex items-center gap-3 flex-wrap">
                        {renderBadge(prog)}
                        {prog.source && (
                          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <FileText size={11} /> Source: {prog.source}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2 md:self-center pl-9 md:pl-0">
                      {prog.runnable ? (
                        <button
                          onClick={() => navigate(`/student/coding/problem/program-${prog.id || prog.program_no}`)}
                          className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-sm cursor-pointer transition flex items-center gap-1.5"
                        >
                          <Play size={13} />
                          <span>Open Editor</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 italic">
                          Practice outside IDE
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
