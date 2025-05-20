
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";

interface ListsHeaderProps {
  onAddList: () => void;
  onImport: () => void;
}

const ListsHeader = ({ onAddList, onImport }: ListsHeaderProps) => {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">My Vocabulary Lists</h1>
      
      <div className="flex gap-2 mb-6">
        <Button onClick={onAddList} className="gap-1">
          <Plus className="h-4 w-4" />
          Create New List
        </Button>
        <Button variant="outline" onClick={onImport} className="gap-1">
          <Upload className="h-4 w-4" />
          Import List
        </Button>
      </div>
    </>
  );
};

export default ListsHeader;
