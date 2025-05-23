
import { v4 as uuidv4 } from 'uuid';
import { VocabList } from '@/types/vocabulary';
import { toast } from '@/components/ui/use-toast';

interface VocabImportExportProps {
  lists: VocabList[];
  setLists: (lists: VocabList[]) => void;
}

export function useVocabImportExport({ lists, setLists }: VocabImportExportProps) {
  // Export a list to JSON
  const exportList = (id: string, format: 'json') => {
    const list = lists.find(l => l.id === id);
    if (!list) return;

    // Create a simplified version for export
    const exportData = {
      name: list.name,
      words: list.words.map(word => ({
        german: word.german,
        english: word.english,
        gender: word.gender || null,
        description: word.notes || null, // Export notes as description for compatibility
      })),
    };

    let fileContent: string;
    let fileType: string;
    let fileName: string;

    if (format === 'json') {
      fileContent = JSON.stringify(exportData, null, 2);
      fileType = 'application/json';
      fileName = `${list.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    }

    // Create and download the file
    const blob = new Blob([fileContent], { type: fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import a list from a JSON file
  const importList = async (file: File, listName: string): Promise<VocabList | null> => {
    try {
      const text = await file.text();
      let importData: any;
      
      if (file.name.endsWith('.json')) {
        importData = JSON.parse(text);
      } else {
        toast({
          title: "Import error",
          description: "Only JSON files are supported.",
          variant: "destructive",
        });
        return null;
      }
      
      // Validate the imported data
      if (!importData.words || !Array.isArray(importData.words)) {
        toast({
          title: "Import error",
          description: "Invalid file structure. Missing words array.",
          variant: "destructive",
        });
        return null;
      }
      
      // Create new list with the imported words
      const newList: VocabList = {
        id: uuidv4(),
        name: listName || importData.name || 'Imported List',
        words: importData.words.map((w: any) => ({
          id: uuidv4(),
          german: w.german || '',
          english: w.english || '',
          gender: w.gender || undefined,
          notes: w.description || undefined, // Import description as notes
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      toast({
        title: "Import successful",
        description: `Imported ${newList.words.length} words into "${newList.name}".`,
      });
      
      return newList;
      
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import error",
        description: "Failed to parse the import file. Please check the format.",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    exportList,
    importList
  };
}
