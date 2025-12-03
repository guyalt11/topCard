
import { Button } from "@/components/ui/button";

interface EmptyListsStateProps {
  onAddList: () => void;
  onLibrary: () => void;
}

const EmptyListsState = ({ onAddList, onLibrary }: EmptyListsStateProps) => {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl mb-10">Welcome to Wörtli!</h1>
      <Button title="Create first list" onClick={onAddList}>Create your first list</Button>
      <p className="my-2">- or -</p>
      <Button title="Browse shared lists" onClick={onLibrary}>Browse our library lists</Button>
    </div>
  );
};

export default EmptyListsState;
