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
    onDirectionChange(direction === 'translateFrom' ? 'translateTo' : 'translateFrom');
  };

  const dueTranslateTo = currentList?.words.filter(word => {
    const nextReview = word.nextReview?.translateTo;
    return !nextReview || nextReview <= now;
  }).length || 0;
  
  const dueTranslateFrom = currentList?.words.filter(word => {
    const nextReview = word.nextReview?.translateFrom;
    return !nextReview || nextReview <= now;
  }).length || 0;

  return (
    <div className="mb-6 sm:flex sm:justify-between sm:items-center">
      <h1 className="text-2xl font-bold">Practice: {listName}</h1>
      <div className="flex gap-2 mt-2 sm:mt-0">
        <Button onClick={onRefresh}><RefreshCcw /></Button>
        <Button
          variant="default"
          onClick={toggleDirection}
          className={`relative px-[6px] ${
            (direction !== 'translateTo' && dueTranslateTo === 0) ||
            (direction !== 'translateFrom' && dueTranslateFrom === 0)
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-input hover:bg-accent'
            }`}
            disabled={
              (direction !== 'translateTo' && dueTranslateTo === 0) ||
              (direction !== 'translateFrom' && dueTranslateFrom === 0)
            } 
          >
          <div className="flex items-center">
            <span className="inline-block align-middle">
              <img
                src={direction !== 'translateTo' ? `/flags/${currentList?.language}.ico` : '/flags/en.ico'}
                alt={direction !== 'translateTo' ? currentList?.language.toUpperCase() : 'EN'}
                className="w-6 h-6 object-contain"
              />
            </span>
            <span className="inline-block align-middle mx-1">
              <img src="/ra.webp" alt="arrow" className="w-4 h-4 object-contain" />
            </span>
            <span className="inline-block align-middle">
              <img
                src={direction !== 'translateTo' ? '/flags/en.ico' : `/flags/${currentList?.language}.ico`}
                alt={direction !== 'translateTo' ? 'EN' : currentList?.language.toUpperCase()}
                className="w-6 h-6 object-contain"
              />
            </span>
          </div>
        </Button>
        <Button onClick={onBack}>Back to List</Button>
        <Button onClick={() => navigate('/')}>Home</Button>
      </div>
    </div>
  );
};

export default PracticeHeader;
