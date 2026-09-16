import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Pin, Megaphone, Plus, Trash2, X, Send, Sparkles, 
  Search, Bot, FlaskConical, AlertTriangle, Calendar, Layers, ShieldAlert 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const colors = {
  general: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  lab_update: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  exam: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  attendance_alert: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  equipment: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
  workshop: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',
  emergency: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
  maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
};

const CATEGORIES = [
  { key: 'all', label: 'All Updates', icon: Layers },
  { key: 'exam', label: 'Exams & MCQ Tests', icon: Bot },
  { key: 'lab_update', label: 'Lab Schedule Updates', icon: FlaskConical },
  { key: 'general', label: 'General Broadcasts', icon: Sparkles },
  { key: 'maintenance', label: 'Maintenance & Notices', icon: AlertTriangle },
  { key: 'alerts', label: 'Attendance & Alerts', icon: ShieldAlert },
];

export default function Announcements() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [targetRole, setTargetRole] = useState('all');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canPost = user?.role === 'hod' || user?.role === 'faculty';

  const load = async () => {
    try {
      const r = await api.get('/announcements');
      if (Array.isArray(r.data)) {
        setItems(r.data);
      } else {
        setItems([]);
      }
    } catch (e) {
      console.error('Failed to load announcements:', e);
      toast.error('Failed to load announcements');
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      return toast.error('Please enter announcement title and content.');
    }

    setSubmitting(true);
    const toastId = toast.loading('Publishing announcement...');
    try {
      await api.post('/announcements', {
        title: title.trim(),
        content: content.trim(),
        category,
        target_role: targetRole,
        is_pinned: isPinned
      });
      toast.dismiss(toastId);
      toast.success('Announcement posted successfully!');
      setModalOpen(false);
      setTitle('');
      setContent('');
      setCategory('general');
      setTargetRole('all');
      setIsPinned(false);
      load();
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Announcement deleted');
      load();
    } catch (_) {
      toast.error('Failed to delete announcement');
    }
  };

  // Filtered items computation
  const filteredItems = items.filter(item => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q || 
      item.title?.toLowerCase().includes(q) || 
      item.content?.toLowerCase().includes(q) ||
      item.posted_by_name?.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeCategory === 'all') return true;
    if (activeCategory === 'exam') return item.category === 'exam';
    if (activeCategory === 'lab_update') return item.category === 'lab_update';
    if (activeCategory === 'general') return item.category === 'general';
    if (activeCategory === 'maintenance') return item.category === 'maintenance' || item.category === 'equipment';
    if (activeCategory === 'alerts') return item.category === 'attendance_alert' || item.category === 'emergency';
    
    return true;
  });

  // Calculate count for each category badge
  const getCategoryCount = (catKey) => {
    if (catKey === 'all') return items.length;
    if (catKey === 'exam') return items.filter(i => i.category === 'exam').length;
    if (catKey === 'lab_update') return items.filter(i => i.category === 'lab_update').length;
    if (catKey === 'general') return items.filter(i => i.category === 'general').length;
    if (catKey === 'maintenance') return items.filter(i => i.category === 'maintenance' || i.category === 'equipment').length;
    if (catKey === 'alerts') return items.filter(i => i.category === 'attendance_alert' || i.category === 'emergency').length;
    return 0;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-violet-500/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-bold mb-2">
            <Sparkles size={14} className="text-violet-400" />
            Smart Lab Broadcast Channel
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Megaphone size={28} className="text-violet-400" /> Announcements & Updates
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1">
            Stay informed with official department broadcasts, lab schedule changes, and exam notices.
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-primary bg-violet-600 hover:bg-violet-700 text-white font-bold px-5 py-2.5 rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} /> Post New Announcement
          </button>
        )}
      </div>

      {/* Category Section Navigation Tabs & Search */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const count = getCategoryCount(cat.key);
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20 scale-[1.02]'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon size={14} />
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64 shrink-0">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search notices..."
              className="input pl-9 text-xs font-medium"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredItems.map(a => (
          <div key={a.announcement_id} className="card p-6 border border-slate-200/80 dark:border-slate-800/80 hover:shadow-md transition-all">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center flex-wrap gap-2">
                  {!!a.is_pinned && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      <Pin size={13} className="text-amber-600" /> Pinned
                    </span>
                  )}
                  <h3 className="font-extrabold text-base md:text-lg text-slate-900 dark:text-white">{a.title}</h3>
                  <span className={`badge uppercase text-[10px] tracking-wider font-extrabold px-2.5 py-0.5 rounded-full ${colors[a.category] || colors.general}`}>
                    {a.category?.replace('_', ' ')}
                  </span>
                  {a.target_role !== 'all' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                      Target: {a.target_role}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{a.content}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
                  {new Date(a.created_at).toLocaleString()}
                </span>
                {user?.role === 'hod' && (
                  <button
                    onClick={() => handleDelete(a.announcement_id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-all cursor-pointer"
                    title="Delete Announcement"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <span>Posted by: <strong className="text-slate-800 dark:text-slate-200">{a.posted_by_name}</strong> ({a.posted_by_role})</span>
            </div>
          </div>
        ))}

        {!filteredItems.length && (
          <div className="card p-12 text-center text-slate-400">
            <Megaphone size={40} className="mx-auto mb-3 opacity-40 text-violet-500" />
            <p className="font-semibold text-sm">No announcements found matching the selected section filter.</p>
          </div>
        )}
      </div>

      {/* Post Announcement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Megaphone size={20} className="text-violet-600 dark:text-violet-400" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Announcement</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Announcement Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule Update for DBMS Lab Test"
                  className="input text-sm font-semibold"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    className="input text-xs font-medium"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    <option value="general">General Broadcast</option>
                    <option value="lab_update">Lab Update</option>
                    <option value="exam">Exam & Test</option>
                    <option value="attendance_alert">Attendance Alert</option>
                    <option value="equipment">Equipment Notice</option>
                    <option value="workshop">Workshop & Event</option>
                    <option value="emergency">Emergency Alert</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Target Audience</label>
                  <select
                    className="input text-xs font-medium"
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                  >
                    <option value="all">All Users (Students & Faculty)</option>
                    <option value="student">Students Only</option>
                    <option value="faculty">Faculty Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Content / Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write full announcement details here..."
                  className="input text-sm font-normal"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="w-4 h-4 text-violet-600 rounded"
                />
                <label htmlFor="pinCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1">
                  <Pin size={13} className="text-amber-500" /> Pin to top of announcements list
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary bg-violet-600 hover:bg-violet-700 text-white font-bold flex items-center gap-2"
                >
                  <Send size={16} /> {submitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
