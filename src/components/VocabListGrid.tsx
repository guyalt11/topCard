
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { VocabList, PracticeDirection } from "@/types/vocabulary";
import ListCard from "@/components/ListCard";

interface VocabListGridProps {
  lists: VocabList[];
  onSelectList: (id: string) => void;
  onEditList: (id: string) => void;
  onDeleteList: (id: string) => void;
  onExportList: (id: string, format: 'json') => void;
  onImportWords: (file: File, listName: string) => Promise<void>;
  urlDirection: string;
  listId: string;
  showOnlyDue: boolean;
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
  showOnlyDue,
}: VocabListGridProps) => {
  const { goToList, goToPractice } = useAppNavigation();

  const handlePractice = (direction: string, id: string) => {
    goToPractice(id, direction as PracticeDirection);
  };

  return (
    <div className="space-y-4">
      {lists
        .filter(list => !showOnlyDue || list.words.some(word => {
          const now = new Date();
          return (!word.nextReview?.translateFrom || word.nextReview.translateFrom <= now) ||
                 (!word.nextReview?.translateTo || word.nextReview.translateTo <= now);
        }))
        .map((list) => (
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
            onImport={async (file) => await onImportWords(file, list.name)}
          />
        </div>
      ))}
    </div>
  );
};

export default VocabListGrid;
