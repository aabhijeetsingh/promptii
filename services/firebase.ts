import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, type Auth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, serverTimestamp, type Firestore } from 'firebase/firestore';
import type { HistoryItem } from '../types';

// IMPORTANT: These values should be provided via environment variables for a real deployment.
// The placeholders below allow the app to initialize for local development.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSy...YOUR-API-KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-project-id.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project-id.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: process.env.FIREBASE_APP_ID || "1:000000000000:web:0000000000000000000000",
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let provider: GoogleAuthProvider | undefined;
let firebaseInitialized = false;

// Initialize Firebase only if a valid projectId is provided.
if (firebaseConfig.projectId && firebaseConfig.projectId !== "your-project-id") {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        provider = new GoogleAuthProvider();
        firebaseInitialized = true;
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        firebaseInitialized = false;
    }
} else {
    console.warn(
        `Firebase is not configured or is using placeholder credentials. The app will run in guest mode. 
Authentication, history sync, and sharing features will be disabled. 
Please create a Firebase project and add your credentials as environment variables to enable full functionality.`
    );
}


export const signInWithGoogle = async () => {
  if (!firebaseInitialized || !auth || !provider) {
    // This error will be caught by the calling function in App.tsx
    throw new Error("Firebase not initialized, cannot sign in.");
  }
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    // Re-throw the error so the UI can handle it and show an alert.
    throw error;
  }
};

export const signOut = () => {
  if (!firebaseInitialized || !auth) {
      console.error("Firebase not initialized, cannot sign out.");
      return Promise.resolve();
  }
  return firebaseSignOut(auth);
};

// Firestore functions for user profiles
export const updateUserProfile = async (userId: string, data: object): Promise<void> => {
    if (!firebaseInitialized || !db) return;
    try {
        const userDocRef = doc(db, 'users', userId);
        await setDoc(userDocRef, data, { merge: true });
    } catch (error) {
        console.error("Error updating user profile:", error);
    }
}

export const getUserProfile = async (userId: string): Promise<{ history: HistoryItem[], isPro: boolean }> => {
    if (!firebaseInitialized || !db) return { history: [], isPro: false };
    try {
        const userDocRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                history: (data.history || []) as HistoryItem[],
                isPro: data.isPro || false
            };
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
    return { history: [], isPro: false };
}

export const mergeGuestHistory = async (userId: string, guestHistory: HistoryItem[]): Promise<{ history: HistoryItem[], isPro: boolean }> => {
    if (!firebaseInitialized || !db) return { history: guestHistory, isPro: false };
    
    const profile = await getUserProfile(userId);
    const userHistory = profile.history;
    
    if (guestHistory.length === 0) return profile;

    const userHistoryIds = new Set(userHistory.map(item => item.id));
    const itemsToMerge = guestHistory.filter(item => !userHistoryIds.has(item.id));
    
    if (itemsToMerge.length > 0) {
        const mergedHistory = [...userHistory, ...itemsToMerge];
        await updateUserProfile(userId, { history: mergedHistory });
        return { history: mergedHistory, isPro: profile.isPro };
    }
    
    return profile;
}

// Firestore functions for sharing prompts
export const createSharedPrompt = async (promptText: string): Promise<string> => {
    if (!firebaseInitialized || !db) {
        throw new Error("Firebase not initialized.");
    }
    try {
        const sharedPromptsCol = collection(db, 'sharedPrompts');
        const newPromptRef = doc(sharedPromptsCol); // Auto-generate ID
        await setDoc(newPromptRef, {
            prompt: promptText,
            createdAt: serverTimestamp()
        });
        return newPromptRef.id;
    } catch (error) {
        console.error("Error creating shared prompt:", error);
        throw error;
    }
};

export const getSharedPrompt = async (promptId: string): Promise<string | null> => {
    if (!firebaseInitialized || !db) return null;
    try {
        const promptDocRef = doc(db, 'sharedPrompts', promptId);
        const docSnap = await getDoc(promptDocRef);
        if (docSnap.exists()) {
            return docSnap.data().prompt as string;
        }
        return null;
    } catch (error) {
        console.error("Error fetching shared prompt:", error);
        return null;
    }
};


// It's crucial to export auth this way so that other modules get the initialized instance.
export { auth, db, firebaseInitialized };