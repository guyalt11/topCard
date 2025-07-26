import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VocabList } from "@/types/vocabulary";
import { Edit, Trash2, FileDown, FileUp } from "lucide-react";
import ListActions from "@/components/ListActions";
import { useAppNavigation } from '@/hooks/useAppNavigation';

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
  const { goToPractice } = useAppNavigation();
  // Count words due for practice in each direction
  const now = new Date();
  const translateFromCount = list.words.filter(word => {
    const nextReview = word.nextReview?.translateFrom;
    return !nextReview || nextReview <= now;
  }).length;
  
  const translateToCount = list.words.filter(word => {
    const nextReview = word.nextReview?.translateTo;
    return !nextReview || nextReview <= now;
  }).length;
  
  const totalDueCount = translateFromCount + translateToCount;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  return (
    <Card className="h-full flex flex-col bg-muted/30">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg mb-1 flex-1 text-left">{list.name}</CardTitle>
          <div className="flex space-x-1">
            <ListActions 
              listId={list.id}
              onExport={onExport}
              onImport={onImport}
            />
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
              className="text-destructive h-8 w-8"
              onClick={() => onDelete(list.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription className="text-left">
          {list.description && (
            <p className="text-muted-foreground mb-2">
              {list.description}
            </p>
          )}
          {list.words.length} words total
          {totalDueCount > 0 && (
            <>
              <span className="block mt-1 text-primary font-medium">
                {totalDueCount} due for practice
              </span>
              <span className="text-xs text-muted-foreground">
                ({translateFromCount} EN → {list.language.toUpperCase()}, {translateToCount} {list.language.toUpperCase()} → EN)
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
            onClick={() => goToPractice(list.id, 'translateFrom')}
            className={`relative ${translateFromCount === 0 ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-input hover:bg-accent'} px-2`}
            disabled={translateFromCount === 0}
          >
            <img src="/flags/en.ico" alt="EN" className="inline h-5" />
            <img src="/ra.webp" alt="arrow" className="inline h-5" />
            <img src={`/flags/${list.language}.ico`} alt={list.language.toUpperCase()} className="inline h-5" />
          </Button>
          <Button
            variant="default"
            onClick={() => goToPractice(list.id, 'translateTo')}
            className={`relative ${translateToCount === 0 ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-input hover:bg-accent'} px-2`}
            disabled={translateToCount === 0}
          >
            <img src={`/flags/${list.language}.ico`} alt={list.language.toUpperCase()} className="inline h-5" />
            <img src="/ra.webp" alt="arrow" className="inline h-5" />
            <img src="/flags/en.ico" alt="EN" className="inline h-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ListCard;
