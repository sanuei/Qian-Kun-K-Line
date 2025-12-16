export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export type Language = 'zh-CN' | 'zh-TW';

export interface UserInput {
  name: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  birthPlace: string;
}

export interface CandleData {
  year: number;
  age: number;
  open: number;
  close: number;
  high: number;
  low: number;
  score: number;
  isTurningPoint: boolean;
  ganZhi: string;
}

export interface AnalysisResult {
  overallDestiny: string;
  turningPoints: {
    age: number;
    year: number;
    description: string;
    type: 'BULL' | 'BEAR' | 'VOLATILE';
  }[];
  financialAdvice: string;
  luckyAssets: {
    stock: { symbol: string; name: string; reason: string };
    crypto: { symbol: string; name: string; reason: string };
  };
}

export interface UsageState {
  count: number;
  isActivated: boolean;
  extraTrials: number; // Number of trials earned by sharing
}

export interface ActivationCode {
  code: string;
  isUsed: boolean;
  generatedAt: number;
}
