
import { Button } from "@/components/ui/button";
import { Plus, Upload, Eye, EyeOff, Search, X, Play, BookOpen } from "lucide-react";
import { useState } from "react";
import { VocabList } from "@/types/vocabulary";

interface ListsHeaderProps {
  onAddList: () => void;
  onImport: () => void;
  onLibrary: () => void;
  lists: VocabList[];
  onFilterChange: (showOnlyDue: boolean) => void;
  showOnlyDue: boolean;
  onSearchChange: (searchQuery: string) => void;
  onPracticeAll?: () => void;
}

const ListsHeader = ({ onAddList, onImport, onLibrary, lists, onFilterChange, onSearchChange, onPracticeAll }: ListsHeaderProps) => {
  const [showOnlyDue, setShowOnlyDue] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate total due words from all lists
  const getTotalDueWords = () => {
    const now = new Date();
    let totalDue = 0;

    lists.forEach(list => {
      list.words.forEach(word => {
        const nextReviewFrom = word.nextReview?.translateFrom;
        const nextReviewTo = word.nextReview?.translateTo;

        if (!nextReviewFrom || nextReviewFrom <= now) {
          totalDue++;
        }
        if (!nextReviewTo || nextReviewTo <= now) {
          totalDue++;
        }
      });
    });

    return totalDue;
  };

  const totalDueWords = getTotalDueWords();
  return (
    <>
      <div className="flex flex-wrap flex-col sm:flex-row gap-2 mb-5 sm:mb-6">
        <div className="flex gap-2">
          {onPracticeAll && (
            <Button
              title="Practice all words"
              onClick={onPracticeAll}
              disabled={totalDueWords === 0}
              className={`gap-1 transition-all hover:brightness-110 ${totalDueWords === 0 ? 'cursor-not-allowed' : ''}`}
              variant="default"
              style={totalDueWords > 0 ? { backgroundColor: '#00E5CC' } : {}}
            >
              <Play className="h-4 w-4 text-black" />
            </Button>
          )}
          <Button title="Add new list" onClick={onAddList} className="gap-1 transition-all hover:brightness-110" style={{ backgroundColor: '#00C4B4', borderColor: '#00C4B4', color: 'white' }}>
            <Plus className="h-4 w-4 text-black" />
          </Button>
          <Button title="Import lists" variant="outline" onClick={onImport} className="gap-1 transition-all hover:brightness-110" style={{ backgroundColor: '#00A39C', borderColor: '#00A39C', color: 'white' }}>
            <Upload className="h-4 w-4 text-black" />
          </Button>
          <Button title="Browse shared lists" variant="outline" onClick={onLibrary} className="gap-1 transition-all hover:brightness-110" style={{ backgroundColor: '#008284', borderColor: '#008284', color: 'white' }}>
            <BookOpen className="h-4 w-4 text-black" />
          </Button>
          <Button
            title={showOnlyDue ? "All lists" : "Only practicable lists"}
            variant="outline"
            onClick={() => {
              setShowOnlyDue(!showOnlyDue);
              onFilterChange(!showOnlyDue);
            }}
            className="gap-1 transition-all hover:brightness-110"
            style={{ backgroundColor: '#008284', borderColor: '#008284', color: 'white' }}
          >
            {showOnlyDue ? (
              <Eye className="h-4 w-4 text-black" />
            ) : (
              <EyeOff className="h-4 w-4 text-black" />
            )}
          </Button>
        </div>
        <div className="h-full flex mt-3 sm:mt-0 sm:ml-auto justify-start w-full sm:w-auto self-center">
          Total words: {lists.reduce((total, list) => total + list.words.length, 0)}&nbsp;&nbsp;·&nbsp;&nbsp;{totalDueWords} Ready for review
        </div>
      </div>
      <div className="w-full mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search lists..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearchChange(e.target.value);
            }}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            style={{ backgroundColor: 'rgba(8, 35, 38, 1)' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                onSearchChange("");
              }}
              className="absolute right-2 top-2 h-5 w-5 rounded-full bg-transparent text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ListsHeader;
