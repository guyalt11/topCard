
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
        className="flex-1 bg-difficulty-hard hover:bg-difficulty-hard/80 text-center min-w-0"
        onClick={() => onSelectDifficulty('hard')}
        title="Next review in 1 minute"
      >
        <div className="flex flex-col items-center">
          <span className="block truncate">Hard</span>
          <span className="block truncate">(1m)</span>
        </div>
      </Button>
      <Button
        className="flex-1 bg-difficulty-ok hover:bg-difficulty-ok/80 text-black text-center min-w-0"
        onClick={() => onSelectDifficulty('ok')}
        title={`Next review in ${getReviewTimeEstimate(word, 'ok', direction)}`}
      >
        <div className="flex flex-col items-center">
          <span className="block truncate">OK</span>
          <span className="block truncate">({getReviewTimeEstimate(word, 'ok', direction)})</span>
        </div>
      </Button>
      <Button
        className="flex-1 bg-difficulty-good hover:bg-difficulty-good/80 text-center min-w-0"
        onClick={() => onSelectDifficulty('good')}
        title={`Next review in ${getReviewTimeEstimate(word, 'good', direction)}`}
      >
        <div className="flex flex-col items-center">
          <span className="block truncate">Good</span>
          <span className="block truncate">({getReviewTimeEstimate(word, 'good', direction)})</span>
        </div>
      </Button>
      <Button
        className="flex-1 bg-difficulty-perfect hover:bg-difficulty-perfect/80 text-black text-center min-w-0"
        onClick={() => onSelectDifficulty('perfect')}
        title={`Next review in ${getReviewTimeEstimate(word, 'perfect', direction)}`}
      >
        <div className="flex flex-col items-center">
          <span className="block truncate">Perfect</span>
          <span className="block truncate">({getReviewTimeEstimate(word, 'perfect', direction)})</span>
        </div>
      </Button>
    </div>
  );
};

export default DifficultyButtons;
