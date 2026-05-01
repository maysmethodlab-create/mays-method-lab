import ScrollReveal from '@/components/ScrollReveal';
import ToolCard from '@/components/ToolCard';
import SignOutButton from '@/components/SignOutButton';
import { ADMIN_TOOLS } from '@/lib/tools';

export const metadata = {
  title: 'Admin Tools — Mays Method Lab',
};

export default function AdminToolsPage() {
  return (
    <section className="section pt-40">
      <div className="flex items-start justify-between flex-wrap gap-6 mb-12">
        <div>
          <ScrollReveal>
            <div className="eyebrow-lg mb-4">Admin Tools</div>
          </ScrollReveal>
          <ScrollReveal>
            <h1 className="headline text-5xl md:text-6xl mb-4">
              Tools for academic leaders.
            </h1>
          </ScrollReveal>
          <ScrollReveal>
            <p className="text-lg text-ink-secondary max-w-2xl leading-relaxed">
              AI-powered workflows for the recurring administrative work of running an academic
              unit at Mays Business School.
            </p>
          </ScrollReveal>
        </div>
        <ScrollReveal>
          <SignOutButton />
        </ScrollReveal>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADMIN_TOOLS.map((tool) => (
          <ScrollReveal key={tool.href}>
            <ToolCard {...tool} />
          </ScrollReveal>
        ))}
      </div>

      {ADMIN_TOOLS.length === 0 ? (
        <div className="card text-center py-20">
          <p className="text-ink-secondary">No tools registered yet.</p>
        </div>
      ) : null}
    </section>
  );
}
