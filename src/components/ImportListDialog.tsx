
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ImportListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: File, listName: string) => Promise<void>;
}

const ImportListDialog = ({ open, onOpenChange, onImport }: ImportListDialogProps) => {
  const [importListName, setImportListName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCreate = async () => {
    if (!selectedFile || !importListName.trim()) return;

    try {
      // Store values and reset state
      const file = selectedFile;
      const name = importListName;
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setImportListName('');
      onOpenChange(false);
      
      // Now import after dialog is closed
      await onImport(file, name);
    } catch (error) {
      // Error is already handled by the import function
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Vocabulary List</DialogTitle>
            <DialogDescription>
              Enter a name for the imported list and select a JSON file.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={importListName}
                onChange={(e) => setImportListName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="flex items-center gap-4">
              <Button variant="secondary" onClick={handleFileSelect}>
                Select File
              </Button>
              {selectedFile && (
                <span className="text-sm text-muted-foreground">
                  {selectedFile.name}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = '';
              onOpenChange(false);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={!importListName.trim() || !selectedFile}
            >
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />
    </>
  );
};

export default ImportListDialog;
