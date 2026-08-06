import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export function EmptyState({ onSelectPrompt }: { onSelectPrompt: (p: string) => void }) {
  const suggestions = [
    "Break down user auth into sub-tasks with estimates",
    "Design a database schema for TaskForge notifications",
    "List key acceptance criteria for drag-and-drop Kanban"
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <div className="w-12 h-12 bg-[#38BDF8]/10 text-[#38BDF8] rounded-2xl flex items-center justify-center mb-4 border border-[#38BDF8]/20">
        <Sparkles className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-1">What are we building today?</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6">Select a starter workflow or ask TaskForge AI to plan your next feature.</p>
      
      <div className="grid gap-2 w-full max-w-md text-left">
        {suggestions.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onSelectPrompt(prompt)}
            className="p-3 rounded-xl bg-[#1E293B]/60 hover:bg-[#1E293B] border border-slate-800 text-xs text-slate-300 hover:text-white transition-all flex justify-between items-center group"
          >
            <span>{prompt}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#38BDF8] transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}