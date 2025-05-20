
import React from 'react';
import { Switch } from "@/components/ui/switch";
import { DirectionFlag } from '@/components/FlagIcon';
import { PracticeDirection } from '@/types/vocabulary';

interface PracticeDirectionToggleProps {
  direction: PracticeDirection;
  onToggle: () => void;
}

const PracticeDirectionToggle: React.FC<PracticeDirectionToggleProps> = ({ 
  direction, 
  onToggle 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Practice Direction:</span>
      <div className="flex items-center gap-2">
        <DirectionFlag direction={direction === 'germanToEnglish' ? 'germanToEnglish' : 'englishToGerman'} size={20} />
        <Switch 
          checked={direction === 'englishToGerman'}
          onCheckedChange={onToggle}
          id="direction-toggle"
        />
      </div>
    </div>
  );
};

export default PracticeDirectionToggle;
