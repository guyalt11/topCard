import { PracticeDirection } from '@/types/vocabulary';
import { useVocab } from '@/context/VocabContext';
import { getFlag } from './flags';

interface FlagIconProps {
  country: string; // Country code like 'de', 'en', 'fr', etc.
  className?: string;
  size?: number;
}

const FlagIcon: React.FC<FlagIconProps> = ({ country, className = "", size = 20 }) => {
  const FlagComponent = getFlag(country);

  if (!FlagComponent) {
    // Fallback if flag not found
    return <span className={className}>🏳️</span>;
  }

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        flexShrink: 0
      }}
    >
      <FlagComponent width={size * 1.5} height={size * 1.5} />
    </div>
  );
};

// Helper component to show direction with flags
export const DirectionFlag: React.FC<{
  direction: PracticeDirection;
  size?: number;
  className?: string;
  language?: string;
  target?: string;
}> = ({ direction, size = 20, className, language, target }) => {
  const { currentList } = useVocab();

  // Use provided language/target or fall back to currentList
  const listLanguage = language || currentList?.language || 'de';
  const listTarget = target || currentList?.target || 'en';

  return direction === 'translateFrom' ? (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <FlagIcon country={listTarget} size={size} />
    </div>
  ) : (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <FlagIcon country={listLanguage} size={size} />
    </div>
  );
};

export default FlagIcon;
