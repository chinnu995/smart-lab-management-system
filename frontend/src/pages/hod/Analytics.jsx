import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
         XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { getSocket } from '../../services/socket';

const COLORS = ['#2563EB','#14B8A6','#F59E0B','#EF4444','#8B5CF6','#10B981'];

export default function Analytics() {
  const [trend, setTrend] = useState([]);
  const [labs, setLabs] = useState([]);
  const [eq, setEq] = useState([]);
  const [comp, setComp] = useState([]);
  const [heat, setHeat] = useState([]);

  const fetchAnalytics = () => {
    api.get('/analytics/attendance').then(r => setTrend(Array.isArray(r.data) ? r.data.map(d => ({ ...d, present: Number(d.present||0), absent: Number(d.absent||0), late: Number(d.late||0) })) : []));
    api.get('/analytics/labs').then(r => setLabs(Array.isArray(r.data) ? r.data.map(d => ({ ...d, approved: Number(d.approved||0), total: Number(d.total||0) })) : []));
    api.get('/analytics/equipment').then(r => setEq(Array.isArray(r.data) ? r.data.map(d => ({ ...d, count: Number(d.count||0) })) : []));
    api.get('/analytics/complaints').then(r => setComp(Array.isArray(r.data) ? r.data.map(d => ({ ...d, count: Number(d.count||0) })) : []));
    api.get('/analytics/heatmap').then(r => setHeat(Array.isArray(r.data) ? r.data.map(d => ({ ...d, bookings: Number(d.bookings||0) })) : []));
  };

  useEffect(() => {
    fetchAnalytics();

    const s = getSocket();
    if (s) {
      s.connect();
      s.on('booking:new', fetchAnalytics);
      s.on('booking:changed', fetchAnalytics);
      s.on('lab:status_changed', fetchAnalytics);
      s.on('complaint:new', fetchAnalytics);
      s.on('complaint:changed', fetchAnalytics);
      s.on('attendance:changed', fetchAnalytics);
      s.on('equipment:changed', fetchAnalytics);

      return () => {
        s.off('booking:new', fetchAnalytics);
        s.off('booking:changed', fetchAnalytics);
        s.off('lab:status_changed', fetchAnalytics);
        s.off('complaint:new', fetchAnalytics);
        s.off('complaint:changed', fetchAnalytics);
        s.off('attendance:changed', fetchAnalytics);
        s.off('equipment:changed', fetchAnalytics);
      };
    }
  }, []);

  // Build heatmap grid: rows=labs, cols=hours 8..18
  const labNames = Array.from(new Set([
    ...labs.map(l => l.lab_name),
    ...heat.map(h => h.lab_name)
  ])).filter(Boolean);

  const hours = Array.from({ length: 11 }, (_, i) => i + 8);
  const cell = (lab, hr) => heat.find(h => h.lab_name === lab && Number(h.hour) === hr)?.bookings || 0;
  const max = Math.max(1, ...heat.map(h => Number(h.bookings || 0)));

  const formatStatus = (s) => {
    if (!s) return 'UNKNOWN';
    return s.toString().replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <div className="card">
          <h3 className="font-semibold mb-3">Attendance Trend (30 days)</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="date" tick={{ fontSize: 10 }}/>
                <YAxis /><Tooltip /><Legend />
                <Line dataKey="present" stroke="#14B8A6" strokeWidth={2}/>
                <Line dataKey="absent"  stroke="#EF4444" strokeWidth={2}/>
                <Line dataKey="late"    stroke="#F59E0B" strokeWidth={2}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3">Lab Utilization</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={labs}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="lab_name" tick={{ fontSize: 10 }}/>
                <YAxis /><Tooltip /><Legend />
                <Bar dataKey="approved" fill="#2563EB" name="Approved"/>
                <Bar dataKey="total" fill="#94A3B8" name="Total"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3">Equipment Status</h3>
          <div className="h-64">
            {eq.length > 0 && eq.some(item => Number(item.count) > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={eq.map(i => ({ ...i, statusName: formatStatus(i.status), count: Number(i.count || 0) }))}
                    dataKey="count"
                    nameKey="statusName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {eq.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                No equipment data available
              </div>
            )}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3">Complaint Resolution</h3>
          <div className="h-64">
            {comp.length > 0 && comp.some(item => Number(item.count) > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={comp.map(i => ({ ...i, statusName: formatStatus(i.status), count: Number(i.count || 0) }))}
                    dataKey="count"
                    nameKey="statusName"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {comp.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">
                No complaint resolution data available
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Lab Booking Heatmap (by hour)</h3>
        {labNames.length ? (
          <div className="overflow-auto">
            <table className="text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left">Lab \ Hour</th>
                  {hours.map(h => <th key={h} className="p-2">{h}:00</th>)}
                </tr>
              </thead>
              <tbody>
                {labNames.map(lab => (
                  <tr key={lab}>
                    <td className="p-2 font-medium">{lab}</td>
                    {hours.map(h => {
                      const v = cell(lab, h);
                      const intensity = v / max;
                      return <td key={h} className="p-2">
                        <div className="w-8 h-8 rounded grid place-items-center text-white text-xs"
                             style={{ background: `rgba(37,99,235,${0.15 + intensity*0.85})` }}>{v||''}</div>
                      </td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="text-slate-500">No approved bookings yet.</div>}
      </div>
    </div>
  );
}
