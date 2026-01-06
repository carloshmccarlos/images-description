import { SUPPORTED_LANGUAGES } from '@/lib/constants';

function getLanguageName(code: string): string {
  return SUPPORTED_LANGUAGES.find((l) => l.code === code)?.name ?? code;
}

export function createAnalysisPrompt(
  learningLanguage: string,
  motherLanguage: string,
  proficiencyLevel: string
): string {
  const targetLang = getLanguageName(learningLanguage);
  const nativeLang = getLanguageName(motherLanguage);

  const levelGuidanceMap: Record<string, string> = {
    beginner: 'Use simple vocabulary and short sentences. Focus on common, everyday words.',
    intermediate: 'Use moderate vocabulary with some complex sentences. Include useful phrases.',
    advanced: 'Use rich vocabulary including idioms and nuanced expressions.',
  };
  const levelGuidance = levelGuidanceMap[proficiencyLevel] || levelGuidanceMap.beginner;

  return `You are a language learning assistant. Analyze this image and help the user learn ${targetLang}.

INSTRUCTIONS:
1. Write a detailed description of the image in ${targetLang}
2. Extract 5-15 vocabulary words from objects/concepts visible in the image
3. ${levelGuidance}

For each vocabulary word, provide:
- The word in ${targetLang}
- Translation in ${nativeLang}
- Pronunciation guide (phonetic)
- An example sentence in ${targetLang}
- Category (noun, verb, adjective, etc.)

RESPOND IN THIS EXACT JSON FORMAT:
{
  "description": "Description in ${targetLang}",
  "vocabulary": [
    {
      "word": "word in ${targetLang}",
      "translation": "translation in ${nativeLang}",
      "pronunciation": "phonetic pronunciation",
      "exampleSentence": "example sentence in ${targetLang}",
      "category": "noun/verb/adjective/etc"
    }
  ]
}

Only respond with valid JSON, no additional text.`;
}
