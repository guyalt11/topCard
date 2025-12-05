import React from 'react';
import { Button } from '@/components/ui/button';
import GenderTag from '@/components/GenderTag';
import { DirectionFlag } from '@/components/FlagIcon';
import { VocabWord, PracticeDirection } from '@/types/vocabulary';
import { speak } from '@/lib/speech';
import { useVocab } from '@/context/VocabContext';

interface CardBackProps {
  word: VocabWord;
  direction: PracticeDirection;
  language?: string;
  target?: string;
}

const CardBack: React.FC<CardBackProps> = ({ word, direction, language, target }) => {
  const { currentList } = useVocab();
  // For translateTo (Language to English), show English word
  // For translateFrom (English to Language), show language word
  const backText = direction === 'translateTo' ? word.transl : word.origin;
  const showGender = direction === 'translateFrom' && word.gender;

  const getLanguageCode = (lang: string) => {
    switch (lang) {
      case 'de': return 'de-DE';
      case 'he': return 'he-IL';
      case 'is': return 'is-IS';
      default: return 'en-US';
    }
  };

  return (
    <div className="text-center mt-6 pt-4 w-full">
      <div className="mb-2 text-tertiary-foreground text-sm flex items-center justify-center">
        <DirectionFlag direction={direction === 'translateTo' ? 'translateFrom' : 'translateTo'} size={16} language={language} target={target} />
      </div>
      <div className="flex items-center justify-center gap-2">
        <h3 className="text-xl font-semibold">{backText}</h3>
        {showGender && <GenderTag gender={word.gender!} />}
      </div>

      {direction === 'translateFrom' && (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={(e) => {
            e.stopPropagation();
            speak(word.origin, getLanguageCode(currentList?.language || 'en'));
          }}
        >
          🔊 Listen
        </Button>
      )}

      {direction === 'translateFrom' && word.notes && (
        <div className="mt-4 text-sm text-tertiary-foreground">
          <p>{word.notes}</p>
        </div>
      )}
    </div>
  );
};

export default CardBack;
