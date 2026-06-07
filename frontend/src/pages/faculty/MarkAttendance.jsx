import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { QrCode } from 'lucide-react';

export default function MarkAttendance() {
  const [labs, setLabs] = useState([]);
  const [students, setStudents] = useState([]);
  const [labId, setLabId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [records, setRecords] = useState({});
  const [qr, setQr] = useState(null);

  useEffect(() => {
    api.get('/labs').then(r => setLabs(r.data));
    api.get('/students').then(r => setStudents(r.data));
  }, []);

  const setStatus = (sid, status) => setRecords(p => ({ ...p, [sid]: status }));

  const save = async () => {
    if (!labId) return toast.error('Pick a lab');
    const payload = Object.entries(records).map(([student_id, status]) => ({ student_id: +student_id, status }));
    if (!payload.length) return toast.error('Mark at least one student');
    try { await api.post('/attendance/bulk', { lab_id: +labId, attend_date: date, records: payload }); toast.success('Saved'); }
    catch (e) { toast.error(e.response?.data?.message); }
  };

  const generate = async () => {
    if (!labId) return toast.error('Pick a lab');
    const { data } = await api.post('/attendance/qr/generate', { lab_id: +labId });
    setQr(data);
  };

  return (
    <div className="space-y-5">
      <div className="card grid md:grid-cols-3 gap-3">
        <select className="input" value={labId} onChange={e=>setLabId(e.target.value)}>
          <option value="">Select lab…</option>
          {labs.map(l=><option key={l.lab_id} value={l.lab_id}>{l.lab_name}</option>)}
        </select>
        <input type="date" className="input" value={date} onChange={e=>setDate(e.target.value)}/>
        <button onClick={generate} className="btn-secondary flex items-center gap-2 justify-center"><QrCode size={16}/> Generate QR</button>
      </div>
      {qr && (
        <div className="card text-center">
          <h3 className="font-semibold mb-2">Session QR Code</h3>
          <img src={qr.dataUrl} alt="QR" className="mx-auto w-56 h-56"/>
          <p className="text-xs text-slate-500 mt-2 break-all">Token: {qr.token}</p>
          <p className="text-xs text-slate-500">Token expires in 15 min</p>
        </div>
      )}
      <div className="card">
        <h3 className="font-semibold mb-3">Mark Attendance</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th>USN</th><th>Name</th><th>Department</th><th>Status</th></tr></thead>
          <tbody>{students.map(s=>(
            <tr key={s.student_id} className="border-t border-slate-200 dark:border-slate-700">
              <td className="py-2">{s.usn}</td><td>{s.full_name}</td><td>{s.department}</td>
              <td>
                <div className="flex gap-1">
                  {['present','absent','late'].map(st => (
                    <button key={st} onClick={()=>setStatus(s.student_id, st)}
                      className={`text-xs px-2 py-1 rounded ${records[s.student_id]===st ?
                        (st==='present'?'bg-emerald-500 text-white':st==='absent'?'bg-rose-500 text-white':'bg-amber-500 text-white')
                        : 'bg-slate-100 dark:bg-slate-700'}`}>{st}</button>
                  ))}
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
        <button onClick={save} className="btn-primary mt-4">Save Attendance</button>
      </div>
    </div>
  );
}
