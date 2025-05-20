
import { Button } from "@/components/ui/button";

interface EmptyListsStateProps {
  onAddList: () => void;
}

const EmptyListsState = ({ onAddList }: EmptyListsStateProps) => {
  return (
    <div className="text-center py-12">
      <p className="mb-4">You don't have any vocabulary lists yet.</p>
      <Button onClick={onAddList}>Create Your First List</Button>
    </div>
  );
};

export default EmptyListsState;
