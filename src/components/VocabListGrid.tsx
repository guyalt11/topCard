
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { VocabList, PracticeDirection } from "@/types/vocabulary";
import ListCard from "@/components/ListCard";

interface VocabListGridProps {
  lists: VocabList[];
  onSelectList: (id: string) => void;
  onEditList: (id: string) => void;
  onDeleteList: (id: string) => void;
  onExportList: (id: string, format: 'json') => void;
  onImportWords: (listId: string) => void;
  urlDirection: string;
  listId: string;
}

const VocabListGrid = ({ 
  lists, 
  onSelectList, 
  onEditList, 
  onDeleteList,
  onExportList,
  onImportWords,
  urlDirection,
  listId,
}: VocabListGridProps) => {
  const { goToList, goToPractice } = useAppNavigation();

  const handlePractice = (direction: string, id: string) => {
    goToPractice(id, direction as PracticeDirection);
  };

  return (
    <div className="space-y-4">
      {lists.map((list) => (
        <div key={list.id} className="flex flex-col">
          <ListCard
            list={list}
            onSelect={() => {
              onSelectList(list.id);
              goToList(list.id);
            }}
            onEdit={() => onEditList(list.id)}
            onDelete={() => onDeleteList(list.id)}
            onPractice={(direction) => handlePractice(direction, list.id)}
            onExport={onExportList}
            onImport={async (file) => await onImportWords(list.id)}
          />
        </div>
      ))}
    </div>
  );
};

export default VocabListGrid;
