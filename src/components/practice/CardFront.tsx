
import React from 'react';
import { Button } from '@/components/ui/button';
import GenderTag from '@/components/GenderTag';
import { DirectionFlag } from '@/components/FlagIcon';
import { VocabWord, PracticeDirection } from '@/types/vocabulary';

interface CardFrontProps {
  word: VocabWord;
  direction: PracticeDirection;
  flipped: boolean;
}

const CardFront: React.FC<CardFrontProps> = ({ word, direction, flipped }) => {
  const frontText = direction === 'germanToEnglish' ? word.german : word.english;
  
  const speak = (text: string, lang: 'de-DE' | 'en-US') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };
  
  return (
    <div className="text-center">
      <div className="mb-2 text-muted-foreground text-sm flex items-center justify-center">
        <DirectionFlag direction={direction} size={25} />
      </div>
      <div className="flex items-center justify-center gap-2">
        <h2 className="text-2xl font-bold">{frontText}</h2>
        {direction === 'germanToEnglish' && word.gender && (
          <GenderTag gender={word.gender} />
        )}
      </div>

      {direction === 'germanToEnglish' && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={(e) => {
            e.stopPropagation();
            speak(word.german, 'de-DE');
          }}
        >
          🔊 Listen
        </Button>
      )}
    </div>
  );
};

export default CardFront;
