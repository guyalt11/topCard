
import { useState } from 'react';
import { useVocab } from '@/context/VocabContext';
import { toast } from "@/components/ui/use-toast";
import AddListForm from '@/components/AddListForm';
import VocabListGrid from '@/components/VocabListGrid';
import ListsHeader from '@/components/ListsHeader';
import EmptyListsState from '@/components/EmptyListsState';
import ImportListDialog from '@/components/ImportListDialog';
import EditListDialog from '@/components/EditListDialog';
import DeleteListDialog from '@/components/DeleteListDialog';
import { VocabList } from '@/types/vocabulary';

const Index = () => {
  const { lists, selectList, exportList, importList, deleteList, updateList } = useVocab();
  
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
    await importList(file, listName);
  };

  const handleExport = (id: string, format: 'json' | 'yaml') => {
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
          onSelectList={selectList}
          onEditList={handleEditList}
          onDeleteList={handleDeleteList}
          onExportList={handleExport}
        />
      )}

      <AddListForm 
        open={addListOpen} 
        onOpenChange={setAddListOpen} 
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
