import { notFound } from "next/navigation";
import { getPlanById, getResponsesForPlan } from "@/lib/queries/plans";
import { PlanForm, planToFormValues } from "../plan-form";

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
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-lg font-semibold">Edit plan</h1>
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
        <h2 className="mb-2 text-sm font-medium text-neutral-500">
          Responses ({responses.length})
        </h2>
        {responses.length === 0 ? (
          <p className="text-sm text-neutral-400">No responses yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Contact</th>
                  <th className="px-3 py-2">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {responses.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2">{r.displayName}</td>
                    <td className="px-3 py-2 capitalize">{r.status}</td>
                    <td className="px-3 py-2">{r.contact ?? "—"}</td>
                    <td className="px-3 py-2 text-neutral-500">
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
