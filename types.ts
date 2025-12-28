import React from 'react';

export type View = 'home' | 'signin' | 'signup' | 'hub-choice' | 'create-hub' | 'join-hub' | 'dashboard';

/**
 * Represents the visual theme of the application.
 */
export type Theme = 'light' | 'dark';

export interface User {
  name: string;
  email: string;
}

export interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  step: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  reminderTime: string;
  status: 'taken' | 'pending' | 'missed';
  hubId: string;
  lastTakenDate: string; // YYYY-MM-DD
  imageUrl?: string;
}