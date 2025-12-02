import { useState, useEffect } from 'react';
import { VocabWord, Gender } from '@/types/vocabulary';
import { useVocab } from '@/context/VocabContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, AlertCircle, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { translateWord } from '@/services/translationService';

interface AddWordFormProps {
  editWord?: VocabWord;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddWordForm: React.FC<AddWordFormProps> = ({
  editWord,
  open,
  onOpenChange
}) => {
  const { addWord, updateWord, currentList } = useVocab();

  // Initialize form state with existing word data if editing
  const [origin, setOrigin] = useState('');
  const [transl, setTransl] = useState('');
  const [gender, setGender] = useState<Gender | undefined>();
  const [notes, setNotes] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  useEffect(() => {
    if (editWord) {
      setOrigin(editWord.origin);
      setTransl(editWord.transl);
      setGender(editWord.gender);
      setNotes(editWord.notes || '');
    } else {
      setOrigin('');
      setTransl('');
      setGender(undefined);
      setNotes('');
    }
  }, [editWord]);

  useEffect(() => {
    // Only auto-translate for specific languages with translation support
    // Languages with m/f/n gender: de, is, bg, hr, cz, gr, mk, pl, ro, ru, rs, sk, si, ua
    // Languages with m/f gender: he, al, sa, fr, in, it, lv, lt, pt, es, pk
    // Languages with c/n gender: se, dk, no, nl
    const languagesWithTranslation = ['de', 'he', 'is', 'bg', 'hr', 'cz', 'gr', 'mk', 'pl', 'ro', 'ru', 'rs', 'sk', 'si', 'ua', 'al', 'sa', 'fr', 'in', 'it', 'lv', 'lt', 'pt', 'es', 'pk', 'se', 'dk', 'no', 'nl'];
    const currentLanguage = currentList?.language || 'de';

    if (!languagesWithTranslation.includes(currentLanguage)) {
      return; // Skip translation for other languages
    }

    const debounceTimeout = setTimeout(async () => {
      if (origin.trim().length >= 2 && !editWord) {
        setIsTranslating(true);
        setTranslateError(null);

        try {
          const result = await translateWord(origin, currentLanguage);

          if (result.translation) {
            setTransl(result.translation);
          }

          setGender(result.gender);
        } catch (error) {
          console.error("Translation error:", error);
          setTranslateError(" ");
        } finally {
          setIsTranslating(false);
        }
      }
    }, 800); // Debounce for 800ms

    return () => clearTimeout(debounceTimeout);
  }, [origin, editWord, currentList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentList) return;

    if (!origin.trim() || !transl.trim()) {
      toast({
        title: "Error",
        description: "Both language and English fields are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const wordData = {
        origin,
        transl,
        gender,
        notes,
        ...(editWord ? { id: editWord.id } : { list_id: currentList.id })
      };

      if (editWord) {
        await updateWord(editWord.id, wordData);
        onOpenChange(false);
        toast({
          title: "Success",
          description: "Word updated successfully.",
        });
      } else {
        await addWord(currentList.id, wordData);
        onOpenChange(false);
        toast({
          title: "Success",
          description: "Word added successfully.",
        });
      }

      // Clear form state after successful submission
      setOrigin('');
      setTransl('');
      setGender(undefined);
      setNotes('');
    } catch (error) {
      console.error('Error saving word:', error);
      toast({
        title: "Error",
        description: "Failed to save word. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenChange(false);
  };

  const clearGender = () => {
    setGender(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editWord ? 'Edit Word' : 'Add New Word'}</DialogTitle>
          <DialogDescription>
            {editWord
              ? 'Update this word in your vocabulary list.'
              : 'Fill in the details to add a new word to your vocabulary list.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="origin">{currentList?.language.toUpperCase() || 'Target Language'} Word</Label>
            <div className="relative">
              <Input
                id="origin"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder={`e.g. ${currentList?.language === 'de' ? 'Apfel' : 'word'}`}
                required
                autoFocus
              />
              {isTranslating && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            {isTranslating && (
              <p className="text-xs text-muted-foreground">
                Translating...
              </p>
            )}
            {translateError && (
              <Alert variant="destructive" className="p-0 text-orange-800 border border-transparent">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm">Translation Failed</AlertTitle>
                </div>
                <AlertDescription>
                  {translateError}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Only show gender selection for languages with gender support */}
          {/* Languages with m/f/n: de, is, bg, hr, cz, gr, mk, pl, ro, ru, rs, sk, si, ua */}
          {/* Languages with m/f: he, al, sa, fr, in, it, lv, lt, pt, es, pk */}
          {/* Languages with c/n: se, dk, no, nl */}
          {['de', 'he', 'is', 'bg', 'hr', 'cz', 'gr', 'mk', 'pl', 'ro', 'ru', 'rs', 'sk', 'si', 'ua', 'al', 'sa', 'fr', 'in', 'it', 'lv', 'lt', 'pt', 'es', 'pk', 'se', 'dk', 'no', 'nl'].includes(currentList?.language || '') && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label>Gender (for nouns)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearGender}
                    className="h-8 flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear</span>
                  </Button>
                </div>
              </div>
              <RadioGroup
                value={gender || ""}
                onValueChange={(value) => value ? setGender(value as Gender) : setGender(undefined)}
                className="flex space-x-3"
              >
                {/* Only show m/f When needed */}
                {!['se', 'dk', 'no', 'nl'].includes(currentList?.language || '') && (
                  <>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="m" id="male" />
                      <Label htmlFor="male" className="gender-tag-m px-2 rounded">m.</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="f" id="female" />
                      <Label htmlFor="female" className="gender-tag-f px-2 rounded">f.</Label>
                    </div>
                  </>
                )}
                {/* Only show neuter When needed */}
                {(['de', 'is', 'bg', 'hr', 'cz', 'gr', 'mk', 'pl', 'ro', 'ru', 'rs', 'sk', 'si', 'ua', 'se', 'dk', 'no', 'nl'].includes(currentList?.language || '')) && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="n" id="neutral" />
                    <Label htmlFor="neutral" className="gender-tag-n px-2 rounded">n.</Label>
                  </div>
                )}
                {/* Only show common for When needed*/}
                {['se', 'dk', 'no', 'nl'].includes(currentList?.language || '') && (
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="c" id="common" />
                    <Label htmlFor="common" className="gender-tag-c px-2 rounded">c.</Label>
                  </div>
                )}
              </RadioGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="transl">Translation</Label>
            <Input
              id="transl"
              value={transl}
              onChange={(e) => setTransl(e.target.value)}
              placeholder="e.g. apple"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes here..."
            />
          </div>

          <DialogFooter>
            <Button type="submit">
              {editWord ? 'Update Word' : 'Add Word'}
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWordForm;
