export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-paper text-ink">
      {/* The form is the page — no card, no texture */}
      <div className="flex w-full flex-col px-6 pb-12 pt-[14vh] sm:px-12 lg:w-[38%] lg:min-w-[420px] lg:px-14">
        <div className="mb-12">
          <span className="font-serif text-xl italic tracking-tight">TaskFlow</span>
          <div className="mt-4 h-px w-10 bg-rule-2" aria-hidden />
        </div>
        <div className="w-full max-w-[360px] animate-rise">{children}</div>
      </div>

      {/* One oversized serif line, nothing else */}
      <div className="hidden flex-1 items-end border-l border-rule bg-sunken p-14 lg:flex">
        <p className="max-w-md font-serif text-5xl leading-[1.15] tracking-tight text-ink">
          Work, kept in&nbsp;order.
        </p>
      </div>
    </div>
  );
}
