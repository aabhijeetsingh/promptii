import React, { useState, useEffect } from 'react';
import { CloseIcon, ProIcon, CreditCardIcon, RefreshIcon } from './icons';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProFeatures = [
    "AI-powered clarifying questions to refine your ideas.",
    "Generation of highly detailed, professional-grade prompts.",
    "Access to the most advanced AI models for superior results.",
    "Save and sync your prompt history across devices (with sign-in).",
];

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose }) => {
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
        setPaymentInitiated(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInitiatePayment = () => {
    // 1. Open the Razorpay link in a new tab for the user to pay.
    window.open('https://razorpay.me/@abhijeetsingh6821', '_blank', 'noopener,noreferrer');
    
    // 2. Update the modal to show the verification step.
    setPaymentInitiated(true);
  };
  
  const handleVerifyPayment = () => {
    // 1. Close the modal and redirect to the success page.
    // The app will reload, and the Auth0 token should now contain the 'isPro' claim.
    onClose();
    window.location.href = '/pro-success';
  }

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
        <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <ProIcon className="w-8 h-8 text-white"/>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Unlock Professional Mode</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
                Go beyond basic ideas. Let our AI guide you to create expert-level prompts that get superior results.
            </p>
        </div>
        
        <div className="px-6 pb-6 text-sm text-gray-700 dark:text-gray-300">
            <ul className="space-y-2">
                {ProFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <span className="text-indigo-400 mt-1">&#10003;</span>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>

        <div className="p-6 border-t border-gray-300 dark:border-gray-700/50">
          {!paymentInitiated ? (
             <>
              <button
                onClick={handleInitiatePayment}
                className="w-full flex items-center justify-center gap-3 bg-white/80 dark:bg-white/10 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out text-base"
              >
                <CreditCardIcon className="w-5 h-5" />
                Pay ₹10/month with Razorpay
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-3">
                You will be redirected to Razorpay to complete your payment securely.
              </p>
            </>
          ) : (
            <>
              <button
                onClick={handleVerifyPayment}
                className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-sm hover:bg-indigo-700 transition-all duration-200 ease-in-out text-base"
              >
                <RefreshIcon className="w-5 h-5" />
                Verify Payment & Unlock Pro
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-3">
                Please complete your payment in the other tab. Once finished, click here to activate your Pro subscription.
              </p>
            </>
          )}
        </div>
         <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
        >
            <CloseIcon className="w-5 h-5" />
        </button>
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

export default SubscriptionModal;