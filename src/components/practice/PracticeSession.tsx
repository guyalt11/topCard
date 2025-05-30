import React, { useState, useEffect, useRef } from 'react';
import { useVocab } from '@/context/VocabContext';
import { useNavigate } from 'react-router-dom';
import PracticeCard from '@/components/practice/PracticeCard';
import PracticeHeader from './PracticeHeader';
import PracticeComplete from './PracticeComplete';
import WordCompletionCounter from './WordCompletionCounter';
import PracticeProgressBar from '@/components/PracticeProgressBar';
import { DifficultyLevel, PracticeDirection } from '@/types/vocabulary';
import { usePracticeWords } from '@/hooks/usePracticeWords';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PracticeSessionProps {
  direction: PracticeDirection;
  onDirectionChange: (direction: PracticeDirection) => void;
}

const PracticeSession: React.FC<PracticeSessionProps> = ({ 
  direction,
  onDirectionChange
}) => {
  const { currentList, updateWordDifficulty, selectList, deleteWord, isLoading } = useVocab();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const { practiceWords, resetPracticeWords } = usePracticeWords(direction);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
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

  // Reset only the session state without fetching new words
  const resetSessionState = () => {
    setCurrentIndex(0);
    setCompletedCount(0);
    setIsAnswered(false);
  };

  useEffect(() => {
    resetSession();
  }, [direction]);

  // Handle refresh by reloading the list and resetting the session
  const handleRefresh = async () => {
    if (currentList) {
      await selectList(currentList.id);
      resetSession();
    }
  };

  // Show loading state while loading lists
  if (isLoading || !currentList) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading practice session...</p>
        </div>
      </div>
    );
  }

  // Use the initial words list if it exists, otherwise fall back to practiceWords
  const wordsToUse = initialWordsRef.current.length > 0 ? initialWordsRef.current : practiceWords;
  const currentWord = wordsToUse[currentIndex];
  const totalWords = totalWordsRef.current > 0 ? totalWordsRef.current : wordsToUse.length;
  const isComplete = currentIndex >= wordsToUse.length || wordsToUse.length === 0;
  
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

  const handleDelete = async () => {
    if (currentWord) {
      await deleteWord(currentWord.id);
      // Remove the word from our practice list
      initialWordsRef.current = initialWordsRef.current.filter(w => w.id !== currentWord.id);
      totalWordsRef.current = initialWordsRef.current.length;
      
      // If we've deleted all words, set counts to trigger completion screen
      if (initialWordsRef.current.length === 0) {
        setCompletedCount(0);
        totalWordsRef.current = 0;
        setCurrentIndex(0);
        return;
      }
    }
  };

  return (
    <div className="container py-6 max-w-3xl">
      <PracticeHeader 
        listName={currentList.name}
        direction={direction}
        onDirectionChange={onDirectionChange}
        onBack={() => navigate(`/list/${currentList?.id}`)}
        onRefresh={handleRefresh}
      />

      <div className="mb-4">
        <PracticeProgressBar 
          currentProgress={completedCount}
          totalWords={totalWords}
        />
      </div>

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
          onDelete={() => setShowDeleteDialog(true)}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Word</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this word? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDelete();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PracticeSession;
