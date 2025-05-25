import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRef, useState } from "react";
import { useVocabImportExport } from "@/hooks/useVocabImportExport";
import { useVocab } from "@/context/VocabContext";
import { toast } from "@/components/ui/use-toast";

interface ListActionsProps {
  listId: string;
  onExport: (id: string, format: 'json') => void;
  onImport: (file: File) => Promise<void>;
}

const ListActions = ({ listId, onExport, onImport }: ListActionsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { getListById, addWord } = useVocab();
  const { importList } = useVocabImportExport({ lists: [], setLists: () => {} });

  const handleImportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isImporting) return;

    // Reset the file input value to ensure the change event fires even if the same file is selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Open the file dialog
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const list = getListById(listId);
      if (list) {
        const importedList = await importList(file, list.name);
        if (importedList && importedList.words.length) {
          // Add each word to the list asynchronously
          const addWordPromises = importedList.words.map(async (word) => {
            await addWord(listId, {
              german: word.german,
              english: word.english,
              gender: word.gender,
              notes: word.notes
            });
          });

          // Process words one by one to update UI in real-time
          for (const promise of addWordPromises) {
            await promise;
          }

          toast({
            title: "Import successful",
            description: `Added ${importedList.words.length} words to the list.`,
          });
        }
      }
    } catch (error) {
      console.error('Error importing to list:', error);
      toast({
        title: "Import error",
        description: "Failed to import words to the list. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset the input value and importing state
      e.target.value = '';
      setIsImporting(false);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="List actions">
            <img src="/arrows.webp" alt="List actions" className="mx-3 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>List Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onExport(listId, 'json')}>
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleImportClick} 
            disabled={isImporting}
            className="flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isImporting ? 'Importing...' : 'Import Words'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ListActions;
