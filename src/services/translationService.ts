
import { Gender } from '@/types/vocabulary';

interface TranslationResult {
  translation: string | null;
  gender: Gender | undefined;
}

export async function translateGermanWord(word: string): Promise<TranslationResult> {
  console.log(`Attempting to translate: "${word}"`);
  
  try {
    // Make API request to Wiktionary with the exact word (no capitalization changes)
    const response = await fetch(
      `https://de.wiktionary.org/w/api.php?action=parse&page=${encodeURIComponent(word)}&prop=wikitext&format=json&origin=*`
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
    
    return extractTranslationData(wikitext);
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

function extractTranslationData(wikitext: string): TranslationResult {
  console.log("Raw wikitext length:", wikitext.length);
  
  let translation: string | null = null;
  let gender: Gender | undefined = undefined;
  
  // Look for gender markers but ONLY in the first 5 rows
  const firstFewRows = wikitext.split('\n').slice(0, 5).join('\n');
  const genderMatch = firstFewRows.match(/\{\{(m|f|n)\}\}/);
  if (genderMatch && genderMatch[1]) {
    gender = genderMatch[1] as Gender;
    console.log("Extracted gender:", gender);
  }
  
  // Look for the first {{Ü|en|...}} pattern
  const translationMatch = wikitext.match(/\{\{Ü\|en\|(.*?)(?:\}\}|\|)/);
  if (translationMatch && translationMatch[1]) {
    translation = translationMatch[1].trim();
    console.log("Found translation:", translation);
    return { translation, gender };
  }
  
  console.log("No translation found");
  return { translation, gender };
}
