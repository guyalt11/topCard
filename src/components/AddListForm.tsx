import { useState } from 'react';
import { VocabList } from '@/types/vocabulary';
import { useVocab } from '@/context/VocabContext';
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
  const [language, setLanguage] = useState(editList?.language || 'al');

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
      });

      // If edit was successful and we have a callback, call it with the updated list
      if (onSuccess) {
        const updatedList = {
          ...editList,
          name: name.trim(),
          description: description.trim() || undefined,
          language,
        };
        onSuccess(updatedList);
      }
    } else {
      // When creating a new list, use the description parameter correctly
      const newList = await addList(name.trim(), description.trim() || undefined, language);

      // If creation was successful and we have a callback, call it with the new list
      if (newList && onSuccess) {
        onSuccess(newList);
      }
    }

    // Reset form
    setName('');
    setDescription('');
    setLanguage('al');
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
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                <SelectItem value="al">Albanian</SelectItem>
                <SelectItem value="sa">Arabic</SelectItem>
                <SelectItem value="bd">Bengali</SelectItem>
                <SelectItem value="bg">Bulgarian</SelectItem>
                <SelectItem value="mm">Burmese</SelectItem>
                <SelectItem value="cn">Chinese</SelectItem>
                <SelectItem value="hr">Croatian</SelectItem>
                <SelectItem value="cz">Czech</SelectItem>
                <SelectItem value="dk">Danish</SelectItem>
                <SelectItem value="nl">Dutch</SelectItem>
                <SelectItem value="ee">Estonian</SelectItem>
                <SelectItem value="et">Ethiopian</SelectItem>
                <SelectItem value="fi">Finnish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="gr">Greek</SelectItem>
                <SelectItem value="he">Hebrew</SelectItem>
                <SelectItem value="in">Hindi</SelectItem>
                <SelectItem value="hu">Hungarian</SelectItem>
                <SelectItem value="is">Icelandic</SelectItem>
                <SelectItem value="id">Indonesian</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
                <SelectItem value="ja">Japanese</SelectItem>
                <SelectItem value="kh">Khmer</SelectItem>
                <SelectItem value="kr">Korean</SelectItem>
                <SelectItem value="la">Lao</SelectItem>
                <SelectItem value="lv">Latvian</SelectItem>
                <SelectItem value="lt">Lithuanian</SelectItem>
                <SelectItem value="mk">Macedonian</SelectItem>
                <SelectItem value="my">Malay</SelectItem>
                <SelectItem value="mn">Mongolian</SelectItem>
                <SelectItem value="no">Norwegian</SelectItem>
                <SelectItem value="ir">Persian</SelectItem>
                <SelectItem value="pl">Polish</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
                <SelectItem value="ro">Romanian</SelectItem>
                <SelectItem value="ru">Russian</SelectItem>
                <SelectItem value="rs">Serbian</SelectItem>
                <SelectItem value="sk">Slovak</SelectItem>
                <SelectItem value="si">Slovenian</SelectItem>
                <SelectItem value="so">Somali</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="tz">Swahili</SelectItem>
                <SelectItem value="se">Swedish</SelectItem>
                <SelectItem value="ph">Tagalog</SelectItem>
                <SelectItem value="th">Thai</SelectItem>
                <SelectItem value="tr">Turkish</SelectItem>
                <SelectItem value="ua">Ukrainian</SelectItem>
                <SelectItem value="pk">Urdu</SelectItem>
                <SelectItem value="vn">Vietnamese</SelectItem>
                <SelectItem value="za">Zulu</SelectItem>
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
