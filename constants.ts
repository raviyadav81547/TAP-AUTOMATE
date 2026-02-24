import { VoicePreset } from "./types";

export const VOICE_PRESETS: VoicePreset[] = [
  // US Voices
  { id: 'v1', name: 'Alpha', gender: 'Male', style: 'US Standard', baseModel: 'Puck', flag: '🇺🇸', description: 'Clear, standard American male voice.', defaultPitch: 0, defaultSpeed: 1.0 },
  { id: 'v2', name: 'Beta', gender: 'Female', style: 'US Standard', baseModel: 'Kore', flag: '🇺🇸', description: 'Clear, standard American female voice.', defaultPitch: 0, defaultSpeed: 1.0 },
  { id: 'v3', name: 'Gamma', gender: 'Male', style: 'US Deep', baseModel: 'Charon', flag: '🇺🇸', description: 'Deep, resonant male voice for storytelling.', defaultPitch: -50, defaultSpeed: 0.95 },
  { id: 'v4', name: 'Delta', gender: 'Male', style: 'US Intense', baseModel: 'Fenrir', flag: '🇺🇸', description: 'Intense, energetic male voice.', defaultPitch: 0, defaultSpeed: 1.1 },
  { id: 'v5', name: 'Epsilon', gender: 'Female', style: 'US Soft', baseModel: 'Aoede', flag: '🇺🇸', description: 'Soft, soothing female voice.', defaultPitch: 0, defaultSpeed: 0.95 },
  
  // Indian Personas (Simulated via Style + Settings)
  { id: 'v6', name: 'Aarav', gender: 'Male', style: 'Indian Professional', baseModel: 'Puck', flag: '🇮🇳', description: 'Professional Indian-English male persona.', defaultPitch: 50, defaultSpeed: 1.05 },
  { id: 'v7', name: 'Priya', gender: 'Female', style: 'Indian Soft', baseModel: 'Aoede', flag: '🇮🇳', description: 'Soft and polite Indian-English female persona.', defaultPitch: 100, defaultSpeed: 0.95 },
  { id: 'v8', name: 'Rohan', gender: 'Male', style: 'Indian News', baseModel: 'Fenrir', flag: '🇮🇳', description: 'Fast-paced Indian news anchor.', defaultPitch: 0, defaultSpeed: 1.15 },
  { id: 'v9', name: 'Ananya', gender: 'Female', style: 'Indian Formal', baseModel: 'Kore', flag: '🇮🇳', description: 'Formal Indian corporate persona.', defaultPitch: 50, defaultSpeed: 1.0 },
  { id: 'v10', name: 'Vihaan', gender: 'Male', style: 'Indian Casual', baseModel: 'Charon', flag: '🇮🇳', description: 'Casual, deep Indian male voice.', defaultPitch: -20, defaultSpeed: 1.0 },

  // British / International Styles
  { id: 'v11', name: 'Arthur', gender: 'Male', style: 'British Elegant', baseModel: 'Charon', flag: '🇬🇧', description: 'Sophisticated British-style male.', defaultPitch: 0, defaultSpeed: 0.9 },
  { id: 'v12', name: 'Victoria', gender: 'Female', style: 'British Prime', baseModel: 'Kore', flag: '🇬🇧', description: 'Sharp, prime-time British female anchor.', defaultPitch: 150, defaultSpeed: 1.0 },
  
  // Thematic Voices
  { id: 'v13', name: 'Newsman', gender: 'Male', style: 'Broadcast Fast', baseModel: 'Fenrir', flag: '🎙️', description: 'Classic fast-talking newsman.', defaultPitch: -50, defaultSpeed: 1.2 },
  { id: 'v14', name: 'Newswoman', gender: 'Female', style: 'Broadcast Fast', baseModel: 'Kore', flag: '🎙️', description: 'Energetic daily update host.', defaultPitch: 50, defaultSpeed: 1.2 },
  { id: 'v15', name: 'Storyteller M', gender: 'Male', style: 'Narrative', baseModel: 'Charon', flag: '📖', description: 'Slow, engaging storytelling voice.', defaultPitch: -100, defaultSpeed: 0.85 },
  { id: 'v16', name: 'Storyteller F', gender: 'Female', style: 'Narrative', baseModel: 'Aoede', flag: '📖', description: 'Dreamy, audiobook style.', defaultPitch: -50, defaultSpeed: 0.9 },
  
  // Tech / Modern
  { id: 'v17', name: 'Cyber M', gender: 'Male', style: 'Robotic', baseModel: 'Puck', flag: '🤖', description: 'Precise, slightly processed male tone.', defaultPitch: -200, defaultSpeed: 1.1 },
  { id: 'v18', name: 'Cyber F', gender: 'Female', style: 'AI Assistant', baseModel: 'Kore', flag: '🤖', description: 'Helpful AI assistant tone.', defaultPitch: 200, defaultSpeed: 1.05 },
  { id: 'v19', name: 'Zen', gender: 'Male', style: 'Meditative', baseModel: 'Charon', flag: '🧘', description: 'Ultra-low, slow meditative guide.', defaultPitch: -300, defaultSpeed: 0.75 },
  { id: 'v20', name: 'Breeze', gender: 'Female', style: 'Whisper', baseModel: 'Aoede', flag: '🍃', description: 'Light, airy, whisper-like tone.', defaultPitch: 100, defaultSpeed: 0.8 },
];