import { ProgressGauge } from '@shared/display/ProgressGauge';
import { PanelCard } from '@shared/display/PanelCard';

/**
 * Sales target gauge with completed / in-progress / pending legend.
 */
export function SalesTargetCard({ target, delay = 0, className }) {
  return (
    <PanelCard
      title="Sales Target"
      subtitle="Month to date progress"
      delay={delay}
      className={className}
      bodyClassName="flex items-center justify-center"
    >
      <ProgressGauge value={target.achieved} legend={target.legend} delay={delay + 150} />
    </PanelCard>
  );
}