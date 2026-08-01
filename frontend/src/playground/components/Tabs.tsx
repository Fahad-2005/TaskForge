import React, { useState, useRef, KeyboardEvent } from 'react';

interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultTabId?: string;
}

export const Tabs: React.FC<TabsProps> = ({ items, defaultTabId }) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTabId || items[0]?.id || '');
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;

    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % items.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + items.length) % items.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    const nextTabId = items[nextIndex].id;
    setActiveTab(nextTabId);
    tabRefs.current[nextTabId]?.focus();
  };

  return (
    <div className="w-full">
      <div role="tablist" aria-label="Playground Tabs" className="flex border-b border-slate-700 gap-2">
        {items.map((tab, idx) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[tab.id] = el)}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`px-4 py-2 font-medium rounded-t-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#38BDF8] ${
                isSelected
                  ? 'bg-[#1E293B] text-[#38BDF8] border-b-2 border-[#38BDF8]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {items.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          className="p-4 bg-[#1E293B] rounded-b-lg border border-t-0 border-slate-700 text-[#F8FAFC]"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};