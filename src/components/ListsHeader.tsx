
import { Button } from "@/components/ui/button";
import { Plus, Upload, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { VocabList } from "@/types/vocabulary";

interface ListsHeaderProps {
  onAddList: () => void;
  onImport: () => void;
  lists: VocabList[];
  onFilterChange: (showOnlyDue: boolean) => void;
  showOnlyDue: boolean;
}

const ListsHeader = ({ onAddList, onImport, lists, onFilterChange }: ListsHeaderProps) => {
  const [showOnlyDue, setShowOnlyDue] = useState(false);
  return (
    <>
      <div className="flex gap-2 mb-6">
        <Button onClick={onAddList} className="gap-1">
          <Plus className="h-4 w-4" />
          Create New List
        </Button>
        <Button variant="outline" onClick={onImport} className="gap-1">
          <Upload className="h-4 w-4" />
          Import List
        </Button>
        <Button 
          title={showOnlyDue ? "Show all lists" : "Show only due lists"} 
          variant="outline" 
          onClick={() => {
            setShowOnlyDue(!showOnlyDue);
            onFilterChange(!showOnlyDue);
          }} 
          className="gap-1"
        >
          {showOnlyDue ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
      </div>
    </>
  );
};

export default ListsHeader;
