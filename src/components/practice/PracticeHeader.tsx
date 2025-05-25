import React from 'react';
import { Button } from '@/components/ui/button';
import { PracticeDirection } from '@/types/vocabulary';
import { useNavigate } from 'react-router-dom';
import { useVocab } from '@/context/VocabContext';
import { RefreshCcw } from "lucide-react";

interface PracticeHeaderProps {
  listName: string;
  direction: PracticeDirection;
  onDirectionChange: (newDirection: PracticeDirection) => void;
  onBack: () => void;
  onRefresh: () => void;
}

const PracticeHeader: React.FC<PracticeHeaderProps> = ({ 
  listName, 
  direction,
  onDirectionChange,
  onBack,
  onRefresh
}) => {
  const { currentList } = useVocab();
  const navigate = useNavigate();
  const now = new Date();

  const toggleDirection = () => {
    onDirectionChange(direction === 'germanToEnglish' ? 'englishToGerman' : 'germanToEnglish');
  };

  const dueGermanToEnglish = currentList?.words.filter(word => {
    const nextReview = word.nextReview?.germanToEnglish;
    return !nextReview || new Date(nextReview) <= now;
  }).length || 0;

  const dueEnglishToGerman = currentList?.words.filter(word => {
    const nextReview = word.nextReview?.englishToGerman;
    return !nextReview || new Date(nextReview) <= now;
  }).length || 0;

console.log(dueGermanToEnglish, dueEnglishToGerman, direction);
  return (
    <div className="mb-6 sm:flex sm:justify-between sm:items-center">
      <h1 className="text-2xl font-bold">Practice: {listName}</h1>
      <div className="flex gap-2 mt-2 sm:mt-0">
        <Button onClick={onRefresh}><RefreshCcw /></Button>
        <Button
          variant="default"
          onClick={toggleDirection}
          className={`relative px-2 ${
            (direction === 'englishToGerman' && dueGermanToEnglish === 0) ||
            (direction === 'germanToEnglish' && dueEnglishToGerman === 0)
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-input hover:bg-accent'
            }`}
            disabled={
              (direction === 'englishToGerman' && dueGermanToEnglish === 0) ||
              (direction === 'germanToEnglish' && dueEnglishToGerman === 0)
            } 
          >
          <img
            src={direction === 'germanToEnglish' ? '/faviconGB.ico' : '/faviconDE.ico'}
            alt={direction === 'germanToEnglish' ? 'GB' : 'DE'}
            className="inline h-5"
          />
          <img src="/ra.webp" alt="arrow" className="inline h-5" />
          <img
            src={direction === 'germanToEnglish' ? '/faviconDE.ico' : '/faviconGB.ico'}
            alt={direction === 'germanToEnglish' ? 'DE' : 'GB'}
            className="inline h-5"
          />
        </Button>
        <Button onClick={onBack}>Back to List</Button>
        <Button onClick={() => navigate('/')}>Home</Button>
      </div>
    </div>
  );
};

export default PracticeHeader;
