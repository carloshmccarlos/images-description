export interface VocabularyItem {
  word: string;
  translation: string;
  pronunciation: string;
  exampleSentence: string;
  category?: string;
}

export interface AnalysisSummary {
  id: string;
  imageUrl: string;
  description: string;
  vocabulary: VocabularyItem[];
  createdAt: Date;
}

export interface AnalysisDetail extends AnalysisSummary {
  descriptionNative: string | null;
  learningLanguage: string | null;
  motherLanguage: string | null;
  descriptionAudioUrl: string | null;
  descriptionNativeAudioUrl: string | null;
}

export interface AnalysisTaskDetail {
  id: string;
  status: string;
  imageUrl: string | null;
  description: string | null;
  vocabulary: VocabularyItem[] | null;
  savedAnalysisId: string | null;
  errorMessage: string | null;
}
