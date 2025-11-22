// src/app/actions.ts
'use server';

import { initializeFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface ProposalData {
    ownerId: string;
    favoriteMemory: string;
    personality: string;
    emotion: string;
    tone: 'Poetic' | 'Flirty' | 'Silly';
    favoriteThing: string;
    message: string;
    response: 'yes' | 'no';
}

export async function saveProposalResponse(data: ProposalData) {
  const { firestore } = initializeFirebase();
  try {
    const responseCollection = collection(firestore, 'userResponses');
    await addDoc(responseCollection, {
      ...data,
      timestamp: serverTimestamp(),
      personalityWord: data.personality,
      selectedEmoji: data.emotion,
      generatedMessage: data.message,
      proposalResponse: data.response
    });
    return { success: true };
  } catch (e) {
    console.error("Error adding document: ", e);
    return { success: false, error: (e as Error).message };
  }
}
