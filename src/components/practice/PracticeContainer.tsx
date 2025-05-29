
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocab } from '@/context/VocabContext';
import { PracticeDirection } from '@/types/vocabulary';
import PracticeSession from './PracticeSession';
import { useParams } from 'react-router-dom';

const PracticeContainer = () => {
  const { listId, urlDirection } = useParams();
  const { getListById, selectList, currentList, isLoading } = useVocab();
  const navigate = useNavigate();
  const [direction, setDirection] = useState<PracticeDirection>(urlDirection as PracticeDirection || 'translateTo');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initList = async () => {
      if (listId) {
        const list = getListById(listId);
        if (list) {
          await selectList(listId);
          setInitialized(true);
        } else if (!isLoading) {
          // Only navigate away if we're not still loading lists
          navigate('/');
        }
      }
    };
    initList();
  }, [listId, selectList, getListById, navigate, isLoading]);

  const handleDirectionChange = (newDirection: PracticeDirection) => {
    setDirection(newDirection);
  };
  
  // Show nothing while initializing or if no list
  if (!initialized || !currentList) {
    return null;
  }

  return (
    <PracticeSession 
      direction={direction}
      onDirectionChange={handleDirectionChange}
    />
  );
};

export default PracticeContainer;
