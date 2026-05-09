import ScrollReveal from '@/components/ScrollReveal';
import LearningCommunityClient from '../learning-community/LearningCommunityClient';
import { recentApprovedContributedPrompts } from '@/lib/submissions';

export const metadata = {
  title: 'Resources | Mays Method Lab',
  description:
    'Apps, prompts, tools, tutorials, and free courses curated by the Mays Method Lab. The single home for everything the Lab builds.',
};

export default async function ResourcesPage() {
  // Pull approved contributed prompts. The rich client takes them as a
  // prop but the Recently Contributed row is hidden on /resources, so an
  // empty array is fine; we still pass real values when they exist for
  // any future surface that wants to use them.
  const approved = await recentApprovedContributedPrompts(5);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <main id="main-content">
        <section className="section pt-16" aria-labelledby="resources-hero-heading">
          <ScrollReveal>
            <div className="dotted-frame bg-bg-subtle py-12 px-8 md:px-12">
              <div className="eyebrow-lg mb-3">Resources</div>
              <h1 id="resources-hero-heading" className="mb-6 max-w-4xl">
                Everything the Lab Builds, in One Place.
              </h1>
              <p className="text-[20px] text-ink-secondary leading-relaxed max-w-3xl">
                Apps, prompts, tutorials, approved tools, and the free courses
                worth your time. Search anything. Filter by the kind of work you
                do. Open a prompt without leaving the page.
              </p>
            </div>
          </ScrollReveal>
        </section>

        {/*
          Render the rich learning hub directly here. /resources is now the
          single destination for everything the Lab curates. The role
          toggle, editorial story card, and bottom CTA strip are hidden so
          the page stays focused on apps, prompts, tools, tutorials, and
          courses without extra UI furniture.
        */}
        <section className="section" aria-label="Resource library">
          <LearningCommunityClient
            initialRole="faculty"
            contributedPrompts={approved}
            hideRoleToggle
            hideStory
            hideThroughput
            hideTrustBanner
          />
        </section>
      </main>
    </>
  );
}
