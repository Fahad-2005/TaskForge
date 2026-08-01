import React, { useState, useId } from 'react';

interface DisclosureProps {
  title: string;
  children: React.ReactNode;
}

export const Disclosure: React.FC<DisclosureProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="w-full border border-slate-700 rounded-lg overflow-hidden my-2">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex justify-between items-center px-4 py-3 bg-[#1E293B] text-[#F8FAFC] font-semibold text-left hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]"
      >
        <span>{title}</span>
        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div id={contentId} className="p-4 bg-[#0B0F19] text-slate-300 border-t border-slate-700">
          {children}
        </div>
      )}
    </div>
  );
};