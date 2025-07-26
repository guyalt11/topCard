import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VocabWord, PracticeDirection } from "@/types/vocabulary";
import { Edit, Trash2 } from "lucide-react";
import GenderTag from "@/components/GenderTag";
import { DirectionFlag } from "@/components/FlagIcon";
import { formatDistanceToNow } from 'date-fns';

interface WordCardProps {
  word: VocabWord;
  onEdit: () => void;
  onDelete: () => void;
  showReviewTimes?: boolean;
}

const WordCard = ({ word, onEdit, onDelete, showReviewTimes }: WordCardProps) => {
  const getNextReviewDate = (word: VocabWord, direction: PracticeDirection): Date | undefined => {
    return word.nextReview?.[direction];
  };

  const formatNextReview = (date: Date | undefined): string => {
    if (!date) return 'Due now';
    
    const now = new Date();
    
    if (date <= now) {
      return 'Due now';
    }
    
    return `In ${formatDistanceToNow(date)}`;
  };

  const isWordDueForReview = (word: VocabWord): boolean => {
    if (!word.nextReview) return true;
    const now = new Date();
    
    const translateFromDue = !getNextReviewDate(word, 'translateFrom') || 
                            getNextReviewDate(word, 'translateFrom')! <= now;
    const translateToDue = !getNextReviewDate(word, 'translateTo') || 
                          getNextReviewDate(word, 'translateTo')! <= now;
    
    return translateFromDue || translateToDue;
  };

  const getFormattedReviewTimes = (word: VocabWord): React.ReactNode => {
    const translateFromFormatted = formatNextReview(getNextReviewDate(word, 'translateFrom'));
    const translateToFormatted = formatNextReview(getNextReviewDate(word, 'translateTo'));
    
    return (
      <div className="flex flex-col gap-1 items-start">
        <div className="flex items-center gap-1">
          <DirectionFlag direction="translateFrom" size={14} />
          <span className={translateFromFormatted === 'Due now' ? 'text-green-500 font-medium' : 'text-muted-foreground'}>
             {translateFromFormatted}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <DirectionFlag direction="translateTo" size={14} />
          <span className={translateToFormatted === 'Due now' ? 'text-green-500 font-medium' : 'text-muted-foreground'}>
            {translateToFormatted}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {word.gender && <GenderTag gender={word.gender} />}
              <h3 className="font-medium text-lg">{word.lng}</h3>
            </div>
            <p className="text-muted-foreground">{word.en}</p>
            {word.notes && <p className="text-sm text-muted-foreground mt-2">{word.notes}</p>}
            {showReviewTimes && (
              <div className="text-xs mt-2">
                {getFormattedReviewTimes(word)}
              </div>
            )}
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
