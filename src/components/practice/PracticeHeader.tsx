
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { PracticeDirection } from '@/types/vocabulary';

interface PracticeHeaderProps {
  listName: string;
  direction: PracticeDirection;
  onDirectionChange: (newDirection: PracticeDirection) => void;
  onBack: () => void;
}

const PracticeHeader: React.FC<PracticeHeaderProps> = ({ 
  listName, 
  direction,
  onDirectionChange,
  onBack
}) => {
  const toggleDirection = () => {
    onDirectionChange(direction === 'germanToEnglish' ? 'englishToGerman' : 'germanToEnglish');
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Practice: {listName}</h1>
      <div className="flex gap-2">
        <Button variant="outline" onClick={toggleDirection}>
          {direction === 'germanToEnglish' ? 'DE → EN' : 'EN → DE'}
        </Button>
        <Button onClick={onBack}>Back to List</Button>
      </div>
    </div>
  );
};

export default PracticeHeader;
