
import { useState, useTransition } from 'react';
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
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { lists, selectList, exportList, importList, deleteList, updateList } = useVocab();
  const navigate = useNavigate();
  
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
      const success = importList(file, listName);
      if (success) {
        setImportDialogOpen(false);
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
          urlDirection="germanToEnglish"
        />
      )}

      <AddListForm 
        open={addListOpen} 
        onOpenChange={setAddListOpen} 
        onSuccess={async (list) => {
          console.log('List created successfully:', list);
          // Wait a bit for the list to be fully saved
          await new Promise(resolve => setTimeout(resolve, 100));
          // Select the list first
          selectList(list.id);
          // Navigate to the list page
          navigate(`/list/${list.id}`);
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
