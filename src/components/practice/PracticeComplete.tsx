
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface PracticeCompleteProps {
  totalWords: number;
  timeSpent: number;
  onRestart: () => void;
  onBack: () => void;
}

const PracticeComplete: React.FC<PracticeCompleteProps> = ({
  totalWords,
  timeSpent,
  onRestart,
  onBack
}) => {
  // Format time spent in minutes and seconds
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Practice Complete!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>You've successfully reviewed {totalWords} words.</p>
        <p>Total time: {formatTime(timeSpent)}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onRestart}
        >
          Practice Again
        </Button>
        <Button onClick={onBack}>
          Back to List
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PracticeComplete;
