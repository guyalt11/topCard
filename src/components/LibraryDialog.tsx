import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useSharedLists } from '@/hooks/useSharedLists';
import { useVocab } from '@/context/VocabContext';
import { toast } from '@/components/ui/use-toast';
import FlagIcon from '@/components/FlagIcon';
import { VocabList } from '@/types/vocabulary';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface LibraryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const LibraryDialog = ({ open, onOpenChange }: LibraryDialogProps) => {
    const { sharedLists, isLoading } = useSharedLists();
    const { importList } = useVocab();
    const [selectedLanguage, setSelectedLanguage] = useState<string>('any');
    const [selectedListIds, setSelectedListIds] = useState<Set<string>>(new Set());
    const [expandedListId, setExpandedListId] = useState<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    // Get unique languages from shared lists
    const availableLanguages = useMemo(() => {
        const languages = new Set(sharedLists.map(list => list.language));
        return Array.from(languages).sort();
    }, [sharedLists]);

    // Filter lists by selected language
    const filteredLists = useMemo(() => {
        if (selectedLanguage === 'any') {
            return sharedLists;
        }
        return sharedLists.filter(list => list.language === selectedLanguage);
    }, [sharedLists, selectedLanguage]);

    const handleCheckboxChange = (listId: string, checked: boolean) => {
        const newSelected = new Set(selectedListIds);
        if (checked) {
            newSelected.add(listId);
        } else {
            newSelected.delete(listId);
        }
        setSelectedListIds(newSelected);
    };

    const handleLanguageChange = (language: string) => {
        setSelectedLanguage(language);
        setSelectedListIds(new Set()); // Clear all selections when language changes
    };

    const toggleExpanded = (listId: string) => {
        setExpandedListId(expandedListId === listId ? null : listId);
    };

    const handleAddLists = async () => {
        if (selectedListIds.size === 0) {
            toast({
                title: 'No lists selected',
                description: 'Please select at least one list to add.',
                variant: 'destructive',
            });
            return;
        }

        setIsImporting(true);
        let successCount = 0;
        let errorCount = 0;

        for (const listId of selectedListIds) {
            const list = sharedLists.find(l => l.id === listId);
            if (!list) continue;

            try {
                // Convert the list to JSON format - ensure words array is properly included
                const listData = {
                    name: list.name,
                    description: list.description || '',
                    language: list.language,
                    target: list.target || 'en',
                    words: list.words.map(word => ({
                        transl: word.transl,
                        origin: word.origin,
                        gender: word.gender || null,
                        notes: word.notes || null
                    }))
                };

                // Create a blob and file from the data
                const blob = new Blob([JSON.stringify(listData)], { type: 'application/json' });
                const file = new File([blob], `${list.name}.json`, { type: 'application/json' });

                // Import the list
                await importList(file, list.name);
                successCount++;
            } catch (error) {
                console.error(`Error importing list ${list.name}:`, error);
                errorCount++;
            }
        }

        setIsImporting(false);
        setSelectedListIds(new Set());

        if (successCount > 0) {
            toast({
                title: 'Lists imported',
                description: `Successfully imported ${successCount} list${successCount > 1 ? 's' : ''}.`,
            });
        }

        if (errorCount > 0) {
            toast({
                title: 'Import errors',
                description: `Failed to import ${errorCount} list${errorCount > 1 ? 's' : ''}.`,
                variant: 'destructive',
            });
        }

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Shared Lists Library</DialogTitle>
                    <DialogDescription>
                        Import lists shared by other users.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                    {/* Language Filter */}
                    <div className="flex items-center gap-2 pt-1">
                        <Label htmlFor="language-filter">Language:</Label>
                        <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                            <SelectTrigger id="language-filter" className="w-[180px]">
                                <SelectValue placeholder="Any" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="any">Any</SelectItem>
                                {availableLanguages.map(lang => (
                                    <SelectItem key={lang} value={lang}>
                                        {lang.toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Lists */}
                    <div className="flex-1 overflow-y-auto border rounded-md p-2 space-y-2">
                        {isLoading ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Loading shared lists...
                            </div>
                        ) : filteredLists.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No shared lists available.
                            </div>
                        ) : (
                            filteredLists.map(list => (
                                <div key={list.id} className="border rounded-md overflow-hidden">
                                    <div className="flex items-center gap-3 p-2 hover:bg-muted/50">
                                        <button
                                            onClick={() => toggleExpanded(list.id)}
                                            className="p-1 hover:bg-muted rounded transition-transform duration-200"
                                            style={{
                                                transform: expandedListId === list.id ? 'rotate(0deg)' : 'rotate(0deg)'
                                            }}
                                        >
                                            {expandedListId === list.id ? (
                                                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                                            )}
                                        </button>
                                        <FlagIcon country={list.language} size={20} />
                                        <div
                                            className="flex-1 cursor-pointer"
                                            onClick={() => toggleExpanded(list.id)}
                                        >
                                            <div className="font-medium">{list.name}</div>
                                            {list.description && (
                                                <div className="text-sm text-muted-foreground line-clamp-1">
                                                    {list.description}
                                                </div>
                                            )}
                                            <div className="text-xs text-muted-foreground">
                                                {list.words.length} words
                                            </div>
                                        </div>
                                        <Checkbox
                                            id={`list-${list.id}`}
                                            checked={selectedListIds.has(list.id)}
                                            onCheckedChange={(checked) => handleCheckboxChange(list.id, checked as boolean)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>

                                    {/* Expandable word list with smooth animation */}
                                    <div
                                        className="overflow-hidden transition-all duration-300 ease-in-out"
                                        style={{
                                            maxHeight: expandedListId === list.id ? '15rem' : '0',
                                            opacity: expandedListId === list.id ? 1 : 0
                                        }}
                                    >
                                        <div className="bg-muted/30 p-3 border-t overflow-y-auto" style={{ maxHeight: '15rem' }}>
                                            <div className="space-y-1">
                                                {list.words.length === 0 ? (
                                                    <div className="text-sm text-muted-foreground text-center py-2">
                                                        No words in this list
                                                    </div>
                                                ) : (
                                                    list.words.map((word, index) => (
                                                        <div
                                                            key={index}
                                                            className="text-sm flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded"
                                                        >
                                                            <span className="font-medium">{word.origin}</span>
                                                            <span className="text-muted-foreground">|</span>
                                                            <span>{word.transl}</span>
                                                            {word.gender && (
                                                                <span className="text-xs text-muted-foreground ml-auto">
                                                                    ({word.gender})
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddLists}
                        disabled={selectedListIds.size === 0 || isImporting}
                    >
                        {isImporting ? 'Adding...' : `Add ${selectedListIds.size > 0 ? `(${selectedListIds.size})` : ''}`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default LibraryDialog;
