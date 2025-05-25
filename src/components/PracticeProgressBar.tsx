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

  // Calculate color based on progress
  const getProgressColor = (percentage: number) => {
    // Start with blue (hsl(210, 100%, 55%))
    // End with green (hsl(142, 100%, 55%))
    const hue = 210 + (percentage / 100) * (142 - 210);
    return `hsl(${hue}, 100%, 55%)`;
  };

  const progressColor = getProgressColor(progressPercentage);

  return (
    <div className="w-full h-4 rounded-full border border-[hsl(210,100%,55%)] overflow-hidden">
      <div 
        className="h-full transition-all duration-300"
        style={{ 
          width: `${progressPercentage}%`,
          backgroundColor: progressColor
        }}
      />
    </div>
  );
};

export default PracticeProgressBar;
