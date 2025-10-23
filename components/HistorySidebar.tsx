import React from 'react';
import { HistoryItem } from '../types';
import { PlusIcon, HistoryIcon, ProIcon } from './icons';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onNewChat: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isSubscribed: boolean;
  onUpgradeClick: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelectHistory, onNewChat, isOpen, setIsOpen, isSubscribed, onUpgradeClick }) => {
  const handleNew = () => {
      onNewChat();
      setIsOpen(false);
  }

  const handleSelect = (item: HistoryItem) => {
      onSelectHistory(item);
      setIsOpen(false);
  }
  
  const handleUpgrade = () => {
    onUpgradeClick();
    setIsOpen(false);
  }

  return (
    <aside className={`fixed top-0 left-0 z-40 h-full bg-gray-200/95 dark:bg-gemini-dark-card/95 backdrop-blur-md transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-72 flex flex-col`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700/50">
        <div className="flex items-center gap-2">
            <HistoryIcon className="w-6 h-6 text-indigo-500"/>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">History</h2>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto p-2">
        <button
          onClick={handleNew}
          className="w-full flex items-center gap-3 px-4 py-2 mb-2 text-left text-sm font-medium text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-white/5 rounded-lg hover:bg-white/80 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          New Prompt
        </button>
        {!isSubscribed && (
            <button
                onClick={handleUpgrade}
                className="w-full flex items-center gap-3 px-4 py-2 mb-2 text-left text-sm font-medium text-white dark:text-gray-900 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-opacity"
            >
                <ProIcon className="w-5 h-5" />
                Unlock Pro
            </button>
        )}
        <nav className="flex flex-col gap-1">
          {history.sort((a, b) => b.timestamp - a.timestamp).map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className="px-4 py-2 text-left text-sm text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-300/50 dark:hover:bg-white/5 transition-colors truncate"
            >
              {item.title}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default HistorySidebar;