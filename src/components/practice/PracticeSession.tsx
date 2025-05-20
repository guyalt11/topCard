
import React, { useState, useEffect, useRef } from 'react';
import { useVocab } from '@/context/VocabContext';
import { useNavigate } from 'react-router-dom';
import PracticeCard from '@/components/practice/PracticeCard';
import PracticeHeader from './PracticeHeader';
import PracticeComplete from './PracticeComplete';
import WordCompletionCounter from './WordCompletionCounter';
import { DifficultyLevel, PracticeDirection } from '@/types/vocabulary';
import { Button } from '@/components/ui/button';
import { useCardTimer } from '@/hooks/useCardTimer';
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
  const { timeSpent, startTimer, stopTimer, resetTimer } = useCardTimer();
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Store the initial word list as a ref so it never changes during the session
  const initialWordsRef = useRef<typeof practiceWords>([]);
  // Store the initial total words count as a ref so it never changes during the session
  const totalWordsRef = useRef<number>(0);
  
  // Initialize the words only once when the component first renders with practice words
  useEffect(() => {
    if (practiceWords.length > 0 && initialWordsRef.current.length === 0) {
      initialWordsRef.current = [...practiceWords]; // Create a deep copy
      totalWordsRef.current = practiceWords.length;
      console.log(`Session initialized with ${practiceWords.length} words to practice`);
    }
  }, [practiceWords]);
  
  // Reset session when direction changes
  useEffect(() => {
    resetPracticeWords();
    setCurrentIndex(0);
    setCompletedCount(0);
    setIsAnswered(false);
    resetTimer();
    // Reset our refs when direction changes
    initialWordsRef.current = [];
    totalWordsRef.current = 0;
  }, [direction, resetPracticeWords, resetTimer]);

  // Start timer when a new word is shown, but only if we're not in answered state
  useEffect(() => {
    // Use the initial words ref instead of practiceWords which might change
    const wordsToUse = initialWordsRef.current.length > 0 ? initialWordsRef.current : practiceWords;
    
    if (wordsToUse.length > 0 && currentIndex < wordsToUse.length && !isAnswered) {
      startTimer();
    }
    
    return () => {
      stopTimer();
    };
  }, [currentIndex, practiceWords.length, isAnswered, startTimer, stopTimer]);

  // If no words or list, show the empty state
  if (!currentList || (practiceWords.length === 0 && initialWordsRef.current.length === 0)) {
    return (
      <div className="container py-6 max-w-3xl flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Practice</h1>
        <p className="mb-4">No words due for practice in this direction.</p>
        <Button onClick={() => onDirectionChange(direction === 'germanToEnglish' ? 'englishToGerman' : 'germanToEnglish')}>
          Try {direction === 'germanToEnglish' ? 'English to German' : 'German to English'}
        </Button>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/list')}>
          Back to List
        </Button>
      </div>
    );
  }

  // Use the initial words list if it exists, otherwise fall back to practiceWords
  const wordsToUse = initialWordsRef.current.length > 0 ? initialWordsRef.current : practiceWords;
  const currentWord = wordsToUse[currentIndex];
  const totalWords = totalWordsRef.current || wordsToUse.length;
  const isComplete = currentIndex >= wordsToUse.length;
  
  const handleAnswered = (difficulty: DifficultyLevel) => {
    // Only proceed if we have a valid word
    if (currentWord) {
      updateWordDifficulty(currentWord.id, difficulty, direction);
      setCompletedCount(prev => prev + 1);
      setIsAnswered(true);
      stopTimer();
      console.log(`Word completed. Completed count: ${completedCount + 1}/${totalWords}`);
    }
  };

  const handleNext = () => {
    // Only advance to next word if the current one has been answered
    if (isAnswered) {
      setCurrentIndex(prev => prev + 1);
      setIsAnswered(false);
      resetTimer();
    }
  };

  const handleRestart = () => {
    resetPracticeWords();
    setCurrentIndex(0);
    setCompletedCount(0);
    setIsAnswered(false);
    resetTimer();
    // Reset our refs when restarting
    initialWordsRef.current = [];
    totalWordsRef.current = 0;
  };

  return (
    <div className="container py-6 max-w-3xl">
      <PracticeHeader 
        listName={currentList.name}
        direction={direction}
        onDirectionChange={onDirectionChange}
        onBack={() => navigate('/list')}
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
          timeSpent={timeSpent}
          onRestart={handleRestart}
          onBack={() => navigate('/list')}
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
