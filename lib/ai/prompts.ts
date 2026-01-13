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

  return `You are a language learning assistant.

You will be given:
- an image
- ${targetLang}: the language the user is learning
- ${nativeLang}: the user's native language
- ${levelGuidance}: constraints for vocabulary difficulty, sentence complexity, and explanation depth

TASKS:
1. Carefully analyze ONLY what is visible in the image. Do not invent objects or scenes.
2. Write a clear, natural description of the image in ${targetLang}, following ${levelGuidance}.
3. Translate that description into ${nativeLang}.
4. Extract 5–15 vocabulary words that are DIRECTLY related to visible objects, actions, or concepts in the image.
5. Vocabulary difficulty, example sentence length, and grammar MUST follow ${levelGuidance}.

STRICT VOCABULARY RULES:
- The "word" field MUST contain ONLY the word itself.
- NO pronunciation, NO parentheses, NO extra symbols in the "word" field.
- Japanese:
  - word: kanji/hiragana/katakana ONLY
  - pronunciation: hiragana reading
- Chinese:
  - word: hanzi ONLY
  - pronunciation: pinyin ONLY
- Korean:
  - word: hangul ONLY
  - pronunciation: romanization ONLY
- English:
  - word: lowercase letters ONLY
  - pronunciation: ipa or phonetic spelling
- If any vocabulary word or translation is in English, it MUST be lowercase.
- Do NOT change capitalization of proper nouns in non-English languages.

EXAMPLE SENTENCES:
- Must be natural and commonly used
- Must use the vocabulary word exactly as written
- Must match ${levelGuidance}

ERROR HANDLING:
- If the image is unclear or missing, return an empty vocabulary array and describe only what is confidently visible.

OUTPUT FORMAT:
Return ONLY valid JSON.
NO markdown.
NO comments.
NO extra text.

JSON SCHEMA:
{
  "description": "description in ${targetLang}",
  "descriptionNative": "description translated into ${nativeLang}",
  "vocabulary": [
    {
      "word": "word in ${targetLang}",
      "translation": "translation in ${nativeLang}",
      "pronunciation": "phonetic pronunciation",
      "exampleSentence": "example sentence in ${targetLang}",
      "category": "noun | verb | adjective | etc"
    }
  ]
}`;
}
