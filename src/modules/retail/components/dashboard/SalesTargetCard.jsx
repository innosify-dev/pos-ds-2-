import { ProgressGauge } from '@shared/display/ProgressGauge';
import { PanelCard } from '@shared/display/PanelCard';

/**
 * Sales target gauge with completed / in-progress / pending legend.
 */
export function SalesTargetCard({ target, delay = 0, className, dense = false }) {
  return (
    <PanelCard
      title={dense ? 'Sales target' : 'Sales Target'}
      subtitle="Month to date, against a demo target"
      delay={delay}
      className={className}
      dense={dense}
      bodyClassName="flex items-center justify-center"
    >
      <ProgressGauge value={target.achieved} legend={target.legend} delay={delay + 150} size={dense ? 108 : 168} thickness={dense ? 10 : 14} />
    </PanelCard>
  );
}