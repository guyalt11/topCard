
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ListActionsProps {
  listId: string;
  onExport: (id: string, format: 'json') => void;
  onImport: (file: File) => Promise<void>;
}

const ListActions = ({ listId, onExport, onImport }: ListActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="List actions">
          <img src="/arrows.webp" alt="List actions" className="mx-3 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>List Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onExport(listId, 'json')}>
          Export as JSON
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              await onImport(file);
            }
          };
          input.click();
        }}>
          <Upload className="h-4 w-4 mr-2" />
          Import Words
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    
  );
};

export default ListActions;
