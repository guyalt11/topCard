import { useState } from 'react';
import { VocabList } from '@/types/vocabulary';
import { useVocab } from '@/context/VocabContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AddListFormProps {
  editList?: VocabList;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddListForm: React.FC<AddListFormProps> = ({ 
  editList, 
  open, 
  onOpenChange 
}) => {
  const { addList, updateList } = useVocab();
  
  const [name, setName] = useState(editList?.name || '');
  const [description, setDescription] = useState(editList?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    if (editList) {
      updateList(editList.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
    } else {
      addList(name.trim()); // Fixed: removed second argument
    }

    // Reset form
    setName('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editList ? 'Edit List' : 'Create New List'}</DialogTitle>
          <DialogDescription>
            {editList 
              ? 'Update your vocabulary list details.' 
              : 'Create a new vocabulary list to organize your words.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">List Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Food Vocabulary"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short description of this list..."
            />
          </div>
          
          <DialogFooter>
            <Button type="submit">
              {editList ? 'Update List' : 'Create List'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddListForm;
