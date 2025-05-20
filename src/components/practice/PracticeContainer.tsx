
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocab } from '@/context/VocabContext';
import { PracticeDirection } from '@/types/vocabulary';
import { Button } from '@/components/ui/button';
import PracticeSession from './PracticeSession';

const PracticeContainer = () => {
  const { currentList } = useVocab();
  const navigate = useNavigate();
  const [direction, setDirection] = useState<PracticeDirection>('germanToEnglish');
  
  if (!currentList) {
    return (
      <div className="container py-6 max-w-3xl flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Practice</h1>
        <p className="mb-4">Please select a vocabulary list first.</p>
        <Button onClick={() => navigate('/list')}>
          Back to Lists
        </Button>
      </div>
    );
  }

  const handleDirectionChange = (newDirection: PracticeDirection) => {
    setDirection(newDirection);
  };
  
  return (
    <PracticeSession 
      direction={direction}
      onDirectionChange={handleDirectionChange}
    />
  );
};

export default PracticeContainer;
