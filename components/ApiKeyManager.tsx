
import React from 'react';

interface ApiKeyManagerProps {
  onKeySelected: () => void;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onKeySelected }) => {
  const handleOpenSelectKey = async () => {
    try {
      // Assuming window.aistudio is available in this environment
      await (window as any).aistudio.openSelectKey();
      onKeySelected();
    } catch (error) {
      console.error("Error opening key selector:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm text-center">
      <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-4">Akses Model Generasi Video</h2>
      <p className="text-slate-400 mb-8 max-w-md">
        Untuk menggunakan fitur pembuatan video Veo, Anda perlu memilih API Key dari proyek Google Cloud yang memiliki penagihan aktif (Billing).
      </p>
      <button
        onClick={handleOpenSelectKey}
        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
      >
        Pilih API Key
      </button>
      <a 
        href="https://ai.google.dev/gemini-api/docs/billing" 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-6 text-sm text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
      >
        Pelajari tentang Penagihan API
      </a>
    </div>
  );
};

export default ApiKeyManager;
