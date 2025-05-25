import React from 'react';
import { Button } from '@/components/ui/button';
import GenderTag from '@/components/GenderTag';
import { DirectionFlag } from '@/components/FlagIcon';
import { VocabWord, PracticeDirection } from '@/types/vocabulary';
import { Trash2 } from 'lucide-react';

interface CardFrontProps {
  word: VocabWord;
  direction: PracticeDirection;
  flipped: boolean;
  onDelete: () => void;
}

const CardFront: React.FC<CardFrontProps> = ({ word, direction, flipped, onDelete }) => {
  const frontText = direction === 'germanToEnglish' ? word.german : word.english;
  
  const speak = (text: string, lang: 'de-DE' | 'en-US') => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      window.speechSynthesis.speak(utterance);
    }
  };
  
  return (
    <div className="text-center w-full">
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
      
      <div className="mt-6 border-b pb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 hover:text-destructive" 
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CardFront;
