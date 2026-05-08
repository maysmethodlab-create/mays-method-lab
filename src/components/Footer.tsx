export default function Footer() {
  return (
    <footer className="bg-bg-subtle border-t border-line mt-16">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12 py-12 md:py-14">
        <div className="grid md:grid-cols-3 gap-10 md:gap-16">
          <div>
            {/* Mays footer column header: Oswald 18px maroon, sentence case
                (NOT eyebrow style). */}
            <h2 className="font-headline text-[18px] font-normal text-maroon mb-3 leading-tight">
              Mays Method Lab
            </h2>
            <p className="text-[16px] text-ink-primary leading-relaxed max-w-xs">
              Discovering, testing, and codifying a new way of teaching business for the AI era.
            </p>
          </div>

          <div>
            <h2 className="font-headline text-[18px] font-normal text-maroon mb-3 leading-tight">
              Affiliation
            </h2>
            <p className="text-[16px] text-ink-primary leading-relaxed">
              Mays Business School
              <br />
              Texas A&amp;M University
              <br />
              College Station, Texas
            </p>
          </div>

          <div>
            <h2 className="font-headline text-[18px] font-normal text-maroon mb-3 leading-tight">
              Co-Directors
            </h2>
            <ul className="text-[16px] text-ink-primary leading-relaxed space-y-1">
              <li>Levi Belnap</li>
              <li>&apos;Jon Jasperson</li>
              <li>Shrihari Sridhar</li>
            </ul>
          </div>
        </div>

        <div className="divider mt-12" />

        <div className="mt-6 flex flex-col md:flex-row justify-between gap-4 text-[16px] text-ink-secondary">
          <div>
            &copy; {new Date().getFullYear()} Mays Business School &middot; Texas A&amp;M University
          </div>
          <div className="uppercase tracking-[0.05em] font-semibold text-maroon-muted">
            Discover the Next Way
          </div>
        </div>
      </div>
    </footer>
  );
}
