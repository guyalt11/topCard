
import React from 'react';

interface PracticeProgressBarProps {
  currentProgress: number;
  totalWords: number;
}

const PracticeProgressBar: React.FC<PracticeProgressBarProps> = ({ 
  currentProgress,
  totalWords 
}) => {
  // Calculate the percentage filled (0-100)
  const progressPercentage = totalWords > 0 
    ? Math.min(100, (currentProgress / totalWords) * 100)
    : 0;

  return (
    <div className="w-full h-4 rounded-full border border-[hsl(210,100%,55%)] overflow-hidden">
      <div 
        className="h-full bg-[hsl(210,100%,55%)] transition-all duration-300"
        style={{ width: `${progressPercentage}%` }}
      />
    </div>
  );
};

export default PracticeProgressBar;
