
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalculationResult, HistoryRecord, AircraftType, EngineRating, PerformanceDataset } from '../types.ts';
import { calculateVref, loadDataset } from '../services/performanceDb.ts';

const ENGINE_RATINGS: Record<AircraftType, EngineRating[]> = {
  [AircraftType.NG]: ['22K', '24K', '26K', '26K_SF'],
  [AircraftType.MAX]: ['25K', '27K', '28K']
};

const VrefCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [aircraft, setAircraft] = useState<AircraftType>(AircraftType.NG);
  const [rating, setRating] = useState<EngineRating>('26K');
  const [weight, setWeight] = useState<string>('60000');
  const [flap, setFlap] = useState<string>("");
  const [dataset, setDataset] = useState<PerformanceDataset | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setRating(ENGINE_RATINGS[aircraft][0]);
  }, [aircraft]);

  useEffect(() => {
    const ds = loadDataset('VREF', aircraft, rating);
    setDataset(ds);
    if (ds.flaps.length > 0 && !ds.flaps.includes(flap)) {
        setFlap(ds.flaps[0]);
    }
  }, [aircraft, rating]);

  useEffect(() => {
    setIsUpdating(true);
    setIsSaved(false);
    const timer = setTimeout(() => {
      const numericWeight = parseFloat(weight);
      if (!isNaN(numericWeight) && numericWeight > 0 && flap) {
        const res = calculateVref(numericWeight, flap, aircraft, rating);
        setResult(res);
      } else {
        setResult(null);
      }
      setIsUpdating(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [weight, flap, aircraft, rating]);

  const saveToHistory = () => {
    if (!result?.isValid) return;
    const records: HistoryRecord[] = JSON.parse(localStorage.getItem('aerocalc_history') || '[]');
    const newRecord: HistoryRecord = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      type: 'VREF',
      weight: parseFloat(weight),
      flap,
      vref: result.vref,
      aircraft,
      rating
    };
    const updated = [newRecord, ...records].slice(0, 10);
    localStorage.setItem('aerocalc_history', JSON.stringify(updated));
    setIsSaved(true);
    setTimeout(() => navigate('/history'), 1000);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*$/.test(val)) setWeight(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <section className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-black/5 space-y-6">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Configuration</span>
              <span className="text-[10px] font-black text-[#007AFF] uppercase tracking-tighter">PHASE: LND</span>
            </div>
            <div className="space-y-4">
              <div className="flex bg-gray-200/50 p-1 rounded-2xl">
                {[AircraftType.NG, AircraftType.MAX].map((type) => (
                  <button key={type} onClick={() => setAircraft(type)} className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all ${aircraft === type ? 'bg-white text-[#007AFF] shadow-sm' : 'text-gray-500'}`}>{type}</button>
                ))}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {ENGINE_RATINGS[aircraft].map((r) => (
                  <button key={r} onClick={() => setRating(r)} className={`px-6 py-3 rounded-2xl text-[11px] font-black whitespace-nowrap transition-all border ${rating === r ? 'bg-[#007AFF] text-white border-[#007AFF]' : 'bg-white text-gray-400 border-black/5'}`}>{r}</button>
                ))}
              </div>
            </div>
          </section>
          <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-black/5 space-y-6">
            <div className="space-y-1">
              <label className="block text-[11px] font-black text-gray-300 uppercase tracking-widest">Landing Weight</label>
              <div className="flex items-center justify-between border-b-2 border-gray-100 pb-2">
                <input type="text" inputMode="numeric" value={weight} onChange={handleWeightChange} className="text-6xl font-black text-gray-900 bg-transparent border-none outline-none w-full tracking-tighter" />
                <span className="text-xl font-black text-[#007AFF]">KG</span>
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest">Flap Setting</label>
              <div className="bg-gray-100/50 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-black/5">
                {dataset?.flaps.map((f) => (
                  <button key={f} onClick={() => setFlap(f)} className={`flex-1 min-w-[70px] py-5 rounded-xl text-sm font-black transition-all ${flap === f ? 'bg-white text-[#007AFF] shadow-xl scale-100' : 'text-gray-400 scale-95 opacity-60 hover:opacity-100'}`}>F{f}</button>
                ))}
              </div>
            </div>
          </section>
        </div>
        <div className="space-y-6 sticky top-28">
          <section className={`bg-white rounded-[3rem] p-12 shadow-2xl border border-black/5 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[400px] ${isUpdating ? 'opacity-50 scale-95 blur-[2px]' : 'opacity-100 scale-100'}`}>
            {result?.isValid ? (
              <div className="animate-in fade-in zoom-in duration-500 w-full">
                <div className="text-gray-300 text-[10px] font-black mb-4 uppercase tracking-[0.4em]">{aircraft} {rating} · FLAP {flap}</div>
                <div className="flex items-baseline justify-center">
                  <span className="text-[12rem] font-black text-gray-900 tracking-tighter leading-none">{result.vref}</span>
                  <span className="text-3xl font-black text-[#007AFF] ml-4">KTS</span>
                </div>
                {result.isInterpolated && (
                  <div className="mt-12 py-3 px-6 bg-blue-50 rounded-full w-fit mx-auto flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#007AFF] animate-ping"></div>
                    <span className="text-[10px] font-black text-[#007AFF] uppercase tracking-[0.2em]">Cubic Spline Interpolated</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12">
                {result?.error ? (
                  <div className="text-red-500 space-y-4">
                    <div className="bg-red-50 p-6 rounded-full w-fit mx-auto">
                        <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <span className="block text-sm font-black uppercase tracking-widest">{result.error}</span>
                  </div>
                ) : (
                  <div className="space-y-4 opacity-10">
                    <svg className="w-32 h-32 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span className="text-xl font-black uppercase tracking-[0.5em]">Ready</span>
                  </div>
                )}
              </div>
            )}
          </section>
          <button onClick={saveToHistory} disabled={!result?.isValid || isUpdating || isSaved} className={`w-full py-6 rounded-[2.5rem] font-black text-xl shadow-2xl active:scale-[0.96] transition-all ${isSaved ? 'bg-green-500 text-white' : 'bg-[#007AFF] text-white hover:bg-blue-600 disabled:opacity-30'}`}>
            {isSaved ? '✓ DATA LOGGED' : 'CONFIRM CALCULATION'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VrefCalculator;
