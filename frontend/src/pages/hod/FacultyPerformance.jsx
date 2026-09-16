import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Users, Search, CheckCircle2, Clock, XCircle, AlertTriangle, 
  BookOpen, Code2, Bot, CalendarRange, ShieldCheck, X, FileText, User, Mail, Hash, Award, GraduationCap,
  TrendingUp, Star, RefreshCw, BarChart3, PieChart as PieIcon, Activity, Filter, ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, 
  PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

export default function FacultyPerformance() {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const res = await api.get('/faculty/performance-analytics');
      setPerformanceData(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to calculate faculty performance analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  // Filtered Faculty List
  const filteredData = performanceData.filter(item => {
    const matchesSearch = 
      (item.faculty_name && item.faculty_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.emp_code && item.emp_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.department && item.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.subject && item.subject.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept = selectedDept === 'all' || item.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  // Calculate System Performance Summaries
  const totalFacultyCount = performanceData.length;
  const avgOverallScore = totalFacultyCount 
    ? Math.round(performanceData.reduce((acc, f) => acc + f.overall_score, 0) / totalFacultyCount) 
    : 0;
  
  const topFaculty = performanceData.length ? performanceData[0] : null;
  const totalSessionsCompleted = performanceData.reduce((acc, f) => acc + f.completed_sessions, 0);
  const totalComplaintsResolved = performanceData.reduce((acc, f) => acc + f.complaints_resolved, 0);

  // Rating Tier Distribution for Pie/Donut Chart
  const ratingDistribution = [
    { name: '⭐ Excellent (90-100%)', count: performanceData.filter(f => f.overall_score >= 90).length, color: '#f59e0b' },
    { name: '🟢 Very Good (80-89%)', count: performanceData.filter(f => f.overall_score >= 80 && f.overall_score < 90).length, color: '#10b981' },
    { name: '🟡 Good (70-79%)', count: performanceData.filter(f => f.overall_score >= 70 && f.overall_score < 80).length, color: '#eab308' },
    { name: '🟠 Needs Imp. (60-69%)', count: performanceData.filter(f => f.overall_score >= 60 && f.overall_score < 70).length, color: '#f97316' },
    { name: '🔴 Poor (<60%)', count: performanceData.filter(f => f.overall_score < 60).length, color: '#ef4444' }
  ].filter(d => d.count > 0);

  // Prepare Bar Chart Data for Parameter Breakdown
  const barChartData = filteredData.map(f => ({
    name: f.faculty_name.split(' ')[0] + ' (' + f.emp_code + ')',
    'Attendance (20%)': f.attendance_score,
    'Session Completion (25%)': f.session_completion_score,
    'Student Performance (25%)': f.student_performance_score,
    'Complaint Resolution (15%)': f.complaint_resolution_score,
    'Student Feedback (15%)': f.student_feedback_score,
    Overall: f.overall_score
  }));

  // Prepare Monthly Trend Data for Line Chart
  const trendChartData = [
    { month: 'May' }, { month: 'Jun' }, { month: 'Jul' }, { month: 'Aug' }, { month: 'Sep' }
  ].map((m, idx) => {
    const entry = { month: m.month };
    filteredData.slice(0, 5).forEach(f => {
      entry[f.faculty_name] = f.monthly_trend[idx]?.score || f.overall_score;
    });
    return entry;
  });

  const LINE_COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#3b82f6', '#f59e0b'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-purple-500/20 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
            <Award size={14} className="text-purple-400" /> HOD Faculty Analytics Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <BarChart3 size={32} className="text-purple-400" />
            Faculty Performance & Activity Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
            Automatically evaluated score percentages based on database logs: Attendance (20%), Session Completion (25%), Student Test Performance (25%), Complaint Resolution (15%), and Student Ratings (15%).
          </p>
        </div>

        <button
          onClick={fetchPerformance}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-3 rounded-2xl border border-white/20 transition cursor-pointer shrink-0"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Recalculate Metrics
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-slate-50/90 dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Institutional Average Score</span>
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">{avgOverallScore}%</div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Across {totalFacultyCount} Faculty Members</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="card bg-amber-500/10 p-5 rounded-2xl border border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Top Faculty Rank #1</span>
            <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1 truncate max-w-[140px]">{topFaculty ? topFaculty.faculty_name : 'N/A'}</div>
            <span className="text-[10px] text-amber-600 font-bold">{topFaculty ? `${topFaculty.overall_score}% (${topFaculty.performance_rating})` : ''}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
            <Star size={24} />
          </div>
        </div>

        <div className="card bg-slate-50/90 dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed Lab Sessions</span>
            <div className="text-3xl font-black text-slate-800 dark:text-white mt-1">{totalSessionsCompleted}</div>
            <span className="text-[10px] text-slate-500">Conducted & Attendance Marked</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="card bg-slate-50/90 dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Lab Complaints Resolved</span>
            <div className="text-3xl font-black text-slate-800 dark:text-white mt-1">{totalComplaintsResolved}</div>
            <span className="text-[10px] text-emerald-600 font-semibold">100% Resolution Efficiency</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <ShieldCheck size={24} />
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Bar Chart: Individual Performance Parameter Comparison */}
        <div className="lg:col-span-2 card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <BarChart3 size={18} className="text-purple-500" />
                Performance Parameter Breakdown (%)
              </h3>
              <p className="text-xs text-slate-500">Weighted scores for Attendance, Session Completion, Student Test Scores, Complaints, & Feedback</p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Attendance (20%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Session Completion (25%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Student Performance (25%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Complaint Resolution (15%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Student Feedback (15%)" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Donut Chart: Rating Tier Distribution */}
        <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <PieIcon size={18} className="text-amber-500" />
              Rating Tier Distribution
            </h3>
            <p className="text-xs text-slate-500">Distribution of faculty across rating categories</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ratingDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2">
            {ratingDistribution.map((tier, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }}></span>
                  <span className="text-slate-700 dark:text-slate-300">{tier.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{tier.count} Faculty</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Line Chart: Performance Trends Over Time */}
      <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              Faculty Performance Score Trends (Recent Months)
            </h3>
            <p className="text-xs text-slate-500">Tracking progress over time across evaluation periods</p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendChartData} margin={{ top: 10, right: 20, left: -20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              {filteredData.slice(0, 5).map((f, i) => (
                <Line 
                  key={f.faculty_id} 
                  type="monotone" 
                  dataKey={f.faculty_name} 
                  stroke={LINE_COLORS[i % LINE_COLORS.length]} 
                  strokeWidth={3} 
                  dot={{ r: 4 }} 
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters & Leaderboard Table */}
      <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Award size={20} className="text-purple-600" /> Faculty Ranking & Leaderboard Table
            </h3>
            <p className="text-xs text-slate-500">Sorted by Overall Performance Score (%)</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search faculty name or emp code..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full sm:w-auto text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Science">Information Science</option>
              <option value="AI & ML">AI & ML</option>
            </select>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 font-extrabold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider">
                <th className="py-4 px-4 text-center">Rank</th>
                <th className="py-4 px-4">Faculty Member</th>
                <th className="py-4 px-4">Overall Score</th>
                <th className="py-4 px-4">Performance Rating</th>
                <th className="py-4 px-4 text-center">Attendance (20%)</th>
                <th className="py-4 px-4 text-center">Completion (25%)</th>
                <th className="py-4 px-4 text-center">Student Perf (25%)</th>
                <th className="py-4 px-4 text-center">Resolution (15%)</th>
                <th className="py-4 px-4 text-center">Feedback (15%)</th>
                <th className="py-4 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="animate-spin w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    Evaluating faculty performance analytics from database...
                  </td>
                </tr>
              ) : !filteredData.length ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-semibold">
                    No faculty performance records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={item.faculty_id} className="hover:bg-purple-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Rank Badge */}
                    <td className="py-4 px-4 text-center font-bold">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                        index === 0 ? 'bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-300' :
                        index === 1 ? 'bg-slate-300 text-slate-900' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        #{index + 1}
                      </span>
                    </td>

                    {/* Faculty Info */}
                    <td className="py-4 px-4">
                      <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {item.faculty_name}
                      </div>
                      <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold mt-0.5">
                        {item.emp_code} • {item.department}
                      </div>
                    </td>

                    {/* Overall Score */}
                    <td className="py-4 px-4 font-mono font-black text-base text-purple-700 dark:text-purple-300">
                      {item.overall_score}%
                    </td>

                    {/* Performance Rating Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${item.rating_badge}`}>
                        {item.performance_rating}
                      </span>
                    </td>

                    {/* Parameter Scores */}
                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {item.attendance_score}%
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {item.session_completion_score}%
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {item.student_performance_score}%
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {item.complaint_resolution_score}%
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                      {item.student_feedback_score}% ({item.average_rating}⭐)
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedFaculty(item);
                          setModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-extrabold px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800 transition cursor-pointer"
                      >
                        Inspect <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Faculty Breakdown Modal */}
      {modalOpen && selectedFaculty && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl">
                  <Award size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {selectedFaculty.faculty_name}
                    <span className={`text-xs px-3 py-0.5 rounded-full border font-bold ${selectedFaculty.rating_badge}`}>
                      {selectedFaculty.performance_rating}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Emp Code: {selectedFaculty.emp_code} • {selectedFaculty.department} • {selectedFaculty.designation}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setModalOpen(false)} 
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={22} />
              </button>
            </div>

            {/* Parameter Cards Grid inside Modal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-purple-50/60 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-800">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Overall Calculated Score</span>
                <div className="text-3xl font-black text-purple-700 dark:text-purple-300 mt-1">{selectedFaculty.overall_score}%</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Lab Sessions Assigned</span>
                <div className="text-2xl font-extrabold text-slate-800 dark:text-white mt-1">{selectedFaculty.total_lab_sessions} Sessions</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Student Feedback Rating</span>
                <div className="text-2xl font-extrabold text-amber-500 mt-1">{selectedFaculty.average_rating} / 5.0 ⭐</div>
              </div>
            </div>

            {/* 5 Parameter Progress Bars */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-850 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">5 Parameter Weighted Performance Breakdown</h4>

              <div className="space-y-3">
                {/* Attendance */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>1. Attendance Management (20% Weight)</span>
                    <span className="text-purple-600">{selectedFaculty.attendance_score}% Score</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${selectedFaculty.attendance_score}%` }}></div>
                  </div>
                </div>

                {/* Session Completion */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>2. Lab Session Completion (25% Weight)</span>
                    <span className="text-blue-600">{selectedFaculty.session_completion_score}% Score</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${selectedFaculty.session_completion_score}%` }}></div>
                  </div>
                </div>

                {/* Student Performance */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>3. Student Performance (25% Weight)</span>
                    <span className="text-emerald-600">{selectedFaculty.student_performance_score}% Score</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${selectedFaculty.student_performance_score}%` }}></div>
                  </div>
                </div>

                {/* Complaint Resolution */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>4. Complaint Resolution (15% Weight)</span>
                    <span className="text-amber-600">{selectedFaculty.complaint_resolution_score}% Score</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: `${selectedFaculty.complaint_resolution_score}%` }}></div>
                  </div>
                </div>

                {/* Student Feedback */}
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>5. Student Feedback & Ratings (15% Weight)</span>
                    <span className="text-pink-600">{selectedFaculty.student_feedback_score}% Score ({selectedFaculty.average_rating} Stars)</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-pink-600 h-2.5 rounded-full" style={{ width: `${selectedFaculty.student_feedback_score}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setModalOpen(false)} 
                className="btn bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs"
              >
                Close Profile Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
