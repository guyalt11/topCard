
import { useNavigate } from "react-router-dom";
import { VocabList } from "@/types/vocabulary";
import ListCard from "@/components/ListCard";

interface VocabListGridProps {
  lists: VocabList[];
  onSelectList: (id: string) => void;
  onEditList: (id: string) => void;
  onDeleteList: (id: string) => void;
  onExportList: (id: string, format: 'json') => void;
  urlDirection: string;
}

const VocabListGrid = ({ 
  lists, 
  onSelectList, 
  onEditList, 
  onDeleteList,
  onExportList,
  urlDirection,
}: VocabListGridProps) => {
  const navigate = useNavigate();

  const handlePractice = (listId: string, direction: string) => {
    onSelectList(listId);
    navigate(`/practice/${direction}`);
  };

  return (
    <div className="space-y-4">
      {lists.map((list) => (
        <div key={list.id} className="flex flex-col">
          <ListCard
            list={list}
            onSelect={() => {
              onSelectList(list.id);
              navigate(`/list/${list.id}`);
            }}
            onEdit={() => onEditList(list.id)}
            onDelete={() => onDeleteList(list.id)}
            onPractice={(id, direction) => handlePractice(id, direction)}
            onExport={onExportList}
          />
        </div>
      ))}
    </div>
  );
};

export default VocabListGrid;
