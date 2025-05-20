
import { useNavigate } from "react-router-dom";
import { VocabList } from "@/types/vocabulary";
import ListCard from "@/components/ListCard";

interface VocabListGridProps {
  lists: VocabList[];
  onSelectList: (id: string) => void;
  onEditList: (id: string) => void;
  onDeleteList: (id: string) => void;
  onExportList: (id: string, format: 'json' | 'yaml') => void;
}

const VocabListGrid = ({ 
  lists, 
  onSelectList, 
  onEditList, 
  onDeleteList,
  onExportList
}: VocabListGridProps) => {
  const navigate = useNavigate();

  const handlePractice = (listId: string) => {
    onSelectList(listId);
    navigate('/practice');
  };

  return (
    <div className="space-y-4">
      {lists.map((list) => (
        <div key={list.id} className="flex flex-col">
          <ListCard
            list={list}
            onSelect={() => {
              onSelectList(list.id);
              navigate('/list');
            }}
            onEdit={() => onEditList(list.id)}
            onDelete={() => onDeleteList(list.id)}
            onPractice={() => handlePractice(list.id)}
            onExport={onExportList}
          />
        </div>
      ))}
    </div>
  );
};

export default VocabListGrid;
