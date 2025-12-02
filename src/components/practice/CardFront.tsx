import React from 'react';
import { Button } from '@/components/ui/button';
import GenderTag from '@/components/GenderTag';
import { DirectionFlag } from '@/components/FlagIcon';
import { VocabWord, PracticeDirection } from '@/types/vocabulary';
import { Trash2 } from 'lucide-react';
import { speak } from '@/lib/speech';
import { useVocab } from '@/context/VocabContext';

interface CardFrontProps {
  word: VocabWord;
  direction: PracticeDirection;
  flipped: boolean;
  onDelete: () => void;
}

const CardFront: React.FC<CardFrontProps> = ({ word, direction, flipped, onDelete }) => {
  const { currentList } = useVocab();
  // For translateTo (Language to English), show language word
  // For translateFrom (English to Language), show English word
  const frontText = direction === 'translateTo' ? word.lng : word.en;

  const getLanguageCode = (lang: string) => {
    switch (lang) {
      case 'de': return 'de-DE';
      case 'he': return 'he-IL';
      case 'is': return 'is-IS';
      default: return 'en-US';
    }
  };

  return (
    <div className="text-center w-full">
      <div className="mb-2 text-muted-foreground text-sm flex items-center justify-center">
        <DirectionFlag direction={direction} size={16} />
      </div>
      <div className="flex items-center justify-center gap-2">
        <h2 className="text-2xl font-bold">{frontText}</h2>
        {direction === 'translateTo' && word.gender && (
          <GenderTag gender={word.gender} />
        )}
      </div>

      {direction === 'translateTo' && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-4"
          onClick={(e) => {
            e.stopPropagation();
            speak(word.lng, getLanguageCode(currentList?.language || 'en'));
          }}
        >
          🔊 Listen
        </Button>
      )}

      {direction === 'translateTo' && word.notes && (
        <div className="mt-4 text-sm text-muted-foreground">
          <p>{word.notes}</p>
        </div>
      )}

      <div className="mt-6 border-b border-white pb-4">
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
