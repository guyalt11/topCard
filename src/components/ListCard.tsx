import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VocabList } from "@/types/vocabulary";
import { Edit, Trash2 } from "lucide-react";
import ListActions from "@/components/ListActions";

interface ListCardProps {
  list: VocabList;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPractice: (id: string) => void;
  onExport: (id: string, format: 'json' | 'yaml') => void;
}

const ListCard = ({ list, onSelect, onEdit, onDelete, onPractice, onExport }: ListCardProps) => {
  // Count words due for practice in each direction
  const now = new Date();
  const dueGermanToEnglish = list.words.filter(word => {
    const nextReview = word.nextReview?.germanToEnglish;
    return !nextReview || nextReview <= now;
  }).length;
  
  const dueEnglishToGerman = list.words.filter(word => {
    const nextReview = word.nextReview?.englishToGerman;
    return !nextReview || nextReview <= now;
  }).length;
  
  const totalDueCount = dueGermanToEnglish + dueEnglishToGerman;

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
                ({dueGermanToEnglish} German → English, {dueEnglishToGerman} English → German)
              </span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardFooter className="pt-2 mt-auto flex gap-2">
        <Button 
          className="flex-1"
          onClick={() => onSelect(list.id)}
        >
          View List
        </Button>
        <Button 
          variant="outline"
          className="flex-1"
          onClick={() => onPractice(list.id)}
        >
          Practice
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ListCard;
