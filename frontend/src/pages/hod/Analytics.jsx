import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
         XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#2563EB','#14B8A6','#F59E0B','#EF4444','#8B5CF6','#10B981'];

export default function Analytics() {
  const [trend, setTrend] = useState([]);
  const [labs, setLabs] = useState([]);
  const [eq, setEq] = useState([]);
  const [comp, setComp] = useState([]);
  const [heat, setHeat] = useState([]);
  const [fac, setFac] = useState([]);

  useEffect(() => {
    api.get('/analytics/attendance').then(r => setTrend(r.data));
    api.get('/analytics/labs').then(r => setLabs(r.data));
    api.get('/analytics/equipment').then(r => setEq(r.data));
    api.get('/analytics/complaints').then(r => setComp(r.data));
    api.get('/analytics/heatmap').then(r => setHeat(r.data));
    api.get('/analytics/faculty-perf').then(r => setFac(r.data));
  }, []);

  // Build heatmap grid: rows=labs, cols=hours 8..18
  const labNames = [...new Set(heat.map(h => h.lab_name))];
  const hours = Array.from({ length: 11 }, (_, i) => i + 8);
  const cell = (lab, hr) => heat.find(h => h.lab_name === lab && h.hour === hr)?.bookings || 0;
  const max = Math.max(1, ...heat.map(h => h.bookings));

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
            <ResponsiveContainer>
              <PieChart>
                <Pie data={eq} dataKey="count" nameKey="status" outerRadius={80} label>
                  {eq.map((_, i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3">Complaint Resolution</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={comp} dataKey="count" nameKey="status" outerRadius={80} label>
                  {comp.map((_, i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
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
                  <th className="p-2 text-left">Lab \\ Hour</th>
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

      <div className="card">
        <h3 className="font-semibold mb-3">Faculty Performance</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th>Name</th><th>Classes Marked</th><th>Complaints Resolved</th></tr></thead>
          <tbody>{fac.map((f,i)=>(
            <tr key={i} className="border-t border-slate-200 dark:border-slate-700">
              <td className="py-2">{f.full_name}</td>
              <td>{f.classes_marked}</td>
              <td>{f.complaints_resolved}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
