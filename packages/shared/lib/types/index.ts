export interface AnnotationLayer {
  appeals: string | null;
  structural: string | null;
  meaning: string | null;
}

export interface Synonym {
  word: string;
  nuance: string;
}

export interface Annotation {
  text: string;
  layers: AnnotationLayer;
  synonyms: Synonym[];
}

export interface AnalysisResult {
  is_factual: boolean;
  annotations: Annotation[];
  neutral_rewrite: string | null;
  rewrite_explanation: string | null;
  not_neutralizable_reason: string | null;
}

export type ExtensionMessage =
  | { type: 'TEXT_SELECTED'; text: string; pageTitle: string; domain: string }
  | { type: 'SELECTION_TOO_LONG' }
  | { type: 'ANALYSIS_RESULT'; payload: AnalysisResult }
  | { type: 'NO_API_KEY' }
  | { type: 'ANALYSIS_ERROR'; message: string };
