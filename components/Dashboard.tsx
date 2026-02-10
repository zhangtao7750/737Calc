
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ToolItem } from '../types';

const TOOLS: ToolItem[] = [
  {
    id: 'vref',
    title: 'VREF Calculator',
    description: 'Landing speed based on current weight & flap config.',
    route: '/vref',
    icon: (
        <div className="bg-[#007AFF] w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        </div>
    )
  },
  {
    id: 'wb',
    title: 'Weight & Balance',
    description: 'EFB-integrated CG limits and take-off weight.',
    route: '/wb',
    icon: (
        <div className="bg-[#34C759] w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
        </div>
    )
  },
  {
    id: 'takeoff',
    title: 'Performance A',
    description: 'Dispatch take-off performance and runway limits.',
    route: '/takeoff',
    icon: (
        <div className="bg-[#FF9500] w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-orange-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 11l7-7 7 7M5 19l7-7 7 7" />
            </svg>
        </div>
    )
  },
  {
      id: 'metar',
      title: 'METAR / TAF',
      description: 'Real-time aviation weather reports globally.',
      route: '/metar',
      icon: (
          <div className="bg-[#5856D6] w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-indigo-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
          </div>
      )
  }
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Welcome Header */}
      <div className="space-y-2">
        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">Welcome, Captain.</h2>
        <p className="text-lg text-gray-400 font-medium">Ready for calculation. Fleet status: <span className="text-[#007AFF]">VERIFIED</span></p>
      </div>

      {/* Responsive Tool Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => navigate(tool.route)}
            className="group w-full bg-white rounded-[2.5rem] p-8 flex flex-col items-center sm:items-start gap-6 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all active:scale-[0.97] border border-black/5"
          >
            {tool.icon}
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <h3 className="font-black text-xl text-gray-900 group-hover:text-[#007AFF] transition-colors tracking-tight">{tool.title}</h3>
              <p className="text-sm text-gray-400 leading-snug font-medium">{tool.description}</p>
            </div>
            <div className="mt-2 w-full flex items-center justify-center sm:justify-between opacity-40 group-hover:opacity-100 transition-opacity">
               <span className="hidden sm:block text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-[#007AFF]">Open Module</span>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-900 group-hover:text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Featured Fleet Card */}
      <div className="bg-[#007AFF] rounded-[3rem] p-10 lg:p-14 text-white overflow-hidden relative shadow-3xl">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                  <div className="bg-white/20 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">AIRAC CYCLE 2402</div>
                  <h3 className="text-3xl lg:text-4xl font-black tracking-tighter leading-tight">Master Fleet Database <br/>Synchronized.</h3>
                  <p className="text-white/80 text-lg font-medium leading-relaxed">System is verified with Boeing Performance Data. Spline stability check: 100% OK.</p>
                  <button className="bg-white text-[#007AFF] px-10 py-4 rounded-[1.5rem] text-sm font-black shadow-xl hover:scale-105 transition-all active:scale-95 flex items-center gap-3">
                      View Operational Data
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </button>
              </div>
              <div className="hidden md:flex justify-end opacity-20">
                  <svg className="w-64 h-64 lg:w-96 lg:h-96 transform rotate-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 16.5c0 .38-.21.71-.53.88l-7.97 4.27c-.16.08-.33.12-.5.12s-.34-.04-.5-.12l-7.97-4.27c-.32-.17-.53-.5-.53-.88V7.5c0-.38.21-.71.53-.88l7.97-4.27c.16-.08.33-.12.5-.12s.34.04.5.12l7.97 4.27c.32.17.53.5.53.88v9z" />
                  </svg>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
