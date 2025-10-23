import React, { useState, useEffect } from 'react';
import { getSharedPrompt } from '../services/firebase';
import { LogoIcon } from './icons';
import CopyButton from './CopyButton';

const SharePage: React.FC<{ promptId: string }> = ({ promptId }) => {
  const [promptText, setPromptText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        setIsLoading(true);
        const text = await getSharedPrompt(promptId);
        if (text) {
          setPromptText(text);
        } else {
          setError('Prompt not found. The link may be invalid or the prompt may have been deleted.');
        }
      } catch (e) {
        setError('An error occurred while fetching the prompt.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrompt();
  }, [promptId]);

  return (
    <div className="min-h-screen font-sans bg-gray-100 dark:bg-gemini-dark text-gray-900 dark:text-gray-200">
      <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700/50 bg-gray-100/80 dark:bg-gemini-dark/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
            <LogoIcon className="w-8 h-8 text-indigo-500" />
            <h1 className="text-xl font-bold">promptii</h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">| Shared Prompt</span>
        </div>
        <a href="/" className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
            Create your own
        </a>
      </header>

      <main className="p-4 md:p-8 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
             <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-white dark:bg-gemini-dark-card shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Oops! Prompt Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <a 
                href="/" 
                className="inline-block bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors text-base no-underline"
            >
                Create a New Prompt
            </a>
          </div>
        ) : promptText ? (
          <div className="bg-white dark:bg-gemini-dark-card shadow-lg rounded-lg overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-black/20">
                <h2 className="font-semibold">Generated Professional Prompt</h2>
                <CopyButton textToCopy={promptText} />
            </div>
            <pre className="p-6 whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 text-sm leading-relaxed overflow-x-auto">
                {promptText}
            </pre>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default SharePage;