
import React, { useState, useEffect } from 'react';
import { HistoryRecord } from '../types';

const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('aerocalc_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('aerocalc_history');
    setHistory([]);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-2xl font-bold text-gray-900">Recent Logs</h2>
        {history.length > 0 && (
          <button onClick={clearHistory} className="text-xs font-semibold text-red-500 active:opacity-50">Clear All</button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="py-20 text-center opacity-30 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium">No recent calculations found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((record) => (
            <div key={record.id} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-black/5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#007AFF] bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">{record.aircraft}</span>
                  <span className="text-[10px] text-gray-400 font-medium">{new Date(record.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-sm font-bold text-gray-800">
                  {record.weight.toLocaleString()} kg · F{record.flap} · {record.rating}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-gray-900">{record.vref}</div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">KTS</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <p className="text-center text-[10px] text-gray-400 font-medium px-4 mt-8">
        History is stored locally on this device. Clearing your browser cache may remove these records.
      </p>
    </div>
  );
};

export default HistoryView;
