import React, { useState } from 'react';
import { Message as MessageType } from '../types';
import type { User } from '@auth0/auth0-react';
import CopyButton from './CopyButton';
import { LogoIcon, ShareIcon } from './icons';

interface MessageProps {
  message: MessageType;
  onOptionSelect: (field: string, option: string) => void;
  onShare: (promptText: string) => void;
  onUpgradeClick?: () => void;
  user: User | undefined;
}

const UserIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center font-semibold text-white flex-shrink-0">
      U
    </div>
);

const AIIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-1.5 flex items-center justify-center flex-shrink-0">
        <LogoIcon className="text-white"/>
    </div>
);

const Message: React.FC<MessageProps> = ({ message, onOptionSelect, onShare }) => {
  const { sender, text, options, field, isAnswered } = message;
  const [customValue, setCustomValue] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleOptionClick = (option: string) => {
    if (option.toLowerCase().includes('custom')) {
      setShowCustomInput(true);
    } else if (field) {
      onOptionSelect(field, option);
    }
  };
  
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customValue.trim() && field) {
        onOptionSelect(field, customValue.trim());
        setCustomValue('');
        setShowCustomInput(false);
    }
  };

  const isUser = sender === 'user';
  const isAI = sender === 'ai';
  const isSystem = sender === 'system';

  if (isSystem) {
      return (
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-2">
              {text}
          </div>
      )
  }
  
  const hasFinalPromptStructure = text.includes('Prompt Engineering Structure');

  return (
    <div className='w-full max-w-3xl mx-auto flex gap-2 sm:gap-4'>
      {isUser ? <UserIcon /> : <AIIcon />}
      <div className="flex-1 overflow-hidden pt-1">
        <div className="flex justify-between items-center">
             <p className="font-semibold text-gray-800 dark:text-gray-200">{isUser ? 'You' : 'promptii'}</p>
             {isAI && hasFinalPromptStructure && (
                <div className="flex items-center">
                    <CopyButton textToCopy={text} />
                    <button
                        onClick={() => onShare(text)}
                        className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
                        aria-label="Share prompt"
                    >
                        <ShareIcon className="w-5 h-5" />
                    </button>
                </div>
             )}
        </div>
        
        {hasFinalPromptStructure ? (
            <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 text-sm leading-relaxed mt-2 bg-gray-50 dark:bg-black/20 p-3 sm:p-4 rounded-lg overflow-x-auto">{text}</pre>
        ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br />') }} />
        )}

        {options && field && !isAnswered && (
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleOptionClick(option)}
                        className="w-full text-left px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gemini-dark-card hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                        {option}
                    </button>
                ))}
            </div>
            {showCustomInput && (
                <form onSubmit={handleCustomSubmit} className="flex gap-2 mt-2">
                    <input
                        type="text"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        placeholder="Enter your custom value"
                        className="flex-grow bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                    />
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        Submit
                    </button>
                </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;