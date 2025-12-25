
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Target {
  id: string;
  url: string;
  siteName: string;
  category: string;
  difficulty: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'injected' | 'verified';
}

interface ViralPayload {
  platform: string;
  content: string;
  hook: string;
}

const App: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [targets, setTargets] = useState<Target[]>([]);
  const [payloads, setPayloads] = useState<ViralPayload[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulation of network nodes
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const particles: any[] = [];

    const createParticle = () => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        size: Math.random() * 2
      };
    };

    for (let i = 0; i < 50; i++) particles.push(createParticle());

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 100) {
            ctx.lineWidth = 1 - dist / 100;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [ `[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 10));
  };

  const startNexusEngine = async () => {
    if (!inputUrl.trim()) return;
    setIsScanning(true);
    setTargets([]);
    setLogs([]);
    addLog("MENYALAKAN NEXUS ENGINE...");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      addLog("SEARCHING HIGH-TRAFFIC SUBMISSION NODES...");
      const searchResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Cari 6 URL spesifik untuk submit link atau membagikan video YouTube tentang "${inputUrl}". Cari forum Reddit aktif, komunitas Discord, grup diskusi, atau situs guest post. Berikan dalam JSON.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      addLog("GENERATING ANTI-DETECTION PAYLOADS...");
      const finalResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Berdasarkan URL "${inputUrl}", buatkan rencana penyebaran agresif. Format JSON:
        {
          "targets": [{"id": "1", "url": "url_target", "siteName": "nama_situs", "category": "forum/blog", "difficulty": "Low/Medium/High"}],
          "payloads": [{"platform": "General", "content": "teks_promosi", "hook": "kata_pancingan"}]
        }`,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(finalResponse.text || '{}');
      setTargets(data.targets || []);
      setPayloads(data.payloads || []);
      addLog("ENGINE READY. SIAP MELAKUKAN INJEKSI.");
    } catch (error) {
      addLog("ERROR: KONEKSI NEXUS TERPUTUS.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleInject = (target: Target) => {
    const payload = payloads[0]?.content || "Tonton video seru ini!";
    navigator.clipboard.writeText(payload);
    addLog(`INJEKSI KE ${target.siteName.toUpperCase()}... PAYLOAD DISALIN.`);
    
    // Simulate injection process
    setTargets(prev => prev.map(t => t.id === target.id ? {...t, status: 'injected'} : t));
    
    // Open target in new tab
    window.open(target.url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-red-500 font-mono selection:bg-red-500/30 overflow-hidden flex flex-col">
      {/* Background Simulation */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-40" />

      {/* Top Header */}
      <header className="border-b border-red-900/30 bg-black/80 backdrop-blur-md p-6 z-20 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 bg-red-600 rounded-sm animate-pulse"></div>
          <h1 className="text-2xl font-black tracking-tighter italic uppercase text-white">Viral <span className="text-red-600">Nexus</span> Core</h1>
        </div>
        <div className="text-[10px] text-red-900 font-bold uppercase tracking-[0.3em]">
          Status: <span className="text-green-500">{isScanning ? 'Scanning...' : 'System Ready'}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Input & Logs */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-black/80 border border-red-900/20 p-6 rounded-sm shadow-2xl">
              <label className="text-[10px] font-black uppercase text-red-900 mb-4 block tracking-widest">Video Target URL</label>
              <input 
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full bg-black border border-red-900/30 p-4 text-sm focus:outline-none focus:border-red-500 transition-all mb-4 text-red-400"
              />
              <button 
                onClick={startNexusEngine}
                disabled={isScanning || !inputUrl}
                className="w-full bg-red-600 hover:bg-red-500 text-black font-black py-4 uppercase text-xs tracking-[0.2em] transition-all disabled:opacity-20 active:scale-95"
              >
                {isScanning ? 'SCANNING NETWORK...' : 'DEPLOY ENGINE'}
              </button>
            </div>

            <div className="bg-black/80 border border-red-900/20 p-6 rounded-sm h-[300px] overflow-hidden flex flex-col">
              <h3 className="text-[10px] font-black uppercase text-red-900 mb-4 tracking-widest italic">Live System Logs</h3>
              <div className="flex-1 overflow-y-auto space-y-2 font-sans">
                {logs.map((log, i) => (
                  <div key={i} className="text-[10px] text-red-500/70 border-l border-red-900/30 pl-2 leading-tight">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Targets & Payloads */}
          <div className="lg:col-span-8 space-y-6">
            {targets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {targets.map((target) => (
                  <div key={target.id} className={`p-6 border transition-all ${target.status === 'injected' ? 'bg-red-950/20 border-red-500' : 'bg-black/80 border-red-900/20'} relative group`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[8px] font-black bg-red-600 text-black px-1 mr-2 uppercase">{target.category}</span>
                        <h4 className="text-sm font-black text-white uppercase mt-2">{target.siteName}</h4>
                      </div>
                      <span className={`text-[8px] font-bold ${target.difficulty === 'High' ? 'text-red-600' : 'text-green-600'}`}>DIFF: {target.difficulty}</span>
                    </div>
                    <p className="text-[10px] text-red-900 truncate mb-4">{target.url}</p>
                    <button 
                      onClick={() => handleInject(target)}
                      className="w-full border border-red-600/50 py-2 text-[10px] font-black uppercase hover:bg-red-600 hover:text-black transition-all"
                    >
                      {target.status === 'injected' ? '✓ RE-INJECT' : 'INJECT TARGET'}
                    </button>
                    {target.status === 'injected' && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 text-[8px] text-green-500 font-bold animate-pulse">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div> SPREADING
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-20 border border-dashed border-red-900/20 text-center opacity-20">
                <div className="text-6xl mb-4 italic font-black">NEXUS</div>
                <p className="text-xs max-w-xs uppercase tracking-widest font-bold">Masukkan URL video dan deploy engine untuk mendeteksi node distribusi.</p>
              </div>
            )}

            {payloads.length > 0 && (
              <div className="bg-red-600/5 border border-red-600/20 p-6">
                <h3 className="text-[10px] font-black uppercase text-red-500 mb-4 tracking-widest italic">Global Viral Payload</h3>
                <div className="bg-black p-4 border border-red-900/20">
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">{payloads[0].content}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="bg-black border-t border-red-900/30 p-4 text-[9px] flex justify-between items-center uppercase font-bold text-red-900 tracking-widest">
        <div>© Viral Nexus Core // Authorized Use Only</div>
        <div className="flex gap-6">
          <span>Active Nodes: {targets.filter(t => t.status === 'injected').length}</span>
          <span>Traffic Flow: {targets.filter(t => t.status === 'injected').length * 250} req/m</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
