import { getMetrics, type MetricsWindow } from "@/lib/queries/metrics";

export const dynamic = "force-dynamic";

export default async function MetricsPage() {
  const { last7, last28 } = await getMetrics();

  return (
    <div className="space-y-9">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Metrics</h1>
      <WindowSection title="Last 7 days" data={last7} />
      <WindowSection title="Last 28 days" data={last28} />
    </div>
  );
}

function WindowSection({ title, data }: { title: string; data: MetricsWindow }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-2)]">
        {title}
      </h2>

      <div className="rounded-[var(--radius-lg)] border border-[var(--accent)] bg-[var(--accent-soft)] p-6 text-center shadow-[var(--shadow-card)]">
        <p className="text-4xl font-extrabold text-[var(--accent)]">
          {data.plansWithTwoPlusIn}
        </p>
        <p className="mt-1 text-sm font-medium text-[var(--foreground)]">
          Plans with 2+ distinct visitors marked in
        </p>
      </div>

      <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 text-center shadow-[var(--shadow-card)]">
        <p className="text-2xl font-bold text-[var(--foreground)]">{data.returningVisitors}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">Returning visitors (2+ plans)</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Plan views" value={data.planViews} />
        <Stat label="Unique visitors" value={data.uniqueVisitors} />
        <Stat
          label="View → response rate"
          value={`${(data.conversionRate * 100).toFixed(1)}%`}
        />
        <Stat label="Share clicks" value={data.shareClicks} />
        <Stat label="Responses submitted" value={data.responsesSubmitted} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3">
      <p className="text-xl font-bold text-[var(--foreground)]">{value}</p>
      <p className="text-xs text-[var(--muted)]">{label}</p>
    </div>
  );
}
