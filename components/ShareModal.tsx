import React, { useState, useEffect } from 'react';
import { CopyIcon, CheckIcon, CloseIcon } from './icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareLink: string | null;
  isLoading: boolean;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, shareLink, isLoading }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCopied(false); // Reset copied state when modal opens
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };
  
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-gray-200 dark:bg-gemini-dark-card rounded-2xl shadow-2xl w-full max-w-md m-4 relative animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-700/50">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Share Prompt</h2>
            <button 
                onClick={onClose}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
            >
                <CloseIcon className="w-5 h-5" />
            </button>
        </div>

        <div className="p-6 space-y-4">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-32 gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Generating share link...</p>
                </div>
            ) : shareLink ? (
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Anyone with this link can view this prompt. It will be publicly accessible.</p>
                    <div className="flex items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-black/20 rounded-lg">
                        <input
                            type="text"
                            value={shareLink}
                            readOnly
                            className="flex-grow bg-transparent focus:outline-none text-sm text-gray-700 dark:text-gray-300"
                        />
                        <button
                            onClick={handleCopy}
                            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            aria-label="Copy link"
                        >
                            {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center text-red-500 py-4">
                    <p>Sorry, could not generate a share link. Please try again.</p>
                </div>
            )}
        </div>
        <div className="p-4 bg-gray-100 dark:bg-black/20 rounded-b-2xl text-right">
             <button
                onClick={onClose}
                className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Done
              </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ShareModal;