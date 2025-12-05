import React, { useState, useEffect, useRef } from 'react';
import { useVocab } from '@/context/VocabContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PracticeCard from '@/components/practice/PracticeCard';
import PracticeComplete from '@/components/practice/PracticeComplete';
import WordCompletionCounter from '@/components/practice/WordCompletionCounter';
import PracticeProgressBar from '@/components/PracticeProgressBar';
import { DifficultyLevel, PracticeDirection } from '@/types/vocabulary';
import { usePracticeAllWords, WordWithListInfo } from '@/hooks/usePracticeAllWords';
import { Button } from '@/components/ui/button';
import FlagIcon from '@/components/FlagIcon';
import RightArrow from '@/components/Icon';
import { RefreshCcw } from 'lucide-react';
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

const PracticeAll: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateWordDifficulty, deleteWord, isLoading, lists } = useVocab();
  const [direction, setDirection] = useState<PracticeDirection>('translateFrom');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const { practiceWords, resetPracticeWords } = usePracticeAllWords(direction);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Store the initial word list as a ref so it never changes during the session
  const initialWordsRef = useRef<WordWithListInfo[]>([]);
  const totalWordsRef = useRef<number>(0);

  // Initialize direction from URL
  useEffect(() => {
    const urlDirection = searchParams.get('direction');
    if (urlDirection === 'translateFrom' || urlDirection === 'translateTo') {
      setDirection(urlDirection);
    }
    setInitialized(true);
  }, [searchParams]);

  // Initialize the words only once when practiceWords changes and initialWordsRef is empty
  useEffect(() => {
    if (practiceWords.length > 0 && initialWordsRef.current.length === 0) {
      initialWordsRef.current = [...practiceWords];
      totalWordsRef.current = practiceWords.length;

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
    if (initialized) {
      resetSession();
    }
  }, [direction]);

  // Handle refresh
  const handleRefresh = () => {
    resetSession();
  };

  // Handle direction change
  const handleDirectionChange = (newDirection: PracticeDirection) => {
    setDirection(newDirection);
    setSearchParams({ direction: newDirection });
  };

  const toggleDirection = () => {
    handleDirectionChange(direction === 'translateFrom' ? 'translateTo' : 'translateFrom');
  };

  // Calculate due counts for both directions
  const getDueCounts = () => {
    if (!lists || lists.length === 0) return { translateFromDue: 0, translateToDue: 0 };

    const now = new Date();
    let translateFromDue = 0;
    let translateToDue = 0;

    lists.forEach(list => {
      list.words.forEach(word => {
        const nextReviewFrom = word.nextReview?.translateFrom;
        const nextReviewTo = word.nextReview?.translateTo;

        if (!nextReviewFrom || nextReviewFrom <= now) {
          translateFromDue++;
        }
        if (!nextReviewTo || nextReviewTo <= now) {
          translateToDue++;
        }
      });
    });

    return { translateFromDue, translateToDue };
  };

  const { translateFromDue, translateToDue } = getDueCounts();

  // Show loading state
  if (isLoading || !initialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading practice session...</p>
        </div>
      </div>
    );
  }

  const wordsToUse = initialWordsRef.current.length > 0 ? initialWordsRef.current : practiceWords;
  const currentWord = wordsToUse[currentIndex];
  const totalWords = totalWordsRef.current > 0 ? totalWordsRef.current : wordsToUse.length;
  const isComplete = currentIndex >= wordsToUse.length || wordsToUse.length === 0;

  const handleAnswered = (difficulty: DifficultyLevel) => {
    if (currentWord) {
      // Update the word's difficulty and next review time
      const now = new Date();
      const updatedWord = {
        ...currentWord,
        sm2: {
          ...currentWord.sm2 || {},
          [direction]: {
            easeFactor: 2.5,
            interval: 0,
            repetitions: 0
          }
        },
        nextReview: {
          ...currentWord.nextReview || {},
          [direction]: new Date(now.getTime() + (difficulty === 'hard' ? 60000 : 3600000))
        }
      };

      // Update the word in the practice list
      initialWordsRef.current = initialWordsRef.current.map(w =>
        w.id === currentWord.id ? updatedWord : w
      );

      // Update the completed count and answered state
      setCompletedCount(prev => prev + 1);
      setIsAnswered(true);

      // Call updateWordDifficulty in the background
      updateWordDifficulty(currentWord.id, difficulty, direction).catch(error => {
        console.error('Error updating word difficulty:', error);
      });

      // Move to the next card after a short delay
      setTimeout(() => {
        handleNext();
      }, 100);
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
      {/* Header */}
      <div className="mb-6 sm:flex sm:justify-between sm:items-center">
        <h1 className="text-2xl font-bold">Practice: All Lists</h1>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button onClick={handleRefresh}><RefreshCcw /></Button>
          <Button
            variant="default"
            onClick={toggleDirection}
            className={`relative px-[6px] sm:px-2 bg-tertiary ${(direction !== 'translateTo' && translateToDue === 0) ||
              (direction !== 'translateFrom' && translateFromDue === 0) ? 'cursor-not-allowed' : ''}`}
            disabled={
              (direction !== 'translateTo' && translateToDue === 0) ||
              (direction !== 'translateFrom' && translateFromDue === 0)
            }
          >
            <div className="flex items-center gap-1">
              <FlagIcon
                country={direction !== 'translateTo' ? (currentWord?.listTarget || 'de') : (currentWord?.listLanguage || 'en')}
                size={24}
              />
              <RightArrow size={24} className="text-white" />
              <FlagIcon
                country={direction !== 'translateTo' ? (currentWord?.listLanguage || 'en') : (currentWord?.listTarget || 'de')}
                size={24}
              />
            </div>
          </Button>
          <Button onClick={() => navigate('/')}>Home</Button>
        </div>
      </div>

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
          onBack={() => navigate('/')}
        />
      ) : (
        <>
          <PracticeCard
            word={currentWord}
            direction={direction}
            onAnswer={handleAnswered}
            onNext={handleNext}
            isAnswered={isAnswered}
            onDelete={() => setShowDeleteDialog(true)}
          />
          <div className="mt-4 text-sm text-light-foreground text-center">
            From list: <span className="font-semibold">{currentWord.listName}</span>
          </div>
        </>
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
              className="bg-danger text-danger-foreground hover:bg-danger/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PracticeAll;