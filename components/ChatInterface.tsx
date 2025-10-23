import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message as MessageType } from '../types';
import type { User } from '@auth0/auth0-react';
import Message from './Message';
import { SendIcon, LogoIcon } from './icons';
import { generateClarifyingQuestions, generateProfessionalPrompt } from '../services/geminiService';

interface ChatInterfaceProps {
    messages: MessageType[];
    setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    currentConversationId: string | null;
    onNewConversation: (id: string, messages: MessageType[]) => void;
    user: User | undefined;
    isSubscribed: boolean;
    onUpgradeClick: () => void;
    onShare: (promptText: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, setMessages, isLoading, setIsLoading, currentConversationId, onNewConversation, user, isSubscribed, onUpgradeClick, onShare }) => {
  const [input, setInput] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [finalPromptGenerated, setFinalPromptGenerated] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Max height for 5 rows approx
      const maxHeight = 120; 
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGeneratingPrompt]);
  
  useEffect(() => {
    // Reset state for a new conversation. This should only run when the conversation ID changes.
    const hasFinalPrompt = messages.some(m => m.sender === 'ai' && m.text.includes('Prompt Engineering Structure'));
    setAnswers({});
    setFinalPromptGenerated(hasFinalPrompt);
  }, [currentConversationId, messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading || isGeneratingPrompt) return;

    const userMessage: MessageType = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const initialPrompt = input;
    setInput('');

    if (isSubscribed) {
        // --- PRO USER FLOW ---
        setIsLoading(true);
        try {
            const res = await generateClarifyingQuestions(initialPrompt);
            const questionMessages: MessageType[] = res.questions.map(q => ({
                id: `${Date.now()}-${q.field}`, sender: 'ai', text: q.question, options: q.options, field: q.field, isAnswered: false,
            }));
            setMessages(prev => [...prev, ...questionMessages]);
        } catch (error) {
            console.error(error);
            const errorMessage: MessageType = { id: Date.now().toString(), sender: 'system', text: 'Sorry, I encountered an error fetching clarifying questions. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    } else {
        // --- FREE USER FLOW ---
        setIsGeneratingPrompt(true);
         try {
            const professionalPrompt = await generateProfessionalPrompt(initialPrompt, {}); // Pass empty answers for direct generation
            const finalMessage: MessageType = { id: (Date.now() + 1).toString(), sender: 'ai', text: professionalPrompt };
            setMessages(prev => [...prev, finalMessage]);
        } catch (error) {
            console.error(error);
            const errorMessage: MessageType = { id: (Date.now() + 1).toString(), sender: 'system', text: 'Sorry, I failed to generate the final prompt. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsGeneratingPrompt(false);
        }
    }
  };

  const generateFinalPrompt = useCallback(async (initialPrompt: string, finalAnswers: Record<string, string>) => {
    setIsGeneratingPrompt(true);
    try {
      const professionalPrompt = await generateProfessionalPrompt(initialPrompt, finalAnswers);
      const finalMessage: MessageType = { id: (Date.now() + 1).toString(), sender: 'ai', text: professionalPrompt };
      setMessages(prev => [...prev, finalMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: MessageType = { id: (Date.now() + 1).toString(), sender: 'system', text: 'Sorry, I failed to generate the final prompt. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGeneratingPrompt(false);
    }
  }, [setMessages]);

  const handleOptionSelect = useCallback((field: string, option: string) => {
    // Update the UI for the answered question.
    setMessages(prev => prev.map(m => m.field === field ? { ...m, isAnswered: true, text: `${m.text}<br/><br/><div class="p-2 rounded-md bg-black/10 dark:bg-white/5 text-sm"><i>Your answer: ${option}</i></div>` } : m));
    // Store the answer.
    setAnswers(prevAnswers => ({ ...prevAnswers, [field]: option }));
  }, [setMessages]);

  // Effect to check if all questions are answered and then generate the final prompt.
  useEffect(() => {
    const questions = messages.filter(m => m.field);
    const totalQuestions = questions.length;

    if (!finalPromptGenerated && totalQuestions > 0 && Object.keys(answers).length === totalQuestions) {
        const initialPrompt = messages.find(m => m.sender === 'user')?.text || '';
        if (initialPrompt) {
            setFinalPromptGenerated(true); // Set flag to prevent re-triggering
            generateFinalPrompt(initialPrompt, answers);
        }
    }
  }, [answers, messages, generateFinalPrompt, finalPromptGenerated]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gemini-dark">
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-6">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} onOptionSelect={handleOptionSelect} user={user} onUpgradeClick={onUpgradeClick} onShare={onShare} />
        ))}
         {isGeneratingPrompt && (
            <div className="w-full max-w-3xl mx-auto flex gap-2 sm:gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-1.5 flex items-center justify-center flex-shrink-0">
                    <LogoIcon className="text-white"/>
                </div>
                <div className="flex-1 overflow-hidden pt-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">promptii</p>
                    <div className="mt-2 text-gray-700 dark:text-gray-300 flex items-center space-x-1.5">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
        )}
         {isLoading && (
            <div className="w-full max-w-3xl mx-auto flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white flex-shrink-0 animate-pulse"></div>
                <div className="flex-1 space-y-3 pt-1">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700/50 rounded w-1/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700/50 rounded w-3/4 animate-pulse"></div>
                </div>
            </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="p-2 sm:p-4 bg-transparent from-gray-100 to-transparent dark:from-gemini-dark bg-gradient-to-t">
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="relative flex items-center"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={messages.length > 1 ? "Follow up..." : "Enter your idea..."}
              className="w-full bg-gray-200 dark:bg-gemini-dark-card rounded-2xl shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 py-2.5 pl-3 pr-12 sm:py-3 sm:pl-4 sm:pr-14 text-gray-800 dark:text-gray-200"
              disabled={isLoading || isGeneratingPrompt || messages.some(m => m.options && !m.isAnswered) || finalPromptGenerated}
            />
            <button
              type="submit"
              disabled={isLoading || isGeneratingPrompt || input.trim() === ''}
              className="absolute right-2 bottom-1.5 sm:right-3 sm:bottom-2 p-2 rounded-full bg-indigo-600 text-white disabled:bg-indigo-300 dark:disabled:bg-indigo-900/50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
              aria-label="Send message"
            >
              <SendIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;