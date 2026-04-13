export interface AnnotationLayer {
  amplification: string | null;
  emotion: string | null;
  loaded_language: string | null;
  hedging: string | null;
  presupposition: string | null;
  call_to_action: string | null;
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
  | { type: 'ANALYSIS_ERROR'; message: string }
  | { type: 'GET_CURRENT_STATE' };

// Snapshot of the panel state, returned by the background in response to GET_CURRENT_STATE.
// Used by the Firefox popup to hydrate its state on open.
export type BackgroundStateMessage =
  | { status: 'empty' }
  | { status: 'loading' }
  | { status: 'no_api_key' }
  | { status: 'too_long' }
  | { status: 'result'; data: AnalysisResult; originalText: string }
  | { status: 'error'; message: string };
