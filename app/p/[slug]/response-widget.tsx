"use client";

import { useState } from "react";
import { track } from "@/lib/track";

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
      <div className="space-y-3">
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
          <p className="text-sm">
            You&apos;re marked as{" "}
            <span className="font-semibold">
              {response.status === "in" ? "in" : response.status === "maybe" ? "maybe" : "can't make it"}
            </span>
            .{" "}
            <button
              onClick={() => setPendingStatus(response.status)}
              className="font-medium text-blue-600 underline"
            >
              Change
            </button>
          </p>
        </div>

        {pendingStatus && (
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
            statusButtons={<StatusButtons active={pendingStatus} onSelect={setPendingStatus} isFull={isFull} />}
          />
        )}

        <div className="rounded-lg border border-dashed border-neutral-300 px-4 py-3">
          <p className="mb-2 text-sm font-medium">Know someone who&apos;d come? Send them this.</p>
          <button
            onClick={handleShare}
            className="w-full rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
          >
            {shareState === "shared" ? "Link copied!" : "Share this plan"}
          </button>
        </div>
      </div>
    );
  }

  if (pendingStatus) {
    return (
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
        statusButtons={<StatusButtons active={pendingStatus} onSelect={setPendingStatus} isFull={isFull} />}
      />
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
  const base =
    "flex-1 rounded-lg px-3 py-3 text-sm font-semibold transition active:scale-95";
  const selected = "bg-neutral-900 text-white";
  const unselected = "bg-neutral-100 text-neutral-900";

  return (
    <div className="flex gap-2">
      <button
        onClick={() => !isFull && onSelect("in")}
        disabled={isFull}
        className={`${base} ${active === "in" ? selected : unselected} ${isFull ? "opacity-50" : ""}`}
      >
        {isFull ? "Full" : "I'm in"}
      </button>
      <button
        onClick={() => onSelect("maybe")}
        className={`${base} ${active === "maybe" ? selected : unselected}`}
      >
        Maybe
      </button>
      <button
        onClick={() => onSelect("out")}
        className={`${base} ${active === "out" ? selected : unselected}`}
      >
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
    <form onSubmit={onSubmit} className="space-y-2 rounded-lg border border-neutral-200 p-3">
      {statusButtons}
      <input
        autoFocus
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="First name, last initial"
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-xs text-neutral-500">
        <input
          type="checkbox"
          checked={wantsReminder}
          onChange={(e) => setWantsReminder(e.target.checked)}
        />
        Text me a reminder the day of
      </label>
      {wantsReminder && (
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number"
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="flex-1 rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Confirm"}
        </button>
      </div>
    </form>
  );
}
