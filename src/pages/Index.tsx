
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocab } from '@/context/VocabContext';
import { useVocabImportExport } from '@/hooks/useVocabImportExport';
import { toast } from "@/components/ui/use-toast";
import AddListForm from '@/components/AddListForm';
import VocabListGrid from '@/components/VocabListGrid';
import ListsHeader from '@/components/ListsHeader';
import EmptyListsState from '@/components/EmptyListsState';
import ImportListDialog from '@/components/ImportListDialog';
import EditListDialog from '@/components/EditListDialog';
import DeleteListDialog from '@/components/DeleteListDialog';
import { VocabList } from '@/types/vocabulary';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useEffect, useRef } from 'react';

const Index = () => {
  const { lists, exportList, importList, deleteList, updateList, getListById, addWord } = useVocab();
  const navigate = useNavigate();
  const { goToList } = useAppNavigation();
  const { importList: importListFunc } = useVocabImportExport({ lists, setLists: async () => {} });
  const [showEmptyState, setShowEmptyState] = useState(false);
  const listsRef = useRef(lists);
  
  useEffect(() => {
    listsRef.current = lists;
    if (lists.length === 0) {
      const timer = setTimeout(() => setShowEmptyState(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowEmptyState(false);
    }
  }, [lists]);

  // UI state
  const [addListOpen, setAddListOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [showOnlyDue, setShowOnlyDue] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Edit list state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<VocabList | null>(null);
  
  // Delete list state
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Handlers
  const handleAddList = () => {
    setAddListOpen(true);
  };

  const handleImportClick = () => {
    setImportDialogOpen(true);
  };

  const handleImport = async (file: File, listName: string) => {
    const list = await importList(file, listName);
    const maxRetries = 3;
    let retryCount = 0;
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    while (retryCount < maxRetries) {
      const allListIds = listsRef.current.map(list => list.id);

      const exists = listsRef.current.some(l => l.id === list.id);
      if (exists) {
        setImportDialogOpen(false);
        navigate(`/list/${list.id}`);
        return;
      }
      retryCount++;
      await delay(300);
    }

    toast({
      title: "Error",
      description: "Failed to navigate to list after import. Please try again.",
      variant: "destructive",
    });
  };
  
  const handleEditList = (id: string) => {
    const list = lists.find(l => l.id === id);
    if (list) {
      setSelectedList(list);
      setEditDialogOpen(true);
    }
  };
  
  const handleSaveEdit = (id: string, updates: Partial<VocabList>) => {
    updateList(id, updates);
    toast({
      title: "List updated",
      description: `List "${updates.name}" has been updated.`,
    });
  };
  
  const handleDeleteList = (id: string) => {
    setDeleteListId(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteList = () => {
    if (deleteListId) {
      deleteList(deleteListId);
      toast({
        title: "List deleted",
        description: "The vocabulary list has been deleted.",
      });
      setDeleteDialogOpen(false);
    }
  };

  const handleImportWords = async (listId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const list = getListById(listId);
        if (list) {
          const importedList = await importListFunc(file, list.name);
          if (importedList && importedList.words) {
            for (const word of importedList.words) {
              await addWord(listId, word);
            }
            toast({
              title: "Success",
              description: `Successfully imported ${importedList.words.length} words`,
            });
          }
        }
      }
    };
    input.click();
  };

  return (
    <div className="container py-6 max-w-3xl">
      <ListsHeader 
        onAddList={handleAddList} 
        onImport={handleImportClick}
        lists={lists}
        onFilterChange={setShowOnlyDue}
        showOnlyDue={showOnlyDue}
        onSearchChange={setSearchQuery}
      />

      {showEmptyState ? (
        <EmptyListsState onAddList={handleAddList} />
      ) : (
        <VocabListGrid 
          lists={lists.filter(list => list.name.toLowerCase().includes(searchQuery.toLowerCase()))}
          onSelectList={goToList}
          onEditList={handleEditList}
          onDeleteList={handleDeleteList}
          onExportList={exportList}
          onImportWords={async (file, listName) => {
          await importListFunc(file, listName);
        }}
          urlDirection=""
          listId=""
          showOnlyDue={showOnlyDue}
        />
      )}

      <AddListForm 
        open={addListOpen} 
        onOpenChange={setAddListOpen} 
        onSuccess={async (list) => {
          console.log('Index: List created successfully:', listsRef.current);
        
          const maxRetries = 3;
          let retryCount = 0;
        
          const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
        
          while (retryCount < maxRetries) {
            const exists = listsRef.current.some(list => list.id === listsRef.current?.[0].id);
            console.log('onSuccess retry:', listsRef.current);
            if (exists) {
              console.log('Index: List found in backend, navigating to:', `/list/${listsRef.current?.[0].id}`);
              navigate(`/list/${list.id}`);
              return;
            }
        
            console.log(`Index: Retry ${retryCount + 1}/${maxRetries} - List not yet in context`);
            retryCount++;
            await delay(300);
          }
        
          console.error('Index: Failed to find list after retries');
          toast({
            title: "Error",
            description: "Failed to navigate to list. Please try again.",
            variant: "destructive",
          });
        }}
      />

      <ImportListDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
      />
      
      <EditListDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleSaveEdit}
        list={selectedList}
      />
      
      <DeleteListDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDeleteList}
      />
    </div>
  );
};

export default Index;
