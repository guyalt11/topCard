
import { PracticeDirection } from '@/types/vocabulary';

interface FlagIconProps {
  country: 'germany' | 'uk';
  className?: string;
  size?: number;
}

const FlagIcon: React.FC<FlagIconProps> = ({ country, className = "", size = 16 }) => {
  if (country === 'germany') {
    return (
      <img src="/faviconDE.ico" alt="DE" className="inline h-5" />
    );
  } else if (country === 'uk') {
    return (
      <img src="/faviconGB.ico" alt="GB" className="inline h-5" />
    );
  }
};

// Helper component to show direction with flags
export const DirectionFlag: React.FC<{direction: PracticeDirection, size?: number, className?: string}> = ({ direction, size, className }) => {
  return direction === 'germanToEnglish' ? (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <FlagIcon country="germany" size={size} />
    </div>
  ) : (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <FlagIcon country="uk" size={size} />
    </div>
  );
};

export default FlagIcon;
