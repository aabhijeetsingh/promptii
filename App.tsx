import React, { useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { User } from '@auth0/auth0-react';
import { HistoryItem, Message } from './types';
import HistorySidebar from './components/HistorySidebar';
import ChatInterface from './components/ChatInterface';
import { MenuIcon, LogoIcon } from './components/icons';
import ThemeToggle from './components/ThemeToggle';
import ProfilePage from './components/ProfilePage';
import SubscriptionModal from './components/SubscriptionModal';
import ShareModal from './components/ShareModal';
import useLocalStorage from './hooks/useLocalStorage';
import { createSharedPrompt, firebaseInitialized } from './services/firebase';


const App: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('theme', 'dark');
  const { user, isAuthenticated, isLoading: authLoading, loginWithRedirect, logout } = useAuth0();

  // Pro status is now derived from a custom claim in the Auth0 user profile.
  // This assumes a Rule or Action in Auth0 adds this claim to the token.
  const isSubscribed = user?.['https://promptii.example.com/isPro'] === true;

  const [guestHistory, setGuestHistory] = useLocalStorage<HistoryItem[]>('promptii-history-guest', []);
  const userHistoryKey = (isAuthenticated && user?.sub) ? `promptii-history-${user.sub}` : 'promptii-history-guest';
  const [currentHistory, setCurrentHistory] = useLocalStorage<HistoryItem[]>(userHistoryKey, []);
  
  const history = isAuthenticated ? currentHistory : guestHistory;
  const setHistory = isAuthenticated ? setCurrentHistory : setGuestHistory;
  
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);

  const [isSubscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);

  // Effect to merge guest history into user's local storage on login
  useEffect(() => {
    if (isAuthenticated && user?.sub && guestHistory.length > 0) {
      const userHistoryIds = new Set(currentHistory.map(h => h.id));
      const itemsToMerge = guestHistory.filter(h => !userHistoryIds.has(h.id));
      if (itemsToMerge.length > 0) {
        setCurrentHistory(prev => [...prev, ...itemsToMerge]);
      }
      // Clear guest history after merging
      setGuestHistory([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.sub]);


  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
  useEffect(() => {
    if (!authLoading) {
      handleNewChat();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (currentConversationId && messages.length > 1) {
      const userPrompt = messages.find(m => m.sender === 'user')?.text;
      const title = userPrompt ? userPrompt.substring(0, 30) + (userPrompt.length > 30 ? '...' : '') : 'New Prompt';
      const newHistoryItem = { id: currentConversationId, title, messages, timestamp: Date.now() };

      setHistory(prevHistory => {
        const existingIndex = prevHistory.findIndex(h => h.id === currentConversationId);
        if (existingIndex > -1) {
          const updatedHistory = [...prevHistory];
          updatedHistory[existingIndex] = newHistoryItem;
          return updatedHistory;
        } else {
          return [...prevHistory, newHistoryItem];
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, currentConversationId]);

  const handleNewChat = useCallback(() => {
    const newId = `chat-${Date.now()}`;
    setCurrentConversationId(newId);
    setMessages([
        { id: 'initial-system-message', sender: 'system', text: 'Welcome to promptii! Start by entering a simple idea or a prompt below.'}
    ]);
    setIsLoading(false);
    setSidebarOpen(false);
  }, []);

  const handleSelectHistory = useCallback((item: HistoryItem) => {
    setCurrentConversationId(item.id);
    setMessages(item.messages);
    setIsLoading(false);
    setSidebarOpen(false);
  }, []);

  const handleSignIn = async () => {
    await loginWithRedirect();
  };

  const handleSignOut = async () => {
      await logout({ logoutParams: { returnTo: window.location.origin } });
      setProfileOpen(false);
  }
  
  const handleOpenSubscriptionModal = () => setSubscriptionModalOpen(true);

  const handleSharePrompt = async (promptText: string) => {
    if (!firebaseInitialized) {
        alert("Sharing is not available. Please ensure Firebase is configured correctly.");
        return;
    }
    setShareLink(null);
    setShareModalOpen(true);
    setIsSharing(true);

    try {
        const promptId = await createSharedPrompt(promptText);
        const link = `${window.location.origin}/share/${promptId}`;
        setShareLink(link);
    } catch (error) {
        console.error("Failed to share prompt:", error);
        setShareLink(null); // Ensure link is null on error
    } finally {
        setIsSharing(false);
    }
  };


  if (authLoading) {
      return (
          <div className="h-screen w-screen flex items-center justify-center bg-gray-100 dark:bg-gemini-dark">
              <LogoIcon className="w-16 h-16 text-indigo-500 animate-pulse"/>
          </div>
      );
  }

  return (
    <div className="h-screen w-screen font-sans text-base text-gray-900 dark:text-gray-200 bg-gray-100 dark:bg-gemini-dark overflow-hidden">
      <HistorySidebar 
        history={history} 
        onSelectHistory={handleSelectHistory} 
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
        isSubscribed={isSubscribed}
        onUpgradeClick={handleOpenSubscriptionModal}
       />
       {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30"></div>}
      
      {isAuthenticated && user && (
          <ProfilePage 
            user={user}
            isOpen={isProfileOpen}
            onClose={() => setProfileOpen(false)}
            onSignOut={handleSignOut}
          />
      )}
      
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        shareLink={shareLink}
        isLoading={isSharing}
      />

      <div className="flex flex-col h-full">
        <Header 
          user={user}
          theme={theme} 
          setTheme={setTheme} 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
          onSignIn={handleSignIn}
          authLoading={authLoading}
          onProfileClick={() => setProfileOpen(true)}
          isAuthenticated={isAuthenticated}
        />
        <main className="flex-1 overflow-y-auto">
          <ChatInterface
            messages={messages}
            setMessages={setMessages}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            currentConversationId={currentConversationId}
            onNewConversation={() => {}} // History is managed in App.tsx
            user={user}
            isSubscribed={isSubscribed}
            onUpgradeClick={handleOpenSubscriptionModal}
            onShare={handleSharePrompt}
          />
        </main>
      </div>
    </div>
  );
};

const Header: React.FC<{
  user: User | undefined;
  isAuthenticated: boolean;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSidebar: () => void;
  onSignIn: () => void;
  authLoading: boolean;
  onProfileClick: () => void;
}> = ({ user, isAuthenticated, theme, setTheme, toggleSidebar, onSignIn, authLoading, onProfileClick }) => {

  return (
    <header className="flex items-center justify-between p-2 md:p-4 border-b border-gray-200 dark:border-gray-700/50 bg-gray-100/80 dark:bg-gemini-dark/80 backdrop-blur-sm sticky top-0 z-20">
       <div className="flex items-center gap-2">
            <button onClick={toggleSidebar} className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gemini-dark-card">
                <MenuIcon className="w-6 h-6"/>
            </button>
            <LogoIcon className="w-8 h-8 text-indigo-500" />
            <h1 className="hidden sm:block text-xl font-bold text-gray-800 dark:text-gray-200">
                promptii
            </h1>
       </div>
       <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            {isAuthenticated && user ? (
                <button onClick={onProfileClick} className="rounded-full transition-opacity hover:opacity-80">
                    <img src={user.picture || undefined} alt={user.name || 'User'} className="w-8 h-8 rounded-full" />
                </button>
            ) : (
                <button
                    onClick={onSignIn}
                    disabled={authLoading}
                    className="flex items-center justify-center gap-2 bg-white/50 dark:bg-white/5 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {authLoading ? (
                         <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        "Sign In"
                    )}
                </button>
            )}
       </div>
    </header>
  );
};

export default App;