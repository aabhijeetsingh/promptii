import React from 'react';
import { type User } from '@auth0/auth0-react';
import { CloseIcon } from './icons';

interface ProfilePageProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, isOpen, onClose, onSignOut }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-gray-200 dark:bg-gemini-dark-card rounded-2xl shadow-2xl w-full max-w-sm m-4 relative animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close profile"
        >
            <CloseIcon className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
          <img 
            src={user.picture || undefined} 
            alt={user.name || 'User'} 
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white dark:border-gray-500 shadow-md"
          />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
        </div>
        
        <div className="p-6 border-t border-gray-300 dark:border-gray-700/50">
           <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 bg-white/80 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-semibold py-2.5 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out text-sm"
          >
            Sign Out
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

export default ProfilePage;