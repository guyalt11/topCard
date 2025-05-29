export const speak = (text: string, lang: 'de-DE' | 'en-US' | 'he-IL' | 'is-IS') => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  }
}; 