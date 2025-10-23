import React from 'react';
import { LogoIcon, ProIcon } from './icons';

const ProSuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen font-sans bg-gray-100 dark:bg-gemini-dark text-gray-900 dark:text-gray-200 flex flex-col items-center justify-center p-4">
       <div className="text-center p-8 bg-white dark:bg-gemini-dark-card shadow-2xl rounded-2xl max-w-lg w-full animate-fade-in-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <ProIcon className="w-10 h-10 text-white"/>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">Congratulations!</h1>
            <h2 className="text-xl font-semibold text-indigo-500 dark:text-indigo-400 mb-4">You are now a Pro user.</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                You've unlocked the full power of promptii. You can now use our interactive AI to refine your ideas and generate truly professional prompts.
            </p>
            <a 
                href="/" 
                className="inline-block bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors text-base no-underline shadow-lg"
            >
                Start Creating
            </a>
          </div>
          <footer className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                <LogoIcon className="w-6 h-6"/>
                <span className="font-semibold">promptii</span>
            </div>
          </footer>
          <style>{`
            @keyframes fade-in-up {
              from { opacity: 0; transform: translateY(20px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .animate-fade-in-up {
              animation: fade-in-up 0.5s ease-out forwards;
            }
          `}</style>
    </div>
  );
};

export default ProSuccessPage;
