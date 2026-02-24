import { GoogleGenAI, Modality } from "@google/genai";
import { decodeBase64, decodeAudioData } from "../utils/audioUtils";
import { Language, VoicePreset, AIModel } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const summarizeArticles = async (
  text: string, 
  language: Language, 
  voiceStyle: string = 'US Standard',
  modelId: AIModel = 'gemini-2.5-flash'
): Promise<string> => {
  try {
    let instruction = "Write the summary in English.";
    let style = "Use a professional, engaging news anchor tone.";

    // Logic to adapt writing style to the selected Voice Persona
    const isIndianPersona = voiceStyle.includes('Indian');

    switch (language) {
      case 'Hindi':
        instruction = "Write the summary completely in Hindi (Devanagari script).";
        style = "Use a formal yet engaging Hindi news anchor tone (Namaskar style).";
        break;
      case 'Hinglish':
        instruction = "Write the summary in Hinglish (blend of Hindi and English, written in Latin script).";
        style = "Use a casual, conversational Indian podcaster tone.";
        break;
      case 'Spanish':
        instruction = "Write the summary in Spanish.";
        style = "Use a dynamic and clear news anchor tone typical of Spanish broadcasts.";
        break;
      case 'French':
        instruction = "Write the summary in French.";
        style = "Use a sophisticated and articulate French news anchor tone.";
        break;
      case 'German':
        instruction = "Write the summary in German.";
        style = "Use a precise and professional German news anchor tone (Tagesschau style).";
        break;
      case 'English':
      default:
        if (isIndianPersona) {
            instruction = "Write the summary in Indian English.";
            style = "Use professional Indian English vocabulary (e.g., 'centre', 'programme') and a polite, formal tone.";
        } else {
            instruction = "Write the summary in US English.";
        }
        break;
    }

    const prompt = `
      You are a professional news anchor for a daily podcast called "Daily Spark".
      
      Task: Summarize the following text into a cohesive, spoken-word script.
      
      Directives:
      1. Language: ${instruction}
      2. Tone: ${style}
      3. Structure: Start with a brief welcome. Smoothly transition between topics. End with a sign-off.
      4. Length: Keep it concise (approx. 2-3 minutes of reading time).
      5. Formatting: Do NOT use markdown (bold, italics). Output plain text only.
      
      Input Text:
      ${text}
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text || "Sorry, I couldn't generate a summary.";
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string, voiceName: string, audioContext: AudioContext): Promise<AudioBuffer> => {
  try {
    const modelId = "gemini-2.5-flash-preview-tts";
    
    // Ensure clean input for TTS (remove heavy markdown if present, though direct read usually sends raw text)
    const cleanText = text.replace(/\*\*/g, '').replace(/###/g, '');

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [{ parts: [{ text: cleanText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName }, 
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data returned from Gemini.");
    }

    const rawBytes = decodeBase64(base64Audio);
    
    // Gemini TTS output sample rate is typically 24000Hz
    const audioBuffer = await decodeAudioData(rawBytes, audioContext, 24000, 1);
    
    return audioBuffer;
  } catch (error) {
    console.error("Error generating speech:", error);
    throw error;
  }
};

export const generateVoicePreview = async (preset: VoicePreset, audioContext: AudioContext): Promise<AudioBuffer> => {
    let text = "This is a preview of your broadcast voice.";
    if (preset.style.includes('Indian')) text = "Hello, this is a preview of my voice for your broadcast."; // Indian English nuance
    
    return generateSpeech(text, preset.baseModel, audioContext);
}

export const generateCoverImage = async (summaryText: string): Promise<string | null> => {
  try {
    // Generate a prompt for the image based on the summary
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Create a professional, abstract, neon-style podcast cover art that represents these topics: ${summaryText.substring(0, 200)}. 
            Style: Minimalist, Cyberpunk, High Quality, 4k. No Text.`
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating cover image:", error);
    return null;
  }
}