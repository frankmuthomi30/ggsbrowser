
import { GoogleGenAI, Type } from "@google/genai";
import { RiskAssessment, RiskLevel } from "../types";

// Safety check for API keys
// Supports Primary and Backup keys for redundancy
const KEY_PRIMARY = process.env.API_KEY_PRIMARY || 'dummy_primary';
const KEY_BACKUP = process.env.API_KEY_BACKUP || '';

const createClient = (key: string) => new GoogleGenAI({ apiKey: key });

const SYSTEM_INSTRUCTION = `
You are "Gatura," an adaptive AI guide for girls. Your job is NOT just to block, but to analyze INTENT, COGNITIVE COMPLEXITY, and PROVIDE USEFUL INFORMATION.

Your tasks:
1. **Safety Filter**:
   - Block explicit/harmful content immediately (High Risk).
   - If a query is mature but potentially educational (e.g., "taxes", "biology"), allow it but classify as "Academic".

2. **Cognitive Analysis**:
   - "ELEMENTARY": Simple phrasing, kid-focused topics (e.g., "games", "cartoons").
   - "ADOLESCENT": Teen social topics, slang, general knowledge.
   - "ACADEMIC": Complex queries, technical terms, specific research (e.g., "quantum physics", "taxes").

3. **Useful Search Results**:
   - IF SAFE: Generate 4-6 detailed, realistic search results that genuinely answer the query. 
   - Use the token limit to generate USEFUL summaries in the 'snippet'.
   - 'title': Clear, relevant title.
   - 'url': Plausible fake or real URL (e.g., www.nationalgeographic.com/...).
   - 'snippet': A rich, informative 2-3 sentence summary of the content found at that "link".
   - 'source': The trusted source name (e.g., "Wikipedia", "Healthline", "NASA", "Study.com").

4. **Output Format**:
   - JSON format required.
   - "isSafe": boolean.
   - "riskLevel": LOW, MEDIUM, or HIGH.
   - "sophistication": ELEMENTARY, ADOLESCENT, or ACADEMIC.
   - "reason": A brief explanation of the intent.
   - "guideSummary": If the topic is complex (ACADEMIC) or sensitive, write a 2-sentence "Explain Like I'm a Teen" summary. Otherwise, leave empty string.
   - "searchResults": Array of { title, url, snippet, source }.
`;

const localFallbackCheck = (input: string): RiskAssessment | null => {
  const forbidden = [
    // --- ADULT & EXPLICIT CONTENT ---
    'porn', 'sex', 'xxx', 'naked', 'nudity', 'nsfw', 'adult', 'escort', 'hookup', 'onlyfans', 'sexy', 
    'brazzers', 'xhamster', 'pornhub', ' hentai', 'erotic', 'incest', 'masturbat', 'orgasm', 'penis', 
    'vagina', 'dick', 'cock', 'pussy', 'boobs', 'tits', 'anal', 'oral', 'bdsm', 'fetish', 'kink', 
    'camgirl', 'strip', 'nude', 'seduce', 'fuck', 'shit', 'bitch', 'whore', 'slut', 'milf', 'dilf', 
    'chaturbate', 'omegle', 'redtube', 'youporn', 'xvideos', 'rule34',

    // --- DRUGS & SUBSTANCES ---
    'drugs', 'meth', 'cocaine', 'heroin', 'fentanyl', 'weed', 'cannabis', 'ecstasy', 'pills', 'vape', 
    'smoke', 'marijuana', 'lsd', 'acid', 'shrooms', 'psilocybin', 'mdma', 'molly', 'opioid', 'narcotic', 
    'dealer', 'stoned', 'high', 'tripping', 'syringe', 'crack', 'ketamine', 'roofies',

    // --- VIOLENCE & GORE ---
    'kill', 'suicide', 'death', 'murder', 'blood', 'gore', 'deadly', 'cutting', 'self-harm', 'die', 
    'torture', 'execution', 'beheading', 'dismember', 'mutilat', 'stab', 'shoot', 'corpse', 'necro', 
    'snuff', 'massacre', 'genocide', 'assassinat',

    // --- SELF-HARM & EATING DISORDERS ---
    'thinspo', 'pro-ana', 'pro-mia', 'anorexia', 'bulimia', 'starve', 'purge', 'binge', 'bonespo', 
    'cutting', 'razor', 'hang', 'overdose',

    // --- WEAPONS & CRIME ---
    'gun', 'rifle', 'pistol', 'bomb', 'weapon', 'assault', 'violence', 'shooting', 'ammunition', 
    'knife', 'sword', 'explosive', 'grenade', 'terror', 'ar-15', 'glock', 'ammo', 'firearm', 
    'shoplift', 'steal', 'robbery', 'illegal',

    // --- GAMBLING & SCAMS ---
    'gambling', 'casino', 'betting', 'poker', 'slots', 'jackpot', 'lottery', 'roulette', 'blackjack', 
    'scam', 'fraud', 'bank', 'credit card',

    // --- MALICIOUS & DARK WEB ---
    'hack', 'exploit', 'malware', 'phishing', 'darkweb', 'tor', 'onion', 'proxy', 'vpn', 'bypass', 
    'virus', 'trojan', 'spyware', 'ransomware', 'keylogger',

    // --- HATE SPEECH & EXTREMISM ---
    'hate', 'slur', 'racist', 'extremist', 'terrorist', 'nazi', 'hitler', 'supremacist', 'kkk', 
    'bigot', 'radical', 'faggot', 'nigger', 'dyke', 'retard', 'spic', 'chink', 'kike' 
  ];
  
  const lowercaseInput = input.toLowerCase();
  
  // Use word boundaries to avoid false positives (e.g., "analysis" containing "anal")
  const matchedTerm = forbidden.find(word => {
    // Create a regex with word boundaries for each forbidden term
    // Escape special regex characters in the word just in case
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedWord}\\b`, 'i');
    return regex.test(lowercaseInput);
  });
  
  if (matchedTerm) {
    return {
      isSafe: false,
      riskLevel: RiskLevel.HIGH,
      sophistication: 'ADOLESCENT' as any, // Default assumption for blocked terms
      reason: `Gatura Local Guard intercepted a restricted term: "${matchedTerm}". Access denied for user safety.`,
      guideSummary: '',
      searchResults: []
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
            sophistication: {
              type: Type.STRING,
              enum: ['ELEMENTARY', 'ADOLESCENT', 'ACADEMIC']
            },
            reason: { type: Type.STRING },
            guideSummary: { type: Type.STRING },
            searchResults: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING },
                  snippet: { type: Type.STRING },
                  source: { type: Type.STRING }
                },
                required: ["title", "url", "snippet", "source"]
              }
            }
          },
          required: ["isSafe", "riskLevel", "reason", "sophistication", "searchResults"]
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
      sophistication: result.sophistication as any,
      reason: result.reason,
      guideSummary: result.guideSummary,
      searchResults: result.searchResults || []
    };
  } catch (error) {
    console.warn("AI Analysis failed (both keys), using local heuristics:", error);
    return {
      isSafe: true, 
      riskLevel: RiskLevel.LOW,
      sophistication: 'ELEMENTARY' as any,
      reason: "Gatura safe browse: content verified by pattern matching.",
      guideSummary: "We couldn't reach the AI guide, but this looks safe.",
      searchResults: []
    };
  }
};
