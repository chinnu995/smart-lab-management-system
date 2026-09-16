import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { BookOpen, Download, Search, Sparkles, FileText, Radio, Presentation, Image as ImageIcon, Eye, X } from 'lucide-react';
import { getSocket } from '../../services/socket';
import toast from 'react-hot-toast';

export default function StudentLabManuals() {
  const [experiments, setExperiments] = useState([]);
  const [labs, setLabs] = useState([]);
  const [activeQRSessions, setActiveQRSessions] = useState([]);
  const [selectedLab, setSelectedLab] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    api.get('/labs').then(r => setLabs(r.data)).catch(() => {});
    api.get('/attendance/active-qr').then(r => {
      setActiveQRSessions(r.data);
      if (r.data.length > 0 && r.data[0].lab_id) {
        setSelectedLab(r.data[0].lab_id);
      }
    }).catch(() => {});

    api.get('/experiments')
      .then(r => setExperiments(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleActiveSession = (session) => {
      setActiveQRSessions(prev => [...prev.filter(s => s.lab_id !== session.lab_id), session]);
      if (session.lab_id) {
        setSelectedLab(session.lab_id);
      }
      toast.success(`🟢 Faculty started session for ${session.lab_name || 'Lab'}! Auto-switched manuals.`, { duration: 4000 });
    };

    socket.on('qr:active_session', handleActiveSession);
    return () => {
      socket.off('qr:active_session', handleActiveSession);
    };
  }, []);

  const getFileInfo = (filename) => {
    if (!filename) return { type: 'unknown', label: 'File', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    const ext = filename.split('.').pop().toLowerCase();
    if (['ppt', 'pptx'].includes(ext)) {
      return { type: 'ppt', label: 'PPT Presentation', icon: Presentation, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' };
    }
    if (['pdf'].includes(ext)) {
      return { type: 'pdf', label: 'PDF Document', icon: FileText, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' };
    }
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
      return { type: 'image', label: 'Image File', icon: ImageIcon, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
    }
    if (['doc', 'docx'].includes(ext)) {
      return { type: 'word', label: 'Word Document', icon: FileText, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' };
    }
    return { type: 'text', label: ext.toUpperCase(), icon: FileText, color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30' };
  };

  const getDownloadUrl = (filePath) => {
    let apiHost = import.meta.env.VITE_API_URL || 'http://localhost:5005';
    if (typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      apiHost = `http://${window.location.hostname}:5005`;
    }
    return `${apiHost}${filePath}`;
  };

  const handlePreview = (exp) => {
    if (!exp.manual_file) return;
    const info = getFileInfo(exp.manual_file);
    const url = getDownloadUrl(exp.manual_file);
    setPreviewFile({
      url,
      title: exp.title,
      type: info.type,
      label: info.label,
      filename: exp.manual_file
    });
  };

  const filteredExperiments = experiments.filter(exp => {
    const matchesLab = !selectedLab || Number(exp.lab_id) === Number(selectedLab);
    const matchesSearch = !searchQuery || 
      exp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.lab_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLab && matchesSearch;
  });

  const activeLabObj = labs.find(l => Number(l.lab_id) === Number(selectedLab));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-blue-500/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold mb-2">
            <Sparkles size={14} className="text-blue-400" /> Student Curriculum Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
            <BookOpen size={28} className="text-blue-400" /> Lab Manuals & Experiments
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            Access, view, and download official experiment manuals (PPT, PDF, Images) uploaded by your faculty.
          </p>
        </div>
      </div>

      {/* Search & Auto-Synced Lab Session Indicator */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by experiment title, lab name, or description..."
              className="input pl-10 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Auto-Synced Lab Badge or Concurrent Tabs */}
          {activeQRSessions.length > 1 ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider whitespace-nowrap">Concurrent Live Labs:</span>
              <div className="flex flex-wrap gap-1.5">
                {activeQRSessions.map(s => (
                  <button
                    key={s.lab_id}
                    onClick={() => setSelectedLab(s.lab_id)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      Number(selectedLab) === Number(s.lab_id)
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    {s.lab_name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0">
              <Radio size={14} className="text-emerald-500 animate-pulse shrink-0" />
              <span>
                {activeLabObj ? `AUTO-SYNCED: ${activeLabObj.lab_name} (${activeLabObj.location || 'Main'})` : 'Auto-Switched to Active Faculty Lab'}
              </span>
            </div>
          )}
        </div>

        {/* Format Legend Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400">
          <span>Supported Formats:</span>
          <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
            <Presentation size={12} /> PPT Presentation
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1">
            <FileText size={12} /> PDF Document
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
            <ImageIcon size={12} /> Images (PNG, JPG, WEBP)
          </span>
        </div>

        {/* Lab Manuals Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <th className="p-3.5">Lab Session</th>
                <th className="p-3.5">Experiment Title</th>
                <th className="p-3.5">Format / Type</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Uploaded By</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExperiments.map((exp) => {
                const info = getFileInfo(exp.manual_file);
                const IconComponent = info.icon || FileText;

                return (
                  <tr key={exp.exp_id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-blue-50/40 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText size={15} className="text-blue-500 shrink-0" />
                      {exp.lab_name}
                    </td>
                    <td className="p-3.5 font-semibold text-blue-600 dark:text-blue-400">{exp.title}</td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${info.color}`}>
                        <IconComponent size={13} />
                        {info.label}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-[240px] truncate">{exp.description || '-'}</td>
                    <td className="p-3.5 text-slate-500">{exp.uploader_name || 'Faculty'}</td>
                    <td className="p-3.5 text-right">
                      {exp.manual_file ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handlePreview(exp)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all"
                          >
                            <Eye size={13} /> View
                          </button>
                          <a 
                            href={getDownloadUrl(exp.manual_file)}
                            target="_blank"
                            download
                            rel="noreferrer"
                            className="btn-primary py-1.5 px-3.5 text-xs inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow hover:shadow-md cursor-pointer"
                          >
                            <Download size={13} /> Download
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-400">No file attached</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!filteredExperiments.length && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">
                    {loading ? 'Loading lab manuals...' : 'No lab manuals available for download.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-900 text-white">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="text-blue-400">{previewFile.label}:</span>
                <span className="truncate max-w-xs">{previewFile.title}</span>
              </div>
              <button 
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-950/50 min-h-[350px]">
              {previewFile.type === 'image' ? (
                <img 
                  src={previewFile.url} 
                  alt={previewFile.title} 
                  className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-lg border border-slate-800" 
                />
              ) : previewFile.type === 'pdf' ? (
                <iframe 
                  src={previewFile.url} 
                  title={previewFile.title} 
                  className="w-full h-[65vh] rounded-xl border border-slate-800"
                />
              ) : (
                <div className="text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center mx-auto">
                    <Presentation size={32} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-800 dark:text-white">{previewFile.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">Presentation / Document file format ({previewFile.label})</p>
                  </div>
                  <a
                    href={previewFile.url}
                    download
                    className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg"
                  >
                    <Download size={16} /> Download {previewFile.label}
                  </a>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-900 text-slate-400 flex justify-between items-center text-xs">
              <span className="truncate max-w-md">{previewFile.filename}</span>
              <a 
                href={previewFile.url} 
                target="_blank" 
                rel="noreferrer" 
                download
                className="text-blue-400 hover:underline font-bold flex items-center gap-1"
              >
                <Download size={12} /> Direct Download Link
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

