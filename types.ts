
export enum AppState {
  IDLE = 'IDLE',
  SUMMARIZING = 'SUMMARIZING',
  REVIEW = 'REVIEW',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  PLAYING = 'PLAYING',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}

export interface Article {
  id: string;
  title: string;
  content: string;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

export type VoiceGender = 'Male' | 'Female';
export type Language = 'English' | 'Hindi' | 'Spanish' | 'French' | 'German' | 'Hinglish';
export type AIModel = 'gemini-2.5-flash' | 'gemini-3-pro-preview';

export interface AudioSettings {
  speed: number;
  pitch: number;
}

export interface VoicePreset {
  id: string;
  name: string;
  gender: VoiceGender;
  style: string;
  baseModel: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoede';
  flag: string;
  description: string;
  defaultPitch: number;
  defaultSpeed: number;
  isCustom?: boolean;
  isHidden?: boolean; // Admin can hide voices
}
