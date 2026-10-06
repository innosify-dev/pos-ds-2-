import { useState } from 'react';
import { AnimatedAreaChart } from '@shared/display/AnimatedAreaChart';
import { ProgressGauge } from '@shared/display/ProgressGauge';
import { PanelCard } from '@shared/display/PanelCard';
import { StatCard } from '@modules/retail/components/dashboard/StatCard';
import { ActivityFeed } from '@modules/retail/components/analytics/ActivityFeed';
import { TopContributors } from '@modules/retail/components/analytics/TopContributors';
import {
  activityFeed,
  analyticsStats,
  categoryShare,
  revenueRanges,
  topContributors,
} from '@modules/retail/data';

const currency = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;

function formatStat(stat) {
  return (value) => `${stat.prefix ?? ''}${Math.round(value).toLocaleString('en-IN')}${stat.suffix ?? ''}`;
}

/**
 * Analytics screen — revenue trend with range switching, category
 * breakdown gauge, activity feed and top contributors.
 */
export function AnalyticsScreen() {
  const [range, setRange] = useState(revenueRanges[0].id);

  return (
    <div className="flex flex-col gap-4 bg-surface-elevated/40 p-5">
      <header className="animate-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-content">Analytics</h2>
          <p className="mt-0.5 text-xs text-content-muted">
            Revenue, customer and staff performance across your store.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analyticsStats.map((stat, index) => (
          <StatCard key={stat.id} {...stat} index={index} format={formatStat(stat)} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PanelCard
          title="Revenue"
          subtitle="Switch the period to compare performance"
          className="lg:col-span-2"
          delay={180}
          actions={
            <span className="rounded-full bg-accent-muted px-2.5 py-1 text-[10px] font-medium text-accent">
              Throughput
            </span>
          }
        >
          <AnimatedAreaChart ranges={revenueRanges} activeRange={range} onRangeChange={setRange} height={220} />
        </PanelCard>

        <PanelCard
          title="Sales by Category"
          subtitle="Share of total revenue"
          delay={240}
          className="lg:col-span-1"
          bodyClassName="flex justify-center"
        >
          <ProgressGauge value={categoryShare.achieved} legend={categoryShare.legend} delay={320} size={150} />
        </PanelCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ActivityFeed items={activityFeed} delay={300} />
        <TopContributors items={topContributors} delay={360} />
      </div>
    </div>
  );
}