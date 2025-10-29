import React, { useState } from 'react';
import AiIssueBot from './AiIssueBot';

const AiChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end">
        {/* Chat panel */}
        <div className={`transform transition-transform duration-200 ${open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 pointer-events-none'}`}>
          <div className="w-80 sm:w-96 bg-primary-dark/90 border border-white/10 rounded-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-dark-navy/80">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-glow-blue rounded-full flex items-center justify-center text-white font-semibold">AI</div>
                <div>
                  <div className="text-sm font-semibold">Assistant</div>
                  <div className="text-xs text-gray-400">Ask about reports, services, or drafts</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setOpen(false)} className="text-sm text-gray-300 hover:text-white">Close</button>
              </div>
            </div>
            <div className="p-3">
              <AiIssueBot />
            </div>
          </div>
        </div>

        {/* Floating toggle button */}
        <button onClick={() => setOpen(o => !o)} aria-label="Open assistant" className="mt-3 h-14 w-14 rounded-full bg-glow-blue shadow-lg flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>
      </div>
    </div>
  );
};

export default AiChatWidget;
