
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await onImport(file, importListName);
      // Reset input value to allow importing the same file again
      if (fileInputRef.current) fileInputRef.current.value = '';
      onOpenChange(false);
      setImportListName('');
    } catch (error) {
      // Error is already handled by the import function
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
              Enter a name for the imported list and select a JSON or YAML file.
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
                placeholder="My Imported List"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleFileSelect} disabled={!importListName.trim()}>
              Select File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,.yaml,.yml"
        className="hidden"
      />
    </>
  );
};

export default ImportListDialog;
