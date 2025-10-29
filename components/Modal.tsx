import React from 'react';

const Modal: React.FC<{ title?: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-primary-dark rounded-lg w-11/12 max-w-2xl p-6 z-10" style={{ overflowX: 'hidden' }}>
        <div className="flex items-start justify-between gap-4" style={{ flexWrap: 'wrap' }}>
          <h3 className="text-lg font-bold text-white" style={{ maxWidth: '80%', whiteSpace: 'normal', wordBreak: 'break-all', overflowWrap: 'anywhere' }}>{title}</h3>
          <button type="button" onClick={onClose} className="text-light-slate">Close</button>
        </div>
        <div className="mt-4" style={{ maxHeight: '70vh', overflow: 'auto', wordBreak: 'break-all', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
