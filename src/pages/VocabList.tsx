import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; // added useParams
import { useVocab } from '@/context/VocabContext';
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
  
  const navigate = useNavigate();
  const { listId } = useParams<{ listId: string }>();
  const { getListById, deleteWord, exportList, importList, deleteList, updateList } = useVocab();

  // Use id to get currentList
  const currentList = getListById(listId ?? '');

  const [searchTerm, setSearchTerm] = useState('');
  const [addWordOpen, setAddWordOpen] = useState(false);
  const [wordToEdit, setWordToEdit] = useState<VocabWord | undefined>(undefined);
  const [wordToDelete, setWordToDelete] = useState<string | null>(null);
  const [showReviewTimes, setShowReviewTimes] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Edit list state
  const [editListDialogOpen, setEditListDialogOpen] = useState(false);
  const [editListName, setEditListName] = useState('');
  const [editListDescription, setEditListDescription] = useState('');
  
  // Delete list state
  const [deleteListDialogOpen, setDeleteListDialogOpen] = useState(false);

  if (!currentList) {
    navigate('/');
    return null;
  }

  const filteredWords = currentList.words.filter(word => 
    word.german.toLowerCase().includes(searchTerm.toLowerCase()) ||
    word.english.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importList(file, file.name.split('.')[0] || 'Imported List'); // Fixed: added second parameter for list name
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
    navigate('/');
  };

  const getNextReviewDate = (word: VocabWord, direction: PracticeDirection): Date | undefined => {
    return word.nextReview?.[direction];
  };

  const getDueByLanguage = () => {
    const now = new Date();
    let germanDue = 0;
    let englishDue = 0;
  
    currentList.words.forEach(word => {
      if (!getNextReviewDate(word, 'germanToEnglish') || getNextReviewDate(word, 'germanToEnglish')! <= now) {
        germanDue++;
      }
      if (!getNextReviewDate(word, 'englishToGerman') || getNextReviewDate(word, 'englishToGerman')! <= now) {
        englishDue++;
      }
    });
  
    return { germanDue, englishDue };
  };
  
  const germanDueCount = getDueByLanguage().germanDue;
  const englishDueCount = getDueByLanguage().englishDue;

  const getDueWordsCount = (): number => {
    const { germanDue, englishDue } = getDueByLanguage();
    return germanDue + englishDue;
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
    const germanDue = !getNextReviewDate(word, 'germanToEnglish') || getNextReviewDate(word, 'germanToEnglish')! <= now;
    const englishDue = !getNextReviewDate(word, 'englishToGerman') || getNextReviewDate(word, 'englishToGerman')! <= now;
    return { germanDue, englishDue };
  };

  const isWordDueForReview = (word: VocabWord): boolean => {
    if (!word.nextReview) return true;
    const now = new Date();
    
    const germanToEnglishDue = !getNextReviewDate(word, 'germanToEnglish') || 
                                getNextReviewDate(word, 'germanToEnglish')! <= now;
    const englishToGermanDue = !getNextReviewDate(word, 'englishToGerman') || 
                                getNextReviewDate(word, 'englishToGerman')! <= now;
    
    return germanToEnglishDue || englishToGermanDue;
  };

  const getFormattedReviewTimes = (word: VocabWord): React.ReactNode => {
    const gToEFormatted = formatNextReview(getNextReviewDate(word, 'germanToEnglish'));
    const eToGFormatted = formatNextReview(getNextReviewDate(word, 'englishToGerman'));
    
    return (
      <div className="flex flex-col gap-1 items-start">
        <div className="flex items-center gap-1">
          <DirectionFlag direction="germanToEnglish" size={14} />
          <span>{gToEFormatted}</span>
        </div>
        <div className="flex items-center gap-1">
          <DirectionFlag direction="englishToGerman" size={14} />
          <span>{eToGFormatted}</span>
        </div>
      </div>
    );
  };

  const dueWordsCount = getDueWordsCount();

  return (
    <div className="container py-6 max-w-3xl">
      <div className="mb-6 sm:flex sm:justify-between sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{currentList.name}</h1>
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
            onClick={() => navigate(`/practice/englishToGerman`)}
            className={`relative ${englishDueCount === 0 ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-input hover:bg-accent'} px-2`}
            disabled={englishDueCount === 0}
          >
            <img src="/faviconGB.ico" alt="GB" className="inline h-5" />
            <img src="/ra.png" alt="arrow" className="inline h-5" />
            <img src="/faviconDE.ico" alt="DE" className="inline h-5" />
          </Button>
          <Button
            variant="default"
            onClick={() => navigate(`/practice/germanToEnglish`)}
            className={`relative ${germanDueCount === 0 ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-input hover:bg-accent'} px-2`}
            disabled={germanDueCount === 0}
          >
            <img src="/faviconDE.ico" alt="DE" className="inline h-5" />
            <img src="/ra.png" alt="arrow" className="inline h-5" />
            <img src="/faviconGB.ico" alt="GB" className="inline h-5" />
          </Button>
          <Button onClick={() => navigate('/')}>Home</Button>
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
            <Button variant="outline" size="icon" title="List actions">
              <Download className="mx-3 h-4 w-4" />
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
              />
              {showReviewTimes && (
                <div className={`text-right text-xs mt-1 ${isWordDueForReview(word) ? 'text-green-500 font-medium' : 'text-muted-foreground'}`}>
                  {getFormattedReviewTimes(word)}
                </div>
              )}
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
