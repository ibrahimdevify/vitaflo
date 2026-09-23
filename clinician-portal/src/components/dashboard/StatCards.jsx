// StatCards.jsx

import { Link } from 'react-router';

/* Shared shell */
const CARD =
  'group relative overflow-hidden rounded-[24px] transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out motion-reduce:transition-none';

/* Shared micro-label */
const LABEL =
  'text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground';

export default function StatCards({ cards }) {
  if (!cards?.length) return null;

  const [primary, secondary, tertiary, quaternary] = cards;

  return (
    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:grid-rows-2">
      {/* ── 1. Primary ──────────────────────────────────────── */}
      {primary && (
        <Link
          to="/patients"
          className="block h-full sm:col-span-2 lg:col-span-3 lg:row-span-2"
        >
          <div
            className={`${CARD} flex min-h-[160px] h-full cursor-pointer flex-col justify-between bg-surface p-5 shadow-sm ring-1 ring-inset ring-border hover:shadow-md sm:col-span-2 lg:col-span-3 lg:row-span-2 lg:min-h-0 lg:p-6`}
          >
            {/* Premium blue / violet glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.22)_0%,rgba(59,130,246,0.12)_35%,transparent_72%)] blur-2xl transition-all duration-500 group-hover:scale-110 group-hover:opacity-90"
            />

            {/* Secondary soft cyan glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.10)_0%,transparent_72%)] blur-2xl"
            />

            {/* Diagonal pattern */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.16] [mask-image:radial-gradient(ellipse_85%_65%_at_100%_0%,black_40%,transparent_100%)]"
            >
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.5)_0px,rgba(255,255,255,0.5)_1px,transparent_1px,transparent_11px)]" />
            </div>

            {/* Bottom fade */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/15 to-transparent"
            />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/70">
                {primary.title}
              </span>

              {primary.icon && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-primary-foreground/[0.08] backdrop-blur-sm group-hover:scale-110 transition-transform duration-150 ease-in">
                  <primary.icon
                    className="h-4 w-4 text-primary-foreground"
                    strokeWidth={1.9}
                  />
                </div>
              )}
            </div>

            <h3 className="relative z-10 mt-4 text-[2.5rem] font-semibold leading-none tracking-[-0.06em] text-primary-foreground tabular-nums sm:text-[3rem] lg:text-[3.5rem]">
              {primary.value}
            </h3>
          </div>
        </Link>
      )}

      {/* ── 2. Secondary ────────────────────────────────────── */}
      {secondary && (
        <Link to="/patients" className="block h-full lg:col-span-3">
          <div
            className={`${CARD} flex h-full min-h-[100px] cursor-pointer flex-col justify-center border border-border bg-muted p-4 hover:border-border-strong hover:bg-card lg:min-h-0 lg:p-5`}
          >
            {/* Premium cyan / blue glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.16)_0%,rgba(59,130,246,0.08)_38%,transparent_72%)] blur-2xl transition-all duration-500 group-hover:scale-110"
            />
            {/* Soft green counter-glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 left-1/3 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.06)_0%,transparent_70%)] blur-2xl"
            />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <p className={`${LABEL} truncate`}>{secondary.title}</p>

              {secondary.icon && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background shadow-sm group-hover:scale-110 transition-transform duration-150 ease-in">
                  <secondary.icon
                    className="h-4 w-4 text-foreground"
                    strokeWidth={1.9}
                  />
                </div>
              )}
            </div>

            <p className="relative z-10 mt-2.5 text-[1.6rem] font-semibold leading-none tracking-[-0.045em] text-foreground tabular-nums lg:text-[1.85rem]">
              {secondary.value}
            </p>
          </div>
        </Link>
      )}

      {/* ── 3. Tertiary ─────────────────────────────────────── */}
      {tertiary && (
        <Link to="/patients" className="block h-full lg:col-span-1">
          <div
            className={`${CARD} flex h-full min-h-[100px] cursor-pointer flex-col justify-center border border-border bg-card p-4 text-center hover:border-border-strong hover:bg-muted lg:min-h-0 lg:p-5`}
          >
            {/* Premium emerald / teal glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.14)_0%,rgba(20,184,166,0.06)_38%,transparent_72%)] blur-2xl transition-all duration-500 group-hover:scale-110"
            />

            <div className="relative z-10">
              {tertiary.icon && (
                <div className="mx-auto mb-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-transform duration-150 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                  <tertiary.icon
                    className="h-4 w-4 text-foreground"
                    strokeWidth={1.9}
                  />
                </div>
              )}

              <p className="text-[1.5rem] font-semibold leading-none tracking-[-0.04em] text-foreground tabular-nums lg:text-[1.75rem]">
                {tertiary.value}
              </p>

              <p className={`${LABEL} mt-1.5`}>{tertiary.title}</p>
            </div>
          </div>
        </Link>
      )}

      {/* ── 4. Quaternary ───────────────────────────────────── */}
      {quaternary && (
        <Link
          to="/prescriptions"
          className="block h-full sm:col-span-2 lg:col-span-2"
        >
          <div
            className={`${CARD} flex min-h-[100px] h-full cursor-pointer items-center gap-3 border border-transparent bg-surface-raised p-4 hover:border-border hover:bg-card lg:min-h-0 lg:gap-3.5 lg:p-5`}
          >
            {/* Premium violet / rose glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-14 -right-14 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.15)_0%,rgba(236,72,153,0.07)_35%,transparent_72%)] blur-2xl transition-all duration-500 group-hover:scale-110"
            />

            <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-transform duration-150 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100">
              {quaternary.icon && (
                <quaternary.icon
                  className="h-4 w-4 text-foreground"
                  strokeWidth={1.9}
                />
              )}
            </div>

            <div className="relative z-10 min-w-0">
              <p className="text-[1.25rem] font-semibold leading-none tracking-[-0.035em] text-foreground tabular-nums lg:text-[1.4rem]">
                {quaternary.value}
              </p>

              <p className={`${LABEL} mt-1.5 truncate`}>{quaternary.title}</p>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
