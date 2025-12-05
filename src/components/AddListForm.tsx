import { useState } from 'react';
import { VocabList } from '@/types/vocabulary';
import { useVocab } from '@/context/VocabContext';
import { LANGUAGES } from '@/constants/languages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  onSuccess?: (list: VocabList) => void;
}

const AddListForm: React.FC<AddListFormProps> = ({
  editList,
  open,
  onOpenChange,
  onSuccess
}) => {
  const { addList, updateList } = useVocab();

  const [name, setName] = useState(editList?.name || '');
  const [description, setDescription] = useState(editList?.description || '');
  const [language, setLanguage] = useState(editList?.language || '');
  const [target, setTarget] = useState(editList?.target || 'en');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (editList) {
      await updateList(editList.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        language,
        target,
      });

      // If edit was successful and we have a callback, call it with the updated list
      if (onSuccess) {
        const updatedList = {
          ...editList,
          name: name.trim(),
          description: description.trim() || undefined,
          language,
          target,
        };
        onSuccess(updatedList);
      }
    } else {
      // When creating a new list, use the description parameter correctly
      const newList = await addList(name.trim(), description.trim() || undefined, language, target);

      // If creation was successful and we have a callback, call it with the new list
      if (newList && onSuccess) {
        onSuccess(newList);
      }
    }

    // Reset form
    setName('');
    setDescription('');
    setLanguage('');
    setTarget('en');
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
            <Label htmlFor="language">Translate From</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-tertiary">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto bg-tertiary">
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">To</Label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger className="bg-tertiary">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto bg-tertiary">
                {LANGUAGES.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
