
import { PracticeDirection } from '@/types/vocabulary';

interface FlagIconProps {
  country: 'lng' | 'en';
  className?: string;
  size?: number;
}

const FlagIcon: React.FC<FlagIconProps> = ({ country, className = "", size = 16 }) => {
  if (country === 'lng') {
    return (
      <img src="/flags/de.ico" alt="DE" className="inline h-5" />
    );
  } else if (country === 'en') {
    return (
      <img src="/flags/en.ico" alt="GB" className="inline h-5" />
    );
  }
};

// Helper component to show direction with flags
export const DirectionFlag: React.FC<{direction: PracticeDirection, size?: number, className?: string}> = ({ direction, size, className }) => {
  return direction === 'translateFrom' ? (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <FlagIcon country="en" size={size} />
    </div>
  ) : (
    <div className={`flex items-center gap-1 ${className || ''}`}>
      <FlagIcon country="lng" size={size} />
    </div>
  );
};

export default FlagIcon;
