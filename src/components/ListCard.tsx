import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { VocabList } from "@/types/vocabulary";
import { Edit, Trash2, Share2, Pin } from "lucide-react";
import ListActions from "@/components/ListActions";
import { useAppNavigation } from '@/hooks/useAppNavigation';
import FlagIcon from '@/components/FlagIcon';
import { RightArrow } from '@/components/Icon';

interface ListCardProps {
  list: VocabList;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPractice: (id: string, direction: string) => void;
  onExport: (id: string, format: 'json') => void;
  onImport: (file: File) => Promise<void>;
  onShareToggle: (id: string, share: boolean) => void;
  onPinToggle: (id: string, pinned: boolean) => void;
}

const ListCard = ({ list, onSelect, onEdit, onDelete, onPractice, onExport, onImport, onShareToggle, onPinToggle }: ListCardProps) => {
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
    <Card className="h-full flex flex-col" style={{ background: 'linear-gradient(135deg, rgba(21, 76, 82, 1) 0%, rgba(8, 35, 38, 1) 100%)' }}>
      {/*<Card className="h-full flex flex-col" style={{ background: 'linear-gradient(135deg, rgba(8, 35, 38, 1) 0%, rgba(21, 76, 82, 1) 100%)' }}>*/}
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start justify-between sm:flex-1">
            <CardTitle className="text-lg text-left flex-1">
              {list.name}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 flex-shrink-0 sm:hidden ${list.pinned ? 'text-yellow-500' : ''}`}
              onClick={() => onPinToggle(list.id, !list.pinned)}
              title={list.pinned ? 'Unpin list' : 'Pin list'}
            >
              <Pin className={`h-4 w-4 ${list.pinned ? 'fill-current' : ''}`} />
            </Button>
          </div>
          <div className="flex items-center gap-1 w-full sm:w-auto justify-start">
            <div className="flex flex-row-reverse sm:flex-row gap-1">
              <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => onDelete(list.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(list.id)}>
                <Edit className="h-4 w-4" />
              </Button>
              <ListActions listId={list.id} onExport={onExport} onImport={onImport} />
              <div className="flex items-center gap-2 px-2 py-1 rounded-md" style={{ backgroundColor: 'rgba(13, 76, 81, 0.8)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-share-fill" viewBox="0 0 16 16">
                  <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5" />
                </svg>
                <Switch
                  id={`share-${list.id}`}
                  checked={list.share || false}
                  onCheckedChange={(checked) => onShareToggle(list.id, checked)}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 flex-shrink-0 hidden sm:flex items-center justify-center ${list.pinned ? 'text-yellow-500' : ''}`}
              onClick={() => onPinToggle(list.id, !list.pinned)}
              title={list.pinned ? 'Unpin list' : 'Pin list'}
            >
              <Pin className={`h-4 w-4 ${list.pinned ? 'fill-current' : ''}`} />
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
              className={`relative overflow-hidden truncate transition-all hover:brightness-110 ${translateFromCount === 0 ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''} px-3`}
              style={translateFromCount > 0 ? { backgroundColor: 'rgba(20, 95, 100)' } : {}}
              disabled={translateFromCount === 0}
            >
              <FlagIcon country="en" size={20} />
              <RightArrow size={20} className="text-white" />
              <FlagIcon country={list.language} size={20} />
            </Button>
            <Button
              variant="default"
              onClick={() => goToPractice(list.id, 'translateTo')}
              className={`relative overflow-hidden truncate transition-all hover:brightness-110 ${translateToCount === 0 ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''} px-3`}
              style={translateToCount > 0 ? { backgroundColor: 'rgba(20, 95, 100)' } : {}}
              disabled={translateToCount === 0}
            >
              <FlagIcon country={list.language} size={20} />
              <RightArrow size={20} className="text-white" />
              <FlagIcon country="en" size={20} />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ListCard;
