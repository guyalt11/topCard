import { useState, useRef, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useVocab } from '@/context/VocabContext';
import { useVocabImportExport } from '@/hooks/useVocabImportExport';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import WordCard from '@/components/WordCard';
import AddWordForm from '@/components/AddWordForm';
import { VocabWord, PracticeDirection } from '@/types/vocabulary';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Download, Upload, Pencil, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import FlagIcon, { DirectionFlag } from '@/components/FlagIcon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const VocabList = () => {
  
  const { listId } = useParams<{ listId: string }>();
  const { getListById, deleteWord, exportList, importList, deleteList, updateList, addWord, selectList, isLoading } = useVocab();
  const { goToHome, goToPractice } = useAppNavigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [addWordOpen, setAddWordOpen] = useState(false);
  const [wordToEdit, setWordToEdit] = useState<VocabWord | undefined>(undefined);
  const [wordToDelete, setWordToDelete] = useState<string | null>(null);
  const [showReviewTimes, setShowReviewTimes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [initialized, setInitialized] = useState(false);
  const [listNotFound, setListNotFound] = useState(false);
  
  // Edit list state
  const [editListDialogOpen, setEditListDialogOpen] = useState(false);
  const [editListName, setEditListName] = useState('');
  const [editListDescription, setEditListDescription] = useState('');
  
  // Delete list state
  const [deleteListDialogOpen, setDeleteListDialogOpen] = useState(false);

  useEffect(() => {
    const initList = async () => {
      if (!listId) return;

      // Wait for lists to be loaded
      if (isLoading) return;

      const list = getListById(listId);
      if (list) {
        await selectList(listId);
        setInitialized(true);
        setListNotFound(false);
      } else {
        setListNotFound(true);
      }
    };
    initList();
  }, [listId, selectList, getListById, isLoading]);

  const currentList = getListById(listId ?? '');

  // Show loading state while loading lists
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Only redirect to 404 if we're sure the list doesn't exist and lists are loaded
  if (listNotFound && !isLoading && !currentList) {
    return <Navigate to="/404" replace />;
  }

  // Show nothing while initializing
  if (!initialized || !currentList) {
    return null;
  }
  
  const filteredWords = currentList.words.filter(word => 
    word.lng.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.en.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditWord = (word: VocabWord) => {
    setWordToEdit(word);
    setAddWordOpen(true);
  };

  const handleDeleteWord = (id: string) => {
    setWordToDelete(id);
  };

  const confirmDeleteWord = () => {
    if (wordToDelete) {
      deleteWord(wordToDelete);
      setWordToDelete(null);
    }
  };

  const handleAddWord = () => {
    setWordToEdit(undefined);
    setAddWordOpen(true);
  };

  const handleExport = (format: 'json') => {
    exportList(currentList.id, format);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const importToList = async (file: File, listId: string) => {
    try {
      const { importList } = useVocabImportExport({ lists: [], setLists: () => {} });
      const importedList = await importList(file, 'temp');
      
      if (!importedList || !importedList.words.length) {
        return;
      }

      // Add each word to the list asynchronously
      const addWordPromises = importedList.words.map(async (word) => {
        await addWord(listId, {
          lng: word.lng,
          en: word.en,
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
    } catch (error) {
      console.error('Error importing to list:', error);
      toast({
        title: "Import error",
        description: "Failed to import words to the list. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importToList(file, currentList.id);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEditList = () => {
    setEditListName(currentList.name);
    setEditListDescription(currentList.description || '');
    setEditListDialogOpen(true);
  };
  
  const handleSaveListEdit = () => {
    if (editListName.trim()) {
      updateList(currentList.id, {
        name: editListName.trim(),
        description: editListDescription.trim() || undefined
      });
      toast({
        title: "List updated",
        description: `List "${editListName}" has been updated.`,
      });
      setEditListDialogOpen(false);
    }
  };
  
  const handleDeleteList = () => {
    setDeleteListDialogOpen(true);
  };
  
  const confirmDeleteList = () => {
    deleteList(currentList.id);
    toast({
      title: "List deleted",
      description: "The vocabulary list has been deleted.",
    });
    setDeleteListDialogOpen(false);
    goToHome();
  };

  const getNextReviewDate = (word: VocabWord, direction: PracticeDirection): Date | undefined => {
    return word.nextReview?.[direction];
  };

  const getDueByLanguage = () => {
    const now = new Date();
    let translateFromDue = 0;
    let translateToDue = 0;

    currentList?.words.forEach(word => {
      if (!getNextReviewDate(word, 'translateFrom') || getNextReviewDate(word, 'translateFrom')! <= now) {
        translateFromDue++;
      }
      if (!getNextReviewDate(word, 'translateTo') || getNextReviewDate(word, 'translateTo')! <= now) {
        translateToDue++;
      }
    });

    return { translateFromDue, translateToDue };
  };

  const getDueWordsCount = () => {
    const translateFromDueCount = getDueByLanguage().translateFromDue;
    const translateToDueCount = getDueByLanguage().translateToDue;
    return translateFromDueCount + translateToDueCount;
  };

  const formatNextReview = (date: Date | undefined): string => {
    if (!date) return 'Due now';
    
    const now = new Date();
    
    if (date <= now) {
      return 'Due now';
    }
    
    return `In ${formatDistanceToNow(date)}`;
  };

  const getDueStatusForWord = (word: VocabWord) => {
    const now = new Date();
    const translateFromDue = !getNextReviewDate(word, 'translateFrom') || getNextReviewDate(word, 'translateFrom')! <= now;
    const translateToDue = !getNextReviewDate(word, 'translateTo') || getNextReviewDate(word, 'translateTo')! <= now;
    return { translateFromDue, translateToDue };
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
          <span>{translateFromFormatted}</span>
        </div>
        <div className="flex items-center gap-1">
          <DirectionFlag direction="translateTo" size={14} />
          <span>{translateToFormatted}</span>
        </div>
      </div>
    );
  };

  const { translateFromDue, translateToDue } = getDueByLanguage();

  return (
    <div className="container py-6 max-w-3xl">
      <div className="mb-6 sm:flex sm:justify-between sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{currentList.name}</h1>
            <span>({translateFromDue + translateToDue} / {2 * currentList.words.length})</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7" 
              onClick={handleEditList}
              title="Edit list"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-destructive" 
              onClick={handleDeleteList}
              title="Delete list"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {currentList.description && (
            <p className="text-muted-foreground mt-1">{currentList.description}</p>
          )}
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <span className="flex items-center font-bold border border-transparent pr-4 pl-0 sm:pl-4 h-10 select-none">
            Practice:
          </span>
          <Button
            variant="default"
            onClick={() => goToPractice(currentList.id, 'translateFrom')}
            className={`relative ${translateFromDue === 0 ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-input hover:bg-accent'} px-2`}
            disabled={translateFromDue === 0}
          >
            <img src="/flags/en.ico" alt="EN" className="inline h-5" />
            <img src="/ra.webp" alt="arrow" className="inline h-5" />
            <img src={`/flags/${currentList.language}.ico`} alt={currentList.language.toUpperCase()} className="inline h-5" />
          </Button>
          <Button
            variant="default"
            onClick={() => goToPractice(currentList.id, 'translateTo')}
            className={`relative ${translateToDue === 0 ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-input hover:bg-accent'} px-2`}
            disabled={translateToDue === 0}
          >
            <img src={`/flags/${currentList.language}.ico`} alt={currentList.language.toUpperCase()} className="inline h-5" />
            <img src="/ra.webp" alt="arrow" className="inline h-5" />
            <img src="/flags/en.ico" alt="EN" className="inline h-5" />
          </Button>
          <Button onClick={() => goToHome()}>Home</Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6">
        <Input
          placeholder="Search words..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleAddWord}>Add Word</Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setShowReviewTimes(!showReviewTimes)}
          title={showReviewTimes ? "Hide review times" : "Show review times"}
          className="px-3"
        >
          ⏱️
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" title="List actions" className="px-3">
              <img src="/arrows.webp" alt="List actions" className="mx-3 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>List Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport('json')}>
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleImportClick}>
              <Upload className="h-4 w-4 mr-2" />
              Import Words
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
      </div>

      {filteredWords.length === 0 ? (
        <div className="text-center py-12">
          {searchTerm ? (
            <p>No words match your search.</p>
          ) : (
            <div className="space-y-4">
              <p>No words in this list yet.</p>
              <Button onClick={handleAddWord}>Add Your First Word</Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredWords.map((word) => (
            <div key={word.id} className="flex flex-col">
              <WordCard
                word={word}
                onEdit={() => handleEditWord(word)}
                onDelete={() => handleDeleteWord(word.id)}
                showReviewTimes={showReviewTimes}
              />
            </div>
          ))}
        </div>
      )}

      <AddWordForm 
        editWord={wordToEdit} 
        open={addWordOpen} 
        onOpenChange={setAddWordOpen} 
      />

      {/* Delete Word Dialog */}
      <AlertDialog open={!!wordToDelete} onOpenChange={() => setWordToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this word from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteWord}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit List Dialog */}
      <Dialog open={editListDialogOpen} onOpenChange={setEditListDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit List</DialogTitle>
            <DialogDescription>
              Update the details of your vocabulary list.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editName" className="text-right">
                Name
              </Label>
              <Input
                id="editName"
                value={editListName}
                onChange={(e) => setEditListName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editDescription" className="text-right">
                Description
              </Label>
              <Input
                id="editDescription"
                value={editListDescription}
                onChange={(e) => setEditListDescription(e.target.value)}
                className="col-span-3"
                placeholder="Optional description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditListDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveListEdit} disabled={!editListName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete List Dialog */}
      <AlertDialog open={deleteListDialogOpen} onOpenChange={setDeleteListDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vocabulary List</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vocabulary list? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteList} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VocabList;
