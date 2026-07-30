export function ClockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M10 18s6-5.686 6-10a6 6 0 1 0-12 0c0 4.314 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="3" y="4.5" width="14" height="12.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 8.5h14M7 2.5v3M13 2.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ShareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="15" cy="5" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="5" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15" cy="15" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 8.8 13 6M7 11.2l6 2.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M4.5 10.5 8 14l7.5-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function QuestionIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M7.5 7.5a2.5 2.5 0 1 1 3.5 2.29c-.7.32-1 .77-1 1.46v.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="14.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M8 5H5.5A1.5 1.5 0 0 0 4 6.5v8A1.5 1.5 0 0 0 5.5 16h8a1.5 1.5 0 0 0 1.5-1.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 4h5v5M15.5 4.5 9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
