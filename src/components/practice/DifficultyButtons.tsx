
import React from 'react';
import { Button } from '@/components/ui/button';
import { VocabWord, DifficultyLevel, PracticeDirection } from '@/types/vocabulary';
import { useReviewTime } from '@/hooks/useReviewTime';

interface DifficultyButtonsProps {
  word: VocabWord;
  direction: PracticeDirection;
  onSelectDifficulty: (difficulty: DifficultyLevel) => void;
}

const DifficultyButtons: React.FC<DifficultyButtonsProps> = ({
  word,
  direction,
  onSelectDifficulty
}) => {
  const { getReviewTimeEstimate } = useReviewTime();
  
  return (
    <div className="flex justify-between w-full gap-2">
      <Button
        className="flex-1 bg-difficulty-hard hover:bg-difficulty-hard/80"
        onClick={() => onSelectDifficulty('hard')}
        title="Next review in 1 minute"
      >
        Hard<br />(1m)
      </Button>
      <Button
        className="flex-1 bg-difficulty-ok hover:bg-difficulty-ok/80 text-black"
        onClick={() => onSelectDifficulty('ok')}
        title={`Next review in ${getReviewTimeEstimate(word, 'ok', direction)}`}
      >
        OK<br />({getReviewTimeEstimate(word, 'ok', direction)})
      </Button>
      <Button
        className="flex-1 bg-difficulty-good hover:bg-difficulty-good/80"
        onClick={() => onSelectDifficulty('good')}
        title={`Next review in ${getReviewTimeEstimate(word, 'good', direction)}`}
      >
        Good<br />({getReviewTimeEstimate(word, 'good', direction)})
      </Button>
      <Button
        className="flex-1 bg-difficulty-perfect hover:bg-difficulty-perfect/80 text-black"
        onClick={() => onSelectDifficulty('perfect')}
        title={`Next review in ${getReviewTimeEstimate(word, 'perfect', direction)}`}
      >
        Perfect<br />({getReviewTimeEstimate(word, 'perfect', direction)})
      </Button>
    </div>
  );
};

export default DifficultyButtons;
