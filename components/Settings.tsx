
import React, { useState, useEffect, useRef } from 'react';
import { AircraftType, EngineRating, PerformanceDataset, PerformanceModule } from '../types';
import { loadDataset, saveDataset } from '../services/performanceDb';
import * as XLSX from 'xlsx';

const ENGINE_RATINGS: Record<AircraftType, EngineRating[]> = {
  [AircraftType.NG]: ['22K', '24K', '26K', '26K_SF'],
  [AircraftType.MAX]: ['25K', '27K', '28K']
};

const STANDARD_WEIGHTS = [85000, 80000, 75000, 70000, 65000, 60000, 55000, 50000, 45000, 40000];
const STANDARD_FLAPS = ["40", "30", "15"];

const PERFORMANCE_PROJECTS: { id: PerformanceModule; label: string; icon: string }[] = [
  { id: 'VREF', label: 'VREF', icon: '⚡️' },
  { id: 'TAKEOFF', label: 'Take-off', icon: '🛫' },
  { id: 'WB', label: 'W&B', icon: '⚖️' },
];

const SettingsView: React.FC = () => {
  const [activeModule, setActiveModule] = useState<PerformanceModule>('VREF');
  const [aircraft, setAircraft] = useState<AircraftType>(AircraftType.NG);
  const [rating, setRating] = useState<EngineRating>('26K');
  const [dataset, setDataset] = useState<PerformanceDataset | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');
  
  const [tempWorkbook, setTempWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [showSheetPicker, setShowSheetPicker] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRating(ENGINE_RATINGS[aircraft][0]);
  }, [aircraft]);

  useEffect(() => {
    setDataset(loadDataset(activeModule, aircraft, rating));
  }, [activeModule, aircraft, rating]);

  const handleUpdate = () => {
    if (dataset) {
      saveDataset(activeModule, aircraft, rating, dataset);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const resetToTemplate = () => {
    if (!window.confirm(`Reset ${activeModule} rating to standard template?`)) return;
    const newDataset: PerformanceDataset = {
      weights: [...STANDARD_WEIGHTS],
      flaps: [...STANDARD_FLAPS],
      grid: STANDARD_WEIGHTS.map(() => STANDARD_FLAPS.map(() => 0))
    };
    setDataset(newDataset);
  };

  const addWeightRow = () => {
    if (!dataset) return;
    const newWeights = [...dataset.weights, 0];
    const newGrid = [...dataset.grid, new Array(dataset.flaps.length).fill(0)];
    setDataset({ ...dataset, weights: newWeights, grid: newGrid });
  };

  const removeWeightRow = (idx: number) => {
    if (!dataset || dataset.weights.length <= 1) return;
    const newWeights = dataset.weights.filter((_, i) => i !== idx);
    const newGrid = dataset.grid.filter((_, i) => i !== idx);
    setDataset({ ...dataset, weights: newWeights, grid: newGrid });
  };

  const addFlapColumn = () => {
    if (!dataset) return;
    const newFlaps = [...dataset.flaps, "New"];
    const newGrid = dataset.grid.map(row => [...row, 0]);
    setDataset({ ...dataset, flaps: newFlaps, grid: newGrid });
  };

  const removeFlapColumn = (idx: number) => {
    if (!dataset || dataset.flaps.length <= 1) return;
    const newFlaps = dataset.flaps.filter((_, i) => i !== idx);
    const newGrid = dataset.grid.map(row => row.filter((_, i) => i !== idx));
    setDataset({ ...dataset, flaps: newFlaps, grid: newGrid });
  };

  const updateWeightValue = (idx: number, val: string) => {
    if (!dataset) return;
    const newWeights = [...dataset.weights];
    newWeights[idx] = parseInt(val) || 0;
    setDataset({ ...dataset, weights: newWeights });
  };

  const updateFlapName = (idx: number, val: string) => {
    if (!dataset) return;
    const newFlaps = [...dataset.flaps];
    newFlaps[idx] = val;
    setDataset({ ...dataset, flaps: newFlaps });
  };

  const updateGridValue = (wIdx: number, fIdx: number, val: string) => {
    if (!dataset) return;
    const newGrid = dataset.grid.map(row => [...row]);
    newGrid[wIdx][fIdx] = parseFloat(val) || 0;
    setDataset({ ...dataset, grid: newGrid });
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !dataset) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      setTempWorkbook(wb);
      setAvailableSheets(wb.SheetNames);
      if (wb.SheetNames.length > 1) setShowSheetPicker(true);
      else importDataFromSheet(wb, wb.SheetNames[0]);
    };
    reader.readAsBinaryString(file);
  };

  const importDataFromSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    if (!dataset) return;
    const ws = wb.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const newGrid = dataset.grid.map(row => [...row]);
    for (let i = 0; i < dataset.weights.length; i++) {
      for (let j = 0; j < dataset.flaps.length; j++) {
          if (data[i] && data[i][j] !== undefined) {
              newGrid[i][j] = parseFloat(data[i][j]) || 0;
          }
      }
    }
    setDataset({ ...dataset, grid: newGrid });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setShowSheetPicker(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      
      {/* iPad Installation Banner */}
      <div className="bg-[#007AFF] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center gap-6">
          <div className="bg-white/20 p-4 rounded-2xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
          </div>
          <div className="flex-1 space-y-1 text-center md:text-left">
              <h3 className="text-lg font-black tracking-tight">Install on iPad</h3>
              <p className="text-white/80 text-xs font-medium">To use AeroCalc as a standalone offline App, tap the <span className="font-black text-white">Share</span> button in Safari and select <span className="font-black text-white">"Add to Home Screen"</span>.</p>
          </div>
      </div>

      <div className="px-1 space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Data Management</h2>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Global Sync</p>
      </div>

      {/* Module Selector */}
      <div className="bg-gray-200/50 p-1 rounded-[1.5rem] flex border border-black/5">
        {PERFORMANCE_PROJECTS.map((project) => (
          <button
            key={project.id}
            onClick={() => setActiveModule(project.id)}
            className={`flex-1 py-3 px-2 rounded-xl text-[10px] font-black transition-all flex flex-col items-center gap-1 ${
              activeModule === project.id ? 'bg-white text-[#007AFF] shadow-lg scale-100' : 'text-gray-400 scale-95 opacity-60 hover:opacity-100'
            }`}
          >
            <span className="text-base">{project.icon}</span>
            <span className="uppercase tracking-tighter">{project.label}</span>
          </button>
        ))}
      </div>

      {/* Configuration Group */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-black/5 space-y-6">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Fleet</label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    {[AircraftType.NG, AircraftType.MAX].map(t => (
                        <button key={t} onClick={() => setAircraft(t)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${aircraft === t ? 'bg-white shadow-sm text-[#007AFF]' : 'text-gray-500'}`}>{t}</button>
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Rating</label>
                <select 
                    value={rating} 
                    onChange={(e) => setRating(e.target.value as EngineRating)}
                    className="w-full bg-gray-100 p-2.5 rounded-xl text-xs font-bold text-gray-600 border-none outline-none focus:ring-1 focus:ring-[#007AFF]"
                >
                    {ENGINE_RATINGS[aircraft].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
        </div>

        <div className="pt-2 flex flex-col gap-4">
          <div className="flex gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-white border-2 border-dashed border-gray-200 py-4 rounded-2xl flex flex-col items-center justify-center gap-1 active:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Load Excel</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleExcelImport} accept=".xlsx, .xls" className="hidden" />
            
            <div className="flex flex-col gap-2">
              <button onClick={addWeightRow} className="bg-gray-100 p-3 rounded-xl text-[#007AFF] hover:bg-gray-200 transition-colors" title="Add Row">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </button>
              <button onClick={addFlapColumn} className="bg-gray-100 p-3 rounded-xl text-green-600 hover:bg-gray-200 transition-colors" title="Add Col">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
              </button>
            </div>
          </div>
          
          <button 
            onClick={resetToTemplate}
            className="w-full py-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] active:bg-gray-100 transition-all"
          >
            Clear and Re-Initialize {activeModule} Grid
          </button>
        </div>
      </div>

      {/* Grid Editor */}
      {dataset ? (
        <div className="space-y-2">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]">{activeModule} AFM Grid</h3>
            <span className="text-[10px] font-bold text-gray-300 italic">Auto-Scaling Matrix</span>
          </div>
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-black/5">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-center border-collapse">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase border-b border-black/5">Weight</th>
                    {dataset.flaps.map((f, fIdx) => (
                      <th key={fIdx} className="p-4 border-b border-black/5 group min-w-[80px]">
                        <div className="flex flex-col items-center gap-1">
                          <input
                              type="text"
                              value={f}
                              onChange={(e) => updateFlapName(fIdx, e.target.value)}
                              className="w-full bg-transparent text-center font-black text-[#007AFF] text-xs uppercase focus:outline-none"
                          />
                          <button onClick={() => removeFlapColumn(fIdx)} className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {dataset.weights.map((w, wIdx) => (
                    <tr key={wIdx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-2 border-r border-black/5 w-24 relative group">
                        <input
                          type="number"
                          value={w}
                          onChange={(e) => updateWeightValue(wIdx, e.target.value)}
                          className="w-full bg-gray-100/50 rounded-lg p-2 font-black text-gray-700 text-xs text-center border-none outline-none focus:ring-1 focus:ring-[#007AFF]"
                        />
                        <button onClick={() => removeWeightRow(wIdx)} className="absolute left-[-4px] top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm rounded-full p-1 text-red-500"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg></button>
                      </td>
                      {dataset.flaps.map((_, fIdx) => (
                        <td key={fIdx} className="p-2">
                          <input
                            type="number"
                            step="0.1"
                            value={dataset.grid[wIdx][fIdx]}
                            onChange={(e) => updateGridValue(wIdx, fIdx, e.target.value)}
                            className="w-full bg-white rounded-lg p-2 text-center text-xs font-bold text-gray-900 border-none outline-none focus:ring-1 focus:ring-[#007AFF]"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center opacity-30">
          <p className="text-sm font-bold">Initializing {activeModule} Data...</p>
        </div>
      )}

      <button
        onClick={handleUpdate}
        className={`w-full py-5 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 ${saveStatus === 'success' ? 'bg-green-500 text-white' : 'bg-[#007AFF] text-white'}`}
      >
        {saveStatus === 'success' ? `✓ ${activeModule} DATABASE UPDATED` : `SAVE ${activeModule} CONFIGURATION`}
      </button>

      {showSheetPicker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">Sheet Selector</h3>
              <p className="text-xs text-gray-400 font-medium">Importing to {activeModule}</p>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-1">
              {availableSheets.map((name) => (
                <button
                  key={name}
                  onClick={() => tempWorkbook && importDataFromSheet(tempWorkbook, name)}
                  className="w-full py-4 px-4 bg-gray-50 rounded-xl text-left font-bold text-gray-700 text-sm hover:bg-gray-100 active:scale-[0.98] transition-all flex items-center justify-between"
                >
                  <span>{name}</span>
                  <svg className="w-4 h-4 text-[#007AFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowSheetPicker(false)}
              className="w-full mt-4 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="text-center space-y-2 pb-10">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">Operational Warning</p>
        <p className="text-[10px] text-gray-400 px-8 leading-relaxed italic">
          Manual data entry and Excel imports are specific to the selected module ({activeModule}). Ensure you are importing the correct AFM dataset for the active project.
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
