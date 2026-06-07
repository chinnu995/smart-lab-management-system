import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TestCard({ test }) {
  const navigate = useNavigate();
  const handleStart = () => {
    navigate(`/student/test/${test.testId}`);
  };
  return (
    <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 shadow border border-slate-700">
      <h3 className="font-semibold text-lg mb-2">{test.subject}</h3>
      <p className="text-sm text-slate-300 mb-3">Duration: {test.duration_minutes} min</p>
      <button
        onClick={handleStart}
        className="bg-primary text-white px-3 py-1 rounded hover:opacity-90"
      >
        Start Test
      </button>
    </div>
  );
}
