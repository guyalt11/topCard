import { useNavigate } from 'react-router-dom';
import { useVocab } from '@/context/VocabContext';
import { PracticeDirection } from '@/types/vocabulary';

export const useAppNavigation = () => {
  const navigate = useNavigate();
  const { getListById, selectList } = useVocab();

  const goToHome = () => {
    navigate('/');
  };

  const goToList = async (listId: string) => {
    const list = getListById(listId);
    if (!list) {
      goToHome();
      return;
    }
    await selectList(listId);
    navigate(`/list/${listId}`);
  };

  const goToPractice = async (listId: string, direction: PracticeDirection) => {
    const list = getListById(listId);
    if (!list) {
      goToHome();
      return;
    }
    await selectList(listId);
    navigate(`/practice/${listId}?direction=${direction}`);
  };

  const goToPracticeAll = (direction: PracticeDirection = 'translateFrom') => {
    navigate(`/practice-all?direction=${direction}`);
  };

  return {
    goToHome,
    goToList,
    goToPractice,
    goToPracticeAll
  };
};
