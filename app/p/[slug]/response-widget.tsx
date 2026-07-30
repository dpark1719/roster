"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/track";
import { CheckIcon, QuestionIcon, XIcon, ShareIcon } from "@/lib/icons";

type Status = "in" | "maybe" | "out";

interface ExistingResponse {
  status: Status;
  displayName: string;
}

export function ResponseWidget({
  slug,
  planId,
  lastDisplayName,
  initialResponse,
  isFull,
}: {
  slug: string;
  planId: string;
  lastDisplayName: string;
  initialResponse: ExistingResponse | null;
  isFull: boolean;
}) {
  const [response, setResponse] = useState<ExistingResponse | null>(initialResponse);
  const [pendingStatus, setPendingStatus] = useState<Status | null>(null);
  const [name, setName] = useState(lastDisplayName);
  const [wantsReminder, setWantsReminder] = useState(false);
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "shared">("idle");
  const router = useRouter();

  function startResponse(status: Status) {
    if (!response) {
      track("response_started", planId, { status });
    }
    setPendingStatus(status);
  }

  async function submitResponse(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingStatus || !name.trim()) return;

    setSubmitting(true);
    const res = await fetch(`/api/plans/${slug}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: name.trim(),
        status: pendingStatus,
        contact: wantsReminder ? phone.trim() : null,
      }),
    });
    setSubmitting(false);

    if (res.ok) {
      setResponse({ status: pendingStatus, displayName: name.trim() });
      setPendingStatus(null);
      router.refresh();
    }
  }

  async function handleShare() {
    const url = window.location.href;
    track("share_clicked", planId);

    if (navigator.share) {
      try {
        await navigator.share({ url });
        track("share_completed", planId);
        setShareState("shared");
      } catch {
        // user cancelled
      }
      return;
    }

    await navigator.clipboard.writeText(url);
    track("share_completed", planId, { method: "copy" });
    setShareState("shared");
    setTimeout(() => setShareState("idle"), 2000);
  }

  if (response) {
    return (
      <div className="animate-fade-in-up space-y-3">
        <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-sm text-[var(--foreground)]">
            You&apos;re marked as{" "}
            <span className="font-semibold">
              {response.status === "in"
                ? "in"
                : response.status === "maybe"
                  ? "maybe"
                  : "can't make it"}
            </span>
          </p>
          <button
            onClick={() => setPendingStatus(response.status)}
            className="text-sm font-semibold text-[var(--accent)]"
          >
            Change
          </button>
        </div>

        {pendingStatus && (
          <div className="animate-fade-in-up">
            <ResponseForm
              name={name}
              setName={setName}
              wantsReminder={wantsReminder}
              setWantsReminder={setWantsReminder}
              phone={phone}
              setPhone={setPhone}
              submitting={submitting}
              onSubmit={submitResponse}
              onCancel={() => setPendingStatus(null)}
              statusButtons={
                <StatusButtons active={pendingStatus} onSelect={setPendingStatus} isFull={isFull} />
              }
            />
          </div>
        )}

        <button
          onClick={handleShare}
          className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--accent)] px-4 py-3.5 text-sm font-semibold text-[var(--accent-foreground)] transition active:scale-[0.98]"
        >
          <ShareIcon className={`h-4 w-4 ${shareState === "shared" ? "animate-pop-in" : ""}`} />
          {shareState === "shared" ? "Link copied!" : "Know someone who'd come? Send this."}
        </button>
      </div>
    );
  }

  if (pendingStatus) {
    return (
      <div className="animate-fade-in-up">
        <ResponseForm
          name={name}
          setName={setName}
          wantsReminder={wantsReminder}
          setWantsReminder={setWantsReminder}
          phone={phone}
          setPhone={setPhone}
          submitting={submitting}
          onSubmit={submitResponse}
          onCancel={() => setPendingStatus(null)}
          statusButtons={
            <StatusButtons active={pendingStatus} onSelect={setPendingStatus} isFull={isFull} />
          }
        />
      </div>
    );
  }

  return <StatusButtons active={null} onSelect={startResponse} isFull={isFull} />;
}

function StatusButtons({
  active,
  onSelect,
  isFull,
}: {
  active: Status | null;
  onSelect: (status: Status) => void;
  isFull: boolean;
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => !isFull && onSelect("in")}
        disabled={isFull}
        className={`flex flex-1 flex-col items-center gap-1 rounded-[var(--radius-md)] px-2 py-3.5 text-sm font-semibold transition active:scale-[0.97] ${
          isFull
            ? "bg-[var(--border)] text-[var(--muted-2)]"
            : active === "in"
              ? "bg-[var(--success)] text-white"
              : "bg-[var(--success-soft)] text-[var(--success)]"
        }`}
      >
        <CheckIcon className="h-5 w-5" />
        {isFull ? "Full" : "I'm in"}
      </button>
      <button
        onClick={() => onSelect("maybe")}
        className="flex flex-1 flex-col items-center gap-1 rounded-[var(--radius-md)] px-2 py-3.5 text-sm font-semibold transition active:scale-[0.97]"
        style={
          active === "maybe"
            ? { background: "var(--warning)", color: "white" }
            : { background: "var(--warning-soft)", color: "var(--warning)" }
        }
      >
        <QuestionIcon className="h-5 w-5" />
        Maybe
      </button>
      <button
        onClick={() => onSelect("out")}
        className={`flex flex-1 flex-col items-center gap-1 rounded-[var(--radius-md)] px-2 py-3.5 text-sm font-semibold transition active:scale-[0.97] ${
          active === "out"
            ? "bg-[var(--foreground)] text-[var(--background)]"
            : "bg-[var(--border)] text-[var(--muted)]"
        }`}
      >
        <XIcon className="h-5 w-5" />
        Can&apos;t
      </button>
    </div>
  );
}

function ResponseForm({
  name,
  setName,
  wantsReminder,
  setWantsReminder,
  phone,
  setPhone,
  submitting,
  onSubmit,
  onCancel,
  statusButtons,
}: {
  name: string;
  setName: (v: string) => void;
  wantsReminder: boolean;
  setWantsReminder: (v: boolean) => void;
  phone: string;
  setPhone: (v: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  statusButtons: React.ReactNode;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]"
    >
      {statusButtons}
      <input
        autoFocus
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="First name, last initial"
        className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-[15px] text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
      />
      <label className="flex items-center gap-2 text-[13px] text-[var(--muted)]">
        <input
          type="checkbox"
          checked={wantsReminder}
          onChange={(e) => setWantsReminder(e.target.checked)}
          className="accent-[var(--accent)]"
        />
        Text me a reminder the day of
      </label>
      {wantsReminder && (
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          className="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-[15px] text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-[var(--radius-sm)] border border-[var(--border)] py-2.5 text-sm font-medium text-[var(--foreground)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="flex-1 rounded-[var(--radius-sm)] bg-[var(--accent)] py-2.5 text-sm font-semibold text-[var(--accent-foreground)] disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Confirm"}
        </button>
      </div>
    </form>
  );
}
