import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VocabList } from "@/types/vocabulary";
import { Edit, Trash2, FileDown, FileUp } from "lucide-react";
import ListActions from "@/components/ListActions";
import { useAppNavigation } from '@/hooks/useAppNavigation';
import FlagIcon from '@/components/FlagIcon';
import ArrowIcon from '@/components/ArrowIcon';

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
              <span> - </span>
              <span className="text-green-500 font-medium">
                {totalDueCount} Ready for review
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
        <div className="w-full sm:w-auto mt-2 sm:mt-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Practice:</h3>
            <Button
              variant="default"
              onClick={() => goToPractice(list.id, 'translateFrom')}
              className={`relative overflow-hidden truncate ${translateFromCount === 0 ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-input hover:bg-accent'} px-3`}
              disabled={translateFromCount === 0}
            >
              <FlagIcon country="en" size={20} />
              <ArrowIcon size={20} className="text-white" />
              <FlagIcon country={list.language} size={20} />
            </Button>
            <Button
              variant="default"
              onClick={() => goToPractice(list.id, 'translateTo')}
              className={`relative overflow-hidden truncate ${translateToCount === 0 ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-input hover:bg-accent'} px-3`}
              disabled={translateToCount === 0}
            >
              <FlagIcon country={list.language} size={20} />
              <ArrowIcon size={20} className="text-white" />
              <FlagIcon country="en" size={20} />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ListCard;
