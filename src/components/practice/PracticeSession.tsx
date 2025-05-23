import React, { useState, useEffect, useRef } from 'react';
import { useVocab } from '@/context/VocabContext';
import { useNavigate } from 'react-router-dom';
import PracticeCard from '@/components/practice/PracticeCard';
import PracticeHeader from './PracticeHeader';
import PracticeComplete from './PracticeComplete';
import WordCompletionCounter from './WordCompletionCounter';
import { DifficultyLevel, PracticeDirection } from '@/types/vocabulary';
import { usePracticeWords } from '@/hooks/usePracticeWords';

interface PracticeSessionProps {
  direction: PracticeDirection;
  onDirectionChange: (direction: PracticeDirection) => void;
}

const PracticeSession: React.FC<PracticeSessionProps> = ({ 
  direction,
  onDirectionChange
}) => {
  const { currentList, updateWordDifficulty } = useVocab();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const { practiceWords, resetPracticeWords } = usePracticeWords(direction);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Store the initial word list as a ref so it never changes during the session
  const initialWordsRef = useRef<typeof practiceWords>([]);
  // Store the initial total words count as a ref so it never changes during the session
  const totalWordsRef = useRef<number>(0);

  // Initialize the words only once when practiceWords changes and initialWordsRef is empty
  useEffect(() => {
    if (practiceWords.length > 0 && initialWordsRef.current.length === 0) {
      initialWordsRef.current = [...practiceWords]; // Create a deep copy
      totalWordsRef.current = practiceWords.length;
      console.log(`Session initialized with ${practiceWords.length} words to practice`);
    }
  }, [practiceWords]);

  // Reset session and refs when direction changes
  const resetSession = () => {
    resetPracticeWords();
    setCurrentIndex(0);
    setCompletedCount(0);
    setIsAnswered(false);
    initialWordsRef.current = [];
    totalWordsRef.current = 0;
  };

  useEffect(() => {
    resetSession();
  }, [direction]);

  // Use the initial words list if it exists, otherwise fall back to practiceWords
  const wordsToUse = initialWordsRef.current.length > 0 ? initialWordsRef.current : practiceWords;
  const currentWord = wordsToUse[currentIndex];
  const totalWords = totalWordsRef.current > 0 ? totalWordsRef.current : wordsToUse.length;
  const isComplete = currentIndex >= wordsToUse.length;
  
  const handleAnswered = (difficulty: DifficultyLevel) => {
    if (currentWord) {
      updateWordDifficulty(currentWord.id, difficulty, direction);
      setCompletedCount(prev => prev + 1);
      setIsAnswered(true);
      console.log(`Word completed. Completed count: ${completedCount + 1}/${totalWords}`);
    }
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
    setIsAnswered(false);
  };

  const handleRestart = () => {
    resetSession();
  };

  return (
    <div className="container py-6 max-w-3xl">
      <PracticeHeader 
        listName={currentList.name}
        direction={direction}
        onDirectionChange={onDirectionChange}
        onBack={() => navigate(`/list/${currentList?.id}`)}
      />

      <div className="mb-6">
        <WordCompletionCounter 
          completedCount={completedCount} 
          totalWords={totalWords} 
        />
      </div>

      {isComplete ? (
        <PracticeComplete 
          totalWords={totalWords}
          onRestart={handleRestart}
          onBack={() => navigate(`/list/${currentList?.id}`)}
        />
      ) : (
        <PracticeCard
          word={currentWord}
          direction={direction}
          onAnswer={handleAnswered}
          onNext={handleNext}
          isAnswered={isAnswered}
        />
      )}
    </div>
  );
};

export default PracticeSession;
