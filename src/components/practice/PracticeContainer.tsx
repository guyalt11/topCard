
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocab } from '@/context/VocabContext';
import { PracticeDirection } from '@/types/vocabulary';
import { Button } from '@/components/ui/button';
import PracticeSession from './PracticeSession';
import { useParams } from 'react-router-dom';

const PracticeContainer = () => {
  const { urlDirection } = useParams();
  const { currentList } = useVocab();
  const navigate = useNavigate();
  const [direction, setDirection] = useState<PracticeDirection>(urlDirection as PracticeDirection || 'germanToEnglish');
  console.log(direction);
  if (!currentList) {
    return (
      <div className="container py-6 max-w-3xl flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6">Practice</h1>
        <p className="mb-4">Please select a vocabulary list first.</p>
        <Button onClick={() => navigate('/')}>Home</Button>
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
