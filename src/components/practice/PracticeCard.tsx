import React, { useState, useEffect } from 'react';
import { VocabWord, PracticeDirection, DifficultyLevel } from '@/types/vocabulary';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CardFront from './CardFront';
import CardBack from './CardBack';
import DifficultyButtons from './DifficultyButtons';

interface PracticeCardProps {
  word: VocabWord;
  direction: PracticeDirection;
  onAnswer: (difficulty: DifficultyLevel) => void;
  onNext: () => void;
  isAnswered: boolean;
  onDelete: () => void;
}

const PracticeCard: React.FC<PracticeCardProps> = ({
  word,
  direction,
  onAnswer,
  onNext,
  isAnswered,
  onDelete,
}) => {
  const [flipped, setFlipped] = useState(false);

  // Reset flipped state when word or direction changes
  useEffect(() => {
    setFlipped(false);
  }, [word, direction]);

  // Return early if word is undefined
  if (!word) {
    return (
      <Card className="min-h-[200px] flex flex-col justify-center items-center">
        <CardContent className="text-center">
          <p>Loading word data...</p>
        </CardContent>
      </Card>
    );
  }

  const handleFlip = () => {
    if (!flipped) {
      setFlipped(true);
    }
  };

  const handleDifficultySelect = (difficulty: DifficultyLevel) => {
    if (!isAnswered) {
      onAnswer(difficulty);
      // The parent component will handle moving to the next card
    }
  };

  // Safeguard against undefined word
  if (!word || !word.origin) {
    return (
      <Card className="min-h-[200px] flex flex-col justify-center items-center">
        <CardContent className="text-center">
          <p>No word available for practice.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card
        className={`min-h-[200px] flex flex-col cursor-pointer transition-transform ${flipped ? 'animate-flip' : ''}`}
        onClick={handleFlip}
        style={{ background: 'linear-gradient(135deg, rgba(21, 76, 82, 1) 0%, rgba(8, 35, 38, 1) 100%)' }}
      >
        <CardContent className="flex-1 flex flex-col justify-center items-center p-6">
          <CardFront
            word={word}
            direction={direction}
            flipped={flipped}
            onDelete={onDelete}
          />

          {flipped && (
            <CardBack
              word={word}
              direction={direction}
            />
          )}

          {!flipped && (
            <div className={`text-sm text-muted-foreground ${direction === 'translateFrom' ? 'py-2 mb-24 mt-28' : 'pb-1 mb-20 mt-24'} `}>
              Click to reveal the answer
            </div>
          )}
        </CardContent>

        {flipped && !isAnswered && (
          <CardFooter className="flex-col space-y-2 pt-0">
            <div className="font-medium text-center w-full mb-2">How well did you know this word?</div>
            <DifficultyButtons
              word={word}
              direction={direction}
              onSelectDifficulty={handleDifficultySelect}
            />
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default PracticeCard;
