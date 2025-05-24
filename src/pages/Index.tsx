
import { useState, useTransition } from 'react';
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

const Index = () => {
  const { lists, exportList, importList, deleteList, updateList, getListById, addWord } = useVocab();
  const { goToList } = useAppNavigation();
  const { importList: importListFunc } = useVocabImportExport({ lists, setLists: async () => {} });

  // UI state
  const [addListOpen, setAddListOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  
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
      if (list) {
        setImportDialogOpen(false);
        // Select the list and navigate to it
        goToList(list.id);
      }
  };

  const handleExport = (id: string, format: 'json') => {
    exportList(id, format);
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
      />

      {lists.length === 0 ? (
        <EmptyListsState onAddList={handleAddList} />
      ) : (
        <VocabListGrid 
          lists={lists}
          onSelectList={(id) => goToList(id)}
          onEditList={handleEditList}
          onDeleteList={handleDeleteList}
          onExportList={exportList}
          onImportWords={handleImportWords}
          urlDirection=""
          listId=""
        />
      )}

      <AddListForm 
        open={addListOpen} 
        onOpenChange={setAddListOpen} 
        onSuccess={async (list) => {
          console.log('List created successfully:', list);
          // Wait a bit for the list to be fully saved
          await new Promise(resolve => setTimeout(resolve, 100));
          // Navigate to the list page
          goToList(list.id);
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
