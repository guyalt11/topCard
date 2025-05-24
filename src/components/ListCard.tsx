import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VocabList } from "@/types/vocabulary";
import { Edit, Trash2 } from "lucide-react";
import ListActions from "@/components/ListActions";
import { useNavigate } from "react-router-dom";

interface ListCardProps {
  list: VocabList;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPractice: (id: string, direction: string) => void;
  onExport: (id: string, format: 'json') => void;
  onImport: (file: File) => Promise<void>;
}

const ListCard = ({ list, onSelect, onEdit, onDelete, onPractice, onExport, onImport }: ListCardProps) => {
  const navigate = useNavigate();
  // Count words due for practice in each direction
  const now = new Date();
  const germanDueCount = list.words.filter(word => {
    const nextReview = word.nextReview?.germanToEnglish;
    return !nextReview || nextReview <= now;
  }).length;
  
  const englishDueCount = list.words.filter(word => {
    const nextReview = word.nextReview?.englishToGerman;
    return !nextReview || nextReview <= now;
  }).length;
  
  const totalDueCount = germanDueCount + englishDueCount;

  return (
    <Card className="h-full flex flex-col bg-muted/30">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg mb-1 flex-1 text-left">{list.name}</CardTitle>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onEdit(list.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => onDelete(list.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <ListActions 
              listId={list.id}
              onExport={onExport}
              onImport={onImport}
            />
          </div>
        </div>
        <CardDescription className="text-left">
          {list.words.length} words total
          {totalDueCount > 0 && (
            <>
              <span className="block mt-1 text-primary font-medium">
                {totalDueCount} due for practice
              </span>
              <span className="text-xs text-muted-foreground">
                ({germanDueCount} German → English, {englishDueCount} English → German)
              </span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardFooter className="pt-2 mt-auto flex flex-wrap sm:flex-nowrap gap-2">
        <div className="w-full sm:w-auto">
          <Button 
            className="w-full sm:w-auto flex-1 sm:px-10"
            onClick={() => onSelect(list.id)}
          >
            View List
          </Button>
        </div>
        <div className="w-full flex items-center gap-2 mt-2 sm:w-auto sm:mt-0">
          <span className="flex items-center font-bold border border-transparent px-4 h-10 sm:ml-2 select-none">
            Practice:
          </span>
          <Button
            variant="default"
            onClick={() => navigate(`/practice/${list.id}/englishToGerman`)}
            className={`relative ${englishDueCount === 0 ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-input hover:bg-accent'} px-2`}
            disabled={englishDueCount === 0}
          >
            <img src="/faviconGB.ico" alt="GB" className="inline h-5" />
            <img src="/ra.webp" alt="arrow" className="inline h-5" />
            <img src="/faviconDE.ico" alt="DE" className="inline h-5" />
          </Button>
          <Button
            variant="default"
            onClick={() => navigate(`/practice/${list.id}/germanToEnglish`)}
            className={`relative ${germanDueCount === 0 ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-input hover:bg-accent'} px-2`}
            disabled={germanDueCount === 0}
          >
            <img src="/faviconDE.ico" alt="DE" className="inline h-5" />
            <img src="/ra.webp" alt="arrow" className="inline h-5" />
            <img src="/faviconGB.ico" alt="GB" className="inline h-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ListCard;
