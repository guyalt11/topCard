
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VocabWord } from "@/types/vocabulary";
import { Edit, Trash2 } from "lucide-react";
import GenderTag from "@/components/GenderTag";

interface WordCardProps {
  word: VocabWord;
  onEdit: () => void;
  onDelete: () => void;
}

const WordCard = ({ word, onEdit, onDelete }: WordCardProps) => {
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg">{word.lng}</h3>
              {word.gender && <GenderTag gender={word.gender} />}
            </div>
            <p className="text-muted-foreground">{word.en}</p>
            {word.notes && <p className="text-sm text-muted-foreground mt-2">{word.notes}</p>}
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:text-destructive" 
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordCard;
