
import React, { useState, useCallback } from 'react';
import { CopyIcon, CheckIcon } from './icons';

interface CopyButtonProps {
  textToCopy: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [textToCopy]);

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-all duration-200"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <CheckIcon className="w-5 h-5 text-green-500" />
      ) : (
        <CopyIcon className="w-5 h-5" />
      )}
    </button>
  );
};

export default CopyButton;
