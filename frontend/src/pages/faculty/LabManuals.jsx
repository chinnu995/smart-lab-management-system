import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { BookOpen, Plus, Download, Trash2, FileUp, Sparkles, Presentation, FileText, Image as ImageIcon, Eye, X } from 'lucide-react';

export default function FacultyLabManuals() {
  const [labs, setLabs] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLab, setSelectedLab] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const fetchExperiments = () => {
    api.get('/experiments').then(r => setExperiments(r.data)).catch(()=>{});
  };

  useEffect(() => {
    api.get('/labs').then(r => {
      setLabs(r.data);
      if (r.data.length > 0) setSelectedLab(r.data[0].lab_id);
    });
    fetchExperiments();
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

  const handleAddManual = async (e) => {
    e.preventDefault();
    if (!selectedLab || !title || !file) {
      toast.error('Please fill in all required fields and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('lab_id', selectedLab);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('manual', file);

    setUploading(true);
    const toastId = toast.loading('Uploading lab manual...');
    try {
      await api.post('/experiments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.dismiss(toastId);
      toast.success('Lab manual uploaded successfully!');
      setModalOpen(false);
      setTitle('');
      setDescription('');
      setFile(null);
      fetchExperiments();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteManual = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lab manual?')) return;
    try {
      await api.delete(`/experiments/${id}`);
      toast.success('Deleted successfully.');
      fetchExperiments();
    } catch (err) {
      toast.error('Failed to delete.');
    }
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-blue-500/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold mb-2">
            <Sparkles size={14} className="text-blue-400" /> Faculty Curriculum Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
            <BookOpen size={28} className="text-blue-400" /> Lab Manuals & Experiments
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            Upload, update, and manage experiment manuals (PPT, PDF, Images) for all registered lab sessions.
          </p>
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus size={18} /> Add Lab Manual
        </button>
      </div>

      {/* Allowed Types Indicator Banner */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 dark:bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-xs font-semibold text-slate-300">
        <span className="text-blue-400 font-extrabold uppercase tracking-wider text-[11px] shrink-0">Supported Formats:</span>
        <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
          <Presentation size={13} /> PPT / PPTX Presentation
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
          <FileText size={13} /> PDF Document
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
          <ImageIcon size={13} /> Images (PNG, JPG, WEBP)
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
          <FileText size={13} /> Word / Text (DOCX, TXT)
        </span>
      </div>

      {/* Lab Manuals Table */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <BookOpen size={20} className="text-blue-500" /> Uploaded Manuals Registry
            </h3>
            <p className="text-xs text-slate-400">Total uploaded manuals: {experiments.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <th className="p-3.5">Lab Session</th>
                <th className="p-3.5">Title</th>
                <th className="p-3.5">Format / Type</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Uploaded By</th>
                <th className="p-3.5 text-center">File Document</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((exp) => {
                const info = getFileInfo(exp.manual_file);
                const IconComponent = info.icon || FileText;

                return (
                  <tr key={exp.exp_id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-blue-50/40 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{exp.lab_name}</td>
                    <td className="p-3.5 font-semibold text-blue-600 dark:text-blue-400">{exp.title}</td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${info.color}`}>
                        <IconComponent size={13} />
                        {info.label}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-[220px] truncate">{exp.description || '-'}</td>
                    <td className="p-3.5 text-slate-500">{exp.uploader_name || 'Faculty'}</td>
                    <td className="p-3.5 text-center">
                      {exp.manual_file ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handlePreview(exp)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-[11px] flex items-center gap-1 border border-slate-200 dark:border-slate-700 cursor-pointer transition-all"
                          >
                            <Eye size={12} /> Preview
                          </button>
                          <a 
                            href={getDownloadUrl(exp.manual_file)}
                            target="_blank"
                            download
                            rel="noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                          >
                            <Download size={12} /> Download
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-400">No file</span>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <button 
                        onClick={() => handleDeleteManual(exp.exp_id)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-2 rounded-xl transition-all cursor-pointer"
                        title="Delete manual"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!experiments.length && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400 font-medium">
                    No lab manuals uploaded yet. Click "Add Lab Manual" above to upload your first document.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Manual Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-900 text-white">
              <h3 className="font-bold flex items-center gap-2 text-sm">
                <FileUp size={18} className="text-blue-400" /> Upload Lab Manual
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
            
            <form onSubmit={handleAddManual} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Select Lab</label>
                <select 
                  className="input text-xs font-medium"
                  value={selectedLab}
                  onChange={(e) => setSelectedLab(e.target.value)}
                  required
                >
                  <option value="">-- Choose lab --</option>
                  {labs.map(l => (
                    <option key={l.lab_id} value={l.lab_id}>
                      {l.lab_name} ({l.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Manual Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Exercise 1: Stack Implementation"
                  className="input text-xs font-medium"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Description (Optional)</label>
                <textarea 
                  placeholder="Enter brief instructions..."
                  className="input text-xs font-medium h-20"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Manual File (PPT, PDF, Image, DOCX)
                </label>
                <input 
                  type="file"
                  accept=".ppt,.pptx,.pdf,.png,.jpg,.jpeg,.gif,.webp,.svg,.bmp,.docx,.doc,.txt,image/*"
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
                {file && (
                  <div className="mt-2 text-[11px] p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 flex items-center gap-2 font-medium">
                    {getFileInfo(file.name).icon && React.createElement(getFileInfo(file.name).icon, { size: 14 })}
                    <span>Selected: <strong>{file.name}</strong> ({getFileInfo(file.name).label})</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  {uploading ? 'Uploading...' : 'Upload Manual'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

