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
import { Download, Upload, Pencil, Trash2, Share2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import FlagIcon, { DirectionFlag } from '@/components/FlagIcon';
import { ImportExportArrow, RightArrow } from '@/components/Icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
    word.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.transl.toLowerCase().includes(searchTerm.toLowerCase())
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
      const { importList } = useVocabImportExport({ lists: [], setLists: () => { } });
      const importedList = await importList(file, 'temp');

      if (!importedList || !importedList.words.length) {
        return;
      }

      // Add each word to the list asynchronously
      const addWordPromises = importedList.words.map(async (word) => {
        await addWord(listId, {
          origin: word.origin,
          transl: word.transl,
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
    if (!date) return 'Ready for review';

    const now = new Date();

    if (date <= now) {
      return 'Ready for review';
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
      <div className="mb-4 sm:flex sm:justify-between sm:items-center">
        <div className="flex gap-2 mr-0 sm:mr-4">
          <Button onClick={() => goToHome()}>Home</Button>
          <Button
            variant="default"
            onClick={() => goToPractice(currentList.id, 'translateFrom')}
            className={`relative overflow-hidden truncate transition-all bg-secondary ${translateFromDue === 0 ? 'cursor-not-allowed' : ''} px-3`}
            disabled={translateFromDue === 0}
          >
            <FlagIcon country={currentList.target || 'en'} size={20} />
            <RightArrow size={20} className="text-foreground" />
            <FlagIcon country={currentList.language} size={20} />
          </Button>
          <Button
            variant="default"
            onClick={() => goToPractice(currentList.id, 'translateTo')}
            className={`relative overflow-hidden truncate transition-all bg-secondary ${translateToDue === 0 ? 'cursor-not-allowed' : ''} px-3`}
            disabled={translateToDue === 0}
          >
            <FlagIcon country={currentList.language} size={20} />
            <RightArrow size={20} className="text-foreground" />
            <FlagIcon country={currentList.target || 'en'} size={20} />
          </Button>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{currentList.name}</h1>
            <span>({currentList.words.length} words)</span>
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
            <p className="text-tertiary-foreground mt-2 max-w-lg line-clamp-3">
              {currentList.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center mb-6">
        <div className="relative max-w-sm w-full hidden md:block">
          <Input
            placeholder="Search words..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-8 bg-dark"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Clear"
            >
              ×
            </button>
          )}
        </div>

        <Button className="ml-0 md:ml-4" onClick={handleAddWord}>Add Word</Button>
        <Button
          className="ml-4"
          variant="outline"
          size="icon"
          onClick={() => setShowReviewTimes(!showReviewTimes)}
          title={showReviewTimes ? "Hide review times" : "Show review times"}
        >
          ⏱️
        </Button>
        <div className="ml-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" title="List actions" className="px-3">
                <ImportExportArrow size={16} className="mx-3" />
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
        </div>

        <div className="flex items-center gap-2 bg-tertiary/50 px-2 py-1 rounded-md ml-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-share-fill"
            viewBox="0 0 16 16"
          >
            <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5" />
          </svg>
          <Switch
            id="share-toggle"
            checked={currentList.share || false}
            onCheckedChange={(checked) => {
              updateList(currentList.id, { share: checked });
              toast({
                title: checked ? "List shared" : "List unshared",
                description: checked ? "This list is now shared." : "This list is no longer shared.",
              });
            }}
          />
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
      </div>

      <div className="relative max-w-sm w-full mb-6 block md:hidden">
        <Input
          placeholder="Search words..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pr-8 bg-secondary"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            title="Clear"
          >
            ×
          </button>
        )}
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
            <AlertDialogAction onClick={confirmDeleteList} className="bg-danger text-danger-foreground hover:bg-danger/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VocabList;
