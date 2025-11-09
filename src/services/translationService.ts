import { Gender } from '@/types/vocabulary';

interface TranslationResult {
  translation: string | null;
  gender: Gender | undefined;
}

export async function translateWord(word: string, fromLanguage: string): Promise<TranslationResult> {
  
  try {
    // Make API request to Wiktionary with the exact word (no capitalization changes)
    const response = await fetch(
      `https://${fromLanguage}.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(word)}&prop=wikitext&format=json&origin=*`
    );
    
    if (!response.ok) {
      throw new Error('Could not get translation data from Wiktionary');
    }
    
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.info || 'Word not found in Wiktionary');
    }
    
    const wikitext = data.parse?.wikitext?.['*'];
    if (!wikitext) {
      throw new Error('No wikitext found for this word');
    }
    
    return extractTranslationData(wikitext, fromLanguage);
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

function extractTranslationData(wikitext: string, fromLanguage: string): TranslationResult {
  let translation: string | null = null;
  let gender: Gender | undefined = undefined;

  if (fromLanguage === 'he') {
    // Hebrew-specific parsing
    const genderMatch = wikitext.match(/\|מין=(זכר|נקבה)/);
    if (genderMatch) {
      gender = genderMatch[1] === 'זכר' ? 'm' : 'f';
    }

    const translationMatch = wikitext.match(/\*\s*אנגלית:\s*\{\{ת\|אנגלית\|([^}|]+)/);
    if (translationMatch && translationMatch[1]) {
      translation = translationMatch[1].trim();
    }
  } else if (fromLanguage === 'is') {
    // Icelandic-specific parsing
    const firstFewRows = wikitext.split('\n').slice(0, 10).join('\n');
    const genderMatch = firstFewRows.match(/\{\{(kk|kvk|hk)\.?\}\}/);
    if (genderMatch) {
      gender = genderMatch[1] === 'kk' ? 'm' : genderMatch[1] === 'kvk' ? 'f' : 'n';
    }

    const translationBlockMatch = wikitext.match(/\{\{-þýðingar-}}([\s\S]*?)\n\}\}/);
    if (translationBlockMatch) {
      const enTranslationMatch = translationBlockMatch[1].match(/\{\{þýðing\|en\|([^|}]+)/);
      if (enTranslationMatch) {
        translation = enTranslationMatch[1].trim();
      }
    }
  } else {
    // Default parsing
    const firstFewRows = wikitext.split('\n').slice(0, 5).join('\n');
    const genderMatch = firstFewRows.match(/\{\{(m|f|n)\}\}/);
    if (genderMatch && genderMatch[1]) {
      gender = genderMatch[1] as Gender;
    }

    const translationMatch = wikitext.match(/\{\{Ü\|en\|(.*?)(?:\}\}|\|)/);
    if (translationMatch && translationMatch[1]) {
      translation = translationMatch[1].trim();
    }
  }

  return { translation, gender };
}

