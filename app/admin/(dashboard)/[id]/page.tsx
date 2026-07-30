import { notFound } from "next/navigation";
import { getPlanById, getResponsesForPlan } from "@/lib/queries/plans";
import { PlanForm } from "../plan-form";
import { planToFormValues } from "@/lib/plan-form-values";

export const dynamic = "force-dynamic";

export default async function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = await getPlanById(id);

  if (!plan) {
    notFound();
  }

  const responses = await getResponsesForPlan(plan.id);

  return (
    <div className="space-y-9">
      <div>
        <h1 className="mb-4 text-2xl font-bold tracking-tight text-[var(--foreground)]">
          Edit plan
        </h1>
        <PlanForm
          planId={plan.id}
          slug={plan.slug}
          initial={planToFormValues({
            ...plan,
            startsAt: plan.startsAt.toISOString(),
            endsAt: plan.endsAt ? plan.endsAt.toISOString() : null,
          })}
        />
      </div>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--muted-2)]">
          Responses ({responses.length})
        </h2>
        {responses.length === 0 ? (
          <p className="text-sm text-[var(--muted-2)]">No responses yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-[var(--muted-2)]">
                <tr>
                  <th className="px-3 py-2.5">Name</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Contact</th>
                  <th className="px-3 py-2.5">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {responses.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2.5 font-medium text-[var(--foreground)]">
                      {r.displayName}
                    </td>
                    <td className="px-3 py-2.5 capitalize text-[var(--foreground)]">
                      {r.status}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--muted)]">{r.contact ?? "—"}</td>
                    <td className="px-3 py-2.5 text-[var(--muted)]">
                      {new Date(r.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
