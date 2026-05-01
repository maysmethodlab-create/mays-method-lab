export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg-elevated">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-14 md:py-20">
        <div className="grid md:grid-cols-3 gap-10 md:gap-16">
          <div>
            <div className="eyebrow mb-4">Mays Method Lab</div>
            <p className="text-sm text-ink-secondary leading-relaxed max-w-xs">
              Discovering, testing, and codifying a new way of teaching business for the AI era.
            </p>
          </div>

          <div>
            <div className="eyebrow mb-4">Affiliation</div>
            <p className="text-sm text-ink-secondary leading-relaxed">
              Mays Business School
              <br />
              Texas A&M University
              <br />
              College Station, Texas
            </p>
          </div>

          <div>
            <div className="eyebrow mb-4">Co-Directors</div>
            <ul className="text-sm text-ink-secondary leading-relaxed space-y-1">
              <li>Levi Belnap</li>
              <li>&apos;Jon Jasperson</li>
              <li>Shrihari Sridhar</li>
            </ul>
          </div>
        </div>

        <div className="divider mt-14" />

        <div className="mt-8 flex flex-col md:flex-row justify-between gap-4 text-xs text-ink-muted">
          <div>
            &copy; {new Date().getFullYear()} Mays Business School &middot; Texas A&M University
          </div>
          <div className="tracking-[0.15em] uppercase">Discover the Next Way</div>
        </div>
      </div>
    </footer>
  );
}
