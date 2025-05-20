
import { Gender } from '@/types/vocabulary';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface GenderTagProps {
  gender: Gender;
  className?: string;
  showTooltip?: boolean;
}

const GenderTag: React.FC<GenderTagProps> = ({ gender, className, showTooltip = false }) => {
  const tooltipContent = {
    m: 'Masculine (der)',
    f: 'Feminine (die)',
    n: 'Neuter (das)'
  };

  const tag = (
    <span className={`gender-tag gender-tag-${gender} ${className || ''}`}>
      {gender.toUpperCase()}
    </span>
  );

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {tag}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent[gender]}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return tag;
};

export default GenderTag;
