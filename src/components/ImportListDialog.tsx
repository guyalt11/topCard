
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingOverlay from "@/components/LoadingOverlay";

interface ImportListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: File, listName: string) => Promise<void>;
}

const ImportListDialog = ({ open, onOpenChange, onImport }: ImportListDialogProps) => {
  const [importListName, setImportListName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useFileNameFromFile, setUseFileNameFromFile] = useState(false);
  const [fileListName, setFileListName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Try to extract the list name from the JSON file
      try {
        const text = await file.text();
        const json = JSON.parse(text);
        if (json.name && typeof json.name === 'string') {
          setFileListName(json.name);
          // If checkbox is already checked, update the import name
          if (useFileNameFromFile) {
            setImportListName(json.name);
          }
        } else {
          setFileListName('');
        }
      } catch (error) {
        console.error('Failed to parse JSON file:', error);
        setFileListName('');
      }
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setUseFileNameFromFile(checked);
    if (checked && fileListName) {
      setImportListName(fileListName);
    } else if (!checked) {
      setImportListName('');
    }
  };

  const handleCreate = async () => {
    if (!selectedFile || !importListName.trim()) return;

    try {
      setIsImporting(true);
      // Store values
      const file = selectedFile;
      const name = importListName;

      // Close dialog first
      onOpenChange(false);

      // Import with loading overlay visible
      await onImport(file, name);

      // Reset state after successful import
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setImportListName('');
      setUseFileNameFromFile(false);
      setFileListName('');
    } catch (error) {
      // Error is already handled by the import function
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUseFileNameFromFile(false);
      setFileListName('');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      {isImporting && <LoadingOverlay message="Importing list..." />}
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
                className="col-span-3 bg-dark"
                disabled={useFileNameFromFile}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-start-2 col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="use-file-name"
                  checked={useFileNameFromFile}
                  onCheckedChange={handleCheckboxChange}
                />
                <label
                  htmlFor="use-file-name"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Use name from file {fileListName && `(${fileListName})`}
                </label>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="default" className="" onClick={handleFileSelect}>
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
