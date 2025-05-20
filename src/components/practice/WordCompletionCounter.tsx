
import React from 'react';

interface WordCompletionCounterProps {
  completedCount: number;
  totalWords: number;
}

const WordCompletionCounter: React.FC<WordCompletionCounterProps> = ({ 
  completedCount, 
  totalWords 
}) => {
  const wordsLeft = totalWords - completedCount;
  
  return (
    <div className="text-sm text-muted-foreground text-center mt-2">
      {wordsLeft} {wordsLeft === 1 ? 'word' : 'words'} left
    </div>
  );
};

export default WordCompletionCounter;
