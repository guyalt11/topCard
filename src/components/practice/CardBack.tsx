
import React from 'react';
import { Button } from '@/components/ui/button';
import GenderTag from '@/components/GenderTag';
import { DirectionFlag } from '@/components/FlagIcon';
import { VocabWord, PracticeDirection } from '@/types/vocabulary';

interface CardBackProps {
  word: VocabWord;
  direction: PracticeDirection;
}

const CardBack: React.FC<CardBackProps> = ({ word, direction }) => {
  const backText = direction === 'germanToEnglish' ? word.english : word.german;
  const showGender = direction === 'englishToGerman' && word.gender;
  
  const speak = (text: string, lang: 'de-DE' | 'en-US') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };
  
  return (
    <div className="text-center mt-8 pt-4 border-t w-full">
      <div className="mb-2 text-muted-foreground text-sm flex items-center justify-center">
        <DirectionFlag direction={direction === 'germanToEnglish' ? 'englishToGerman' : 'germanToEnglish'} size={20} />
      </div>
      <div className="flex items-center justify-center gap-2">
        <h3 className="text-xl font-semibold">{backText}</h3>
        {showGender && <GenderTag gender={word.gender!} />}
      </div>
      
      {direction === 'englishToGerman' && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={(e) => {
            e.stopPropagation();
            speak(word.german, 'de-DE');
          }}
        >
          Listen
        </Button>
      )}
    </div>
  );
};

export default CardBack;
