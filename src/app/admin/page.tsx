import ScrollReveal from '@/components/ScrollReveal';
import ToolCard from '@/components/ToolCard';
import SignOutButton from '@/components/SignOutButton';
import { ADMIN_TOOLS } from '@/lib/tools';

export const metadata = {
  title: 'Admin Tools | Mays Method Lab',
};

export default function AdminToolsPage() {
  return (
    <section className="section pt-16">
      <ScrollReveal>
        <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12 mb-12 relative">
          <div className="absolute top-6 right-6 z-10">
            <SignOutButton />
          </div>
          <div className="eyebrow-lg mb-3">Admin Tools</div>
          <h1 className="mb-4">Tools for academic leaders.</h1>
          <p className="text-[18px] text-ink-secondary max-w-2xl leading-relaxed">
            AI-powered workflows for the recurring administrative work of running an academic
            unit at Mays Business School.
          </p>
        </div>
      </ScrollReveal>

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
