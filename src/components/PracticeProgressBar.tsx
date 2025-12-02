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
    const start = { r: 0, g: 130, b: 132, a: 1 };
    const end = { r: 0, g: 229, b: 204, a: 1 };

    const r = Math.round(start.r + (percentage / 100) * (end.r - start.r));
    const g = Math.round(start.g + (percentage / 100) * (end.g - start.g));
    const b = Math.round(start.b + (percentage / 100) * (end.b - start.b));
    const a = start.a + (percentage / 100) * (end.a - start.a);

    return `rgba(${r}, ${g}, ${b}, ${a})`;
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
