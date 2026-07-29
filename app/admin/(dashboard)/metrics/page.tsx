import { getMetrics, type MetricsWindow } from "@/lib/queries/metrics";

export const dynamic = "force-dynamic";

export default async function MetricsPage() {
  const { last7, last28 } = await getMetrics();

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-semibold">Metrics</h1>
      <WindowSection title="Last 7 days" data={last7} />
      <WindowSection title="Last 28 days" data={last28} />
    </div>
  );
}

function WindowSection({ title, data }: { title: string; data: MetricsWindow }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium text-neutral-500">{title}</h2>

      <div className="rounded-lg border-2 border-neutral-900 bg-white p-6 text-center">
        <p className="text-4xl font-bold">{data.plansWithTwoPlusIn}</p>
        <p className="mt-1 text-sm text-neutral-500">
          Plans with 2+ distinct visitors marked in
        </p>
      </div>

      <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-center">
        <p className="text-2xl font-bold text-blue-700">{data.returningVisitors}</p>
        <p className="mt-1 text-sm text-blue-600">Returning visitors (2+ plans)</p>
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
    <div className="rounded-md border border-neutral-200 bg-white p-3">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}
