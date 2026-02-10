
import React, { useState, useEffect } from 'react';

interface ExtractedMetar {
  station: string;
  time: string;
  wind: string;
  visibility: string;
  clouds: string[];
  temp: string;
  dew: string;
  altimeter: string;
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR' | 'UNK';
}

const MetarView: React.FC = () => {
  const [icao, setIcao] = useState('ZSAM');
  const [hours, setHours] = useState('6');
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedMetar | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'decoded' | 'raw' | 'swift'>('decoded');

  const parseMetar = (raw: string): ExtractedMetar => {
    const firstLine = raw.split('\n')[0] || raw;
    const parts = firstLine.split(' ');
    
    const windMatch = firstLine.match(/(\d{3}|VRB)(\d{2,3})(G\d{2,3})?KT/);
    const wind = windMatch ? `${windMatch[1]}° / ${windMatch[2]}${windMatch[3] ? 'G' + windMatch[3].slice(1) : ''} KT` : 'Variable';

    const visMatch = firstLine.match(/(\d{4})|(\d{1,2}SM)/);
    const visibility = visMatch ? (visMatch[1] === '9999' ? '>10km' : visMatch[0]) : 'Unknown';

    const tempMatch = firstLine.match(/(M?\d{2})\/(M?\d{2})/);
    const temp = tempMatch ? tempMatch[1].replace('M', '-') + '°C' : '--';
    const dew = tempMatch ? tempMatch[2].replace('M', '-') + '°C' : '--';

    const altMatch = firstLine.match(/([QA])(\d{4})/);
    const altimeter = altMatch ? (altMatch[1] === 'Q' ? `QNH ${altMatch[2]}` : `Alt ${altMatch[2].slice(0,2)}.${altMatch[2].slice(2)}`) : 'Unknown';

    const cloudMatches = Array.from(firstLine.matchAll(/(SKC|CLR|FEW|SCT|BKN|OVC|VV)(\d{3})/g));
    const clouds = cloudMatches.map(m => `${m[1]} ${parseInt(m[2]) * 100}ft`);

    let category: ExtractedMetar['flightCategory'] = 'VFR';
    if (firstLine.includes('BKN005') || firstLine.includes('OVC005')) category = 'IFR';
    else if (firstLine.includes('BKN015') || firstLine.includes('OVC015')) category = 'MVFR';

    return {
      station: parts[0] || '---',
      time: parts[1] || '---',
      wind,
      visibility,
      clouds: clouds.length > 0 ? clouds : ['Sky Clear'],
      temp,
      dew,
      altimeter,
      flightCategory: category
    };
  };

  const fetchWeatherData = async () => {
    const code = icao.toUpperCase().trim();
    if (code.length !== 4) {
      setError('Invalid ICAO Code');
      return;
    }

    setLoading(true);
    setError(null);
    
    const apiUrl = `https://aviationweather.gov/api/data/metar?ids=${code}&taf=true&hours=${hours}&format=raw`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Sync failed');
      const text = await response.text();
      if (!text.trim()) throw new Error('No data available');

      setRawData(text.trim());
      setExtracted(parseMetar(text.trim()));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 pb-32">
      {/* iOS Style Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Weather</h2>
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live: ZSAM Data Container</p>
        </div>
      </div>

      {/* Segmented Control */}
      <div className="bg-gray-200/50 p-1 rounded-2xl flex border border-black/5">
        {[
          { id: 'decoded', label: 'Decoded' },
          { id: 'raw', label: 'XPath Output' },
          { id: 'swift', label: 'Swift Source' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
              activeTab === tab.id ? 'bg-white text-[#007AFF] shadow-md' : 'text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Station Search */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            maxLength={4}
            value={icao}
            onChange={(e) => setIcao(e.target.value.toUpperCase())}
            className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-black text-xl text-gray-900 border-none outline-none focus:ring-2 focus:ring-[#007AFF] transition-all"
            placeholder="ICAO"
          />
        </div>
        <button 
          onClick={fetchWeatherData}
          disabled={loading}
          className="bg-[#007AFF] text-white px-8 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
        >
          {loading ? '...' : 'SYNC'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-6 rounded-3xl font-bold text-xs uppercase tracking-widest border border-red-100 animate-in zoom-in">
          Error: {error}
        </div>
      )}

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'decoded' && extracted && (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
            <WeatherCard label="WIND" value={extracted.wind} icon="🌬️" />
            <WeatherCard label="VISIBILITY" value={extracted.visibility} icon="👁️" />
            <WeatherCard label="TEMP / DEW" value={`${extracted.temp} / ${extracted.dew}`} icon="🌡️" />
            <WeatherCard label="PRESSURE" value={extracted.altimeter} icon="⏲️" />
            
            <div className="col-span-2 bg-white rounded-3xl p-6 border border-black/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Clouds</span>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black ${extracted.flightCategory === 'VFR' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {extracted.flightCategory}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {extracted.clouds.map((c, i) => (
                  <span key={i} className="bg-gray-50 px-4 py-2 rounded-xl text-xs font-bold text-gray-600 border border-black/5">{c}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'raw' && rawData && (
          <div className="bg-white rounded-3xl p-8 border border-black/5 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse"></div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">XPath Result: #data-container</h3>
            </div>
            <pre className="bg-gray-50 p-6 rounded-2xl font-mono text-xs text-gray-800 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
              {rawData}
            </pre>
            <div className="pt-4 flex justify-between">
              <span className="text-[9px] font-bold text-gray-300">SOURCE: AVIATIONWEATHER.GOV</span>
              <button 
                onClick={() => { navigator.clipboard.writeText(rawData); alert('Copied!'); }}
                className="text-[9px] font-black text-[#007AFF] hover:underline"
              >
                COPY RAW TEXT
              </button>
            </div>
          </div>
        )}

        {activeTab === 'swift' && (
          <div className="bg-gray-900 rounded-3xl p-8 border border-white/10 space-y-6 animate-in slide-in-from-bottom-4 duration-500 shadow-2xl">
            <div className="flex items-center justify-between">
               <h3 className="text-white text-[10px] font-black uppercase tracking-widest">Swift Implementation</h3>
               <span className="text-orange-400 text-[10px] font-mono">Performance.swift</span>
            </div>
            <pre className="font-mono text-[11px] text-green-400 leading-relaxed overflow-x-auto">
{`// Swift 5.0 Logic for XPath Extraction
func fetchMetar(icao: String) {
    let urlString = "https://aviationweather.gov/data/metar/?ids=\\(icao)&hours=6&taf=1"
    guard let url = URL(string: urlString) else { return }

    let task = URLSession.shared.dataTask(with: url) { data, _, _ in
        guard let data = data, 
              let html = String(data: data, encoding: .utf8) else { return }

        // Using Kanna or SwiftSoup for XPath
        let doc = try? HTML(html: html, encoding: .utf8)
        let container = doc?.at_xpath("//*[@id='data-container']")
        
        DispatchQueue.main.async {
            self.weatherDisplay = container?.text ?? "No Data"
            print("Extracted Content: \\(self.weatherDisplay)")
        }
    }
    task.resume()
}`}
            </pre>
            <p className="text-gray-500 text-[10px] italic leading-relaxed">
              Note: In production iOS apps, using a structured JSON API is preferred over HTML parsing to ensure stability across website updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const WeatherCard: React.FC<{ label: string; value: string; icon: string }> = ({ label, value, icon }) => (
  <div className="bg-white rounded-3xl p-6 border border-black/5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-xl shadow-inner">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-black text-gray-900 tracking-tight">{value}</p>
    </div>
  </div>
);

export default MetarView;
