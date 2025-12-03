import { Download, Upload } from "lucide-react";
import { ImportExportArrow } from '@/components/Icon';
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
import LoadingOverlay from "@/components/LoadingOverlay";
import { useNavigate } from "react-router-dom";

interface ListActionsProps {
  listId: string;
  onExport: (id: string, format: 'json') => void;
  onImport: (file: File) => Promise<void>;
}

const ListActions = ({ listId, onExport, onImport }: ListActionsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { getListById, addWord } = useVocab();
  const { importList } = useVocabImportExport({ lists: [], setLists: () => { } });
  const navigate = useNavigate();

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

    // Close the dropdown menu first
    setIsOpen(false);

    setIsImporting(true);
    try {
      const list = getListById(listId);
      if (list) {
        const importedList = await importList(file, list.name);
        if (importedList && importedList.words.length) {
          // Add all words sequentially
          for (const word of importedList.words) {
            await addWord(listId, {
              origin: word.origin,
              transl: word.transl,
              gender: word.gender,
              notes: word.notes
            });
          }

          toast({
            title: "Import successful",
            description: `Added ${importedList.words.length} words to the list.`,
          });

          // Navigate to the list page and reload to show updated list
          navigate(`/list/${listId}`);
          // Small delay to ensure navigation completes before reload
          setTimeout(() => {
            window.location.reload();
          }, 100);
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
      {isImporting && <LoadingOverlay message="Importing words..." />}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileChange}
      />
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="List actions">
            <ImportExportArrow size={16} />
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
