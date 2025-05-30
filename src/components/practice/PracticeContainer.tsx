import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useVocab } from '@/context/VocabContext';
import PracticeSession from './PracticeSession';
import { PracticeDirection } from '@/types/vocabulary';

const PracticeContainer: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentList, selectList, isLoading, getListById } = useVocab();
  const [direction, setDirection] = useState<PracticeDirection>('translateFrom');
  const [initialized, setInitialized] = useState(false);
  const [listNotFound, setListNotFound] = useState(false);

  // Initialize list and direction from URL
  useEffect(() => {
    const initList = async () => {
      if (!listId) {
        navigate('/404');
        return;
      }

      // Wait for lists to load before checking
      if (isLoading) return;

      const list = getListById(listId);
      if (list) {
        await selectList(listId);
        // Set direction from URL if valid
        const urlDirection = searchParams.get('direction');
        if (urlDirection === 'translateFrom' || urlDirection === 'translateTo') {
          setDirection(urlDirection);
        }
        setInitialized(true);
        setListNotFound(false);
      } else {
        setListNotFound(true);
      }
    };

    initList();
  }, [listId, searchParams, selectList, isLoading, getListById, navigate]);

  // Handle direction change
  const handleDirectionChange = (newDirection: PracticeDirection) => {
    setDirection(newDirection);
    // Update URL parameters without causing a page refresh
    setSearchParams({ direction: newDirection });
  };

  // Show loading state while initializing
  if (isLoading || !initialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading practice session...</p>
        </div>
      </div>
    );
  }

  // Redirect to 404 if list not found
  if (listNotFound || !currentList) {
    navigate('/404');
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
