

export interface ScriptQuote {
  timestamp: string;
  text: string;
}

export interface ScriptStage {
  stage: string;
  purpose: string;
  quotes: ScriptQuote[];
}

export interface OutlineStage {
  stage: string;
  purpose: string;
  details: string;
}

export interface StructuredContent {
  title: string;
  description: string;
}

export interface AnalysisResult {
  keywords: string[];
  intent: StructuredContent[];
  viewPrediction: StructuredContent[];
  scriptStructure?: ScriptStage[];
}

export interface ScriptLine {
  character: string;
  line: string;
  imagePrompt: string;
  timestamp?: string;
}

export interface NewPlan {
  newIntent: StructuredContent[];
  characters?: string[];
  scriptWithCharacters?: ScriptLine[];
  scriptOutline?: OutlineStage[];
}