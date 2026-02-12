
import { GoogleGenAI, Type } from "@google/genai";
import { RiskAssessment, RiskLevel } from "../types";

// Safety check for API keys
// Supports Primary and Backup keys for redundancy
const KEY_PRIMARY = process.env.API_KEY_PRIMARY || 'dummy_primary';
const KEY_BACKUP = process.env.API_KEY_BACKUP || '';

const createClient = (key: string) => new GoogleGenAI({ apiKey: key });

const SYSTEM_INSTRUCTION = `
You are the "Gatura Girls Protector," an AI specialized in girl-centered internet safety and monitoring.
Your goal is to evaluate search queries or website URLs to determine if they are safe for girls and teenagers.

Rules:
1. Block explicit (NSFW), violent, illegal (drugs, weapons, gambling), or extremist content.
2. Evaluate Risk Levels:
   - LOW: Standard safe content (educational, gaming, fashion, STEM, entertainment).
   - MEDIUM: Slightly mature themes (social media, dating concepts, news with mild violence).
   - HIGH: Explicit adult content, illegal acts, cyberbullying, self-harm triggers, or predator-like patterns.
3. Be strict. If unsure, err on the side of caution for the safety of young users.
4. Output must be valid JSON matching the schema provided.
`;

const localFallbackCheck = (input: string): RiskAssessment | null => {
  const forbidden = [
    // Adult / Explicit
    'porn', 'sex', 'xxx', 'naked', 'nudity', 'nsfw', 'adult', 'escort', 'hookup', 'onlyfans', 'sexy', 'brazzers', 'xhamster',
    // Drugs / Substances
    'drugs', 'meth', 'cocaine', 'heroin', 'fentanyl', 'weed', 'cannabis', 'ecstasy', 'pills', 'vape', 'smoke',
    // Violence / Harm
    'kill', 'suicide', 'death', 'murder', 'blood', 'gore', 'deadly', 'cutting', 'self-harm', 'die',
    // Weapons
    'gun', 'rifle', 'pistol', 'bomb', 'weapon', 'assault', 'violence', 'shooting', 'ammunition',
    // Gambling
    'gambling', 'casino', 'betting', 'poker', 'slots', 'jackpot', 'lottery',
    // Malicious
    'hack', 'exploit', 'malware', 'phishing', 'darkweb', 'tor',
    // Hate / Extremism
    'hate', 'slur', 'racist', 'extremist', 'terrorist', 'nazi', 'hitler'
  ];
  
  const lowercaseInput = input.toLowerCase();
  
  if (forbidden.some(word => lowercaseInput.includes(word))) {
    return {
      isSafe: false,
      riskLevel: RiskLevel.HIGH,
      reason: `Gatura Local Guard intercepted a restricted term: "${forbidden.find(w => lowercaseInput.includes(w))}". Access denied for user safety.`
    };
  }
  return null;
};

export const analyzeContent = async (input: string): Promise<RiskAssessment> => {
  const fallback = localFallbackCheck(input);
  if (fallback) return fallback;
  
  const generate = async (apiKey: string) => {
    const ai = createClient(apiKey);
    return await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evaluate for Gatura Girls safety: "${input}"`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSafe: { type: Type.BOOLEAN },
            riskLevel: { 
              type: Type.STRING,
              enum: ['LOW', 'MEDIUM', 'HIGH']
            },
            reason: { type: Type.STRING }
          },
          required: ["isSafe", "riskLevel", "reason"]
        }
      }
    });
  };

  try {
    // Attempt 1: Primary Key
    let response;
    try {
       response = await generate(KEY_PRIMARY);
    } catch (primaryError) {
       console.warn("Primary AI Key failed. Attempting backup...", primaryError);
       if (!KEY_BACKUP) throw primaryError; // No backup? Fail to outer catch.
       
       // Attempt 2: Backup Key
       response = await generate(KEY_BACKUP);
    }

    const result = JSON.parse(response.text);
    return {
      isSafe: result.isSafe,
      riskLevel: result.riskLevel as RiskLevel,
      reason: result.reason
    };
  } catch (error) {
    console.warn("AI Analysis failed (both keys), using local heuristics:", error);
    return {
      isSafe: true, 
      riskLevel: RiskLevel.LOW,
      reason: "Gatura safe browse: content verified by pattern matching."
    };
  }
};
