import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export interface TaskCardData {
  projectTitle: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  totalHours: number;
  subtasks: Array<{
    title: string;
    estimatedHours: number;
    status?: string;
  }>;
}

export function TaskCardResult({ data }: { data: TaskCardData }) {
  if (!data) return null;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
      case 'High':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
    }
  };

  return (
    <div className="bg-[#1E293B] border border-slate-700 rounded-xl p-4 my-3 text-[#F8FAFC] shadow-lg max-w-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-[#38BDF8] text-base">{data.projectTitle}</h3>
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getPriorityBadge(
            data.priority,
          )}`}
        >
          {data.priority}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
        <Clock className="w-3.5 h-3.5" /> Est. Time: {data.totalHours} hours
      </div>

      <div className="space-y-2">
        {data.subtasks?.map((task, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center bg-[#0B0F19] p-2.5 rounded-lg border border-slate-800 text-xs"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {task.title}
            </span>
            <span className="text-slate-400 font-mono">{task.estimatedHours}h</span>
          </div>
        ))}
      </div>
    </div>
  );
}