
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum SophisticationLevel {
  ELEMENTARY = 'ELEMENTARY',
  ADOLESCENT = 'ADOLESCENT',
  ACADEMIC = 'ACADEMIC'
}

export type AppTheme = 'standard' | 'glass-light' | 'glass-dark';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface Activity {
  id: string;
  timestamp: number;
  type: 'search' | 'visit';
  content: string;
  riskLevel: RiskLevel;
  sophistication: SophisticationLevel;
  status: 'allowed' | 'blocked' | 'guided';
  reason: string;
}

export interface RiskAssessment {
  isSafe: boolean;
  riskLevel: RiskLevel;
  sophistication: SophisticationLevel;
  reason: string;
  guideSummary?: string;
  searchResults: SearchResult[];
}

export interface AlertSettings {
  minRiskLevel: RiskLevel;
  soundEnabled: boolean;
  smsEnabled: boolean;
  phoneNumber: string;
  theme: AppTheme;
}

export interface AlertLog {
  id: string;
  timestamp: number;
  message: string;
  method: 'APP' | 'SMS' | 'SOUND';
  riskLevel: RiskLevel;
}

export type ViewMode = 'browser' | 'parent';

export interface WidgetData {
  weather: { temp: number; condition: string; city: string };
  crypto: { btc: string; eth: string; sol: string };
  football: { team: string; pos: number; pts: number }[];
}
