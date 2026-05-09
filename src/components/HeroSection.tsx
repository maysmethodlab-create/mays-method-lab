'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

const YT_VIDEO_ID = 'zfZBXZ9wl54';
const YT_EMBED_SRC = `https://www.youtube.com/embed/${YT_VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${YT_VIDEO_ID}&controls=0&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&disablekb=1&enablejsapi=1`;

export default function HeroSection() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [playing, setPlaying] = useState(true);

  function toggle() {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    const func = playing ? 'pauseVideo' : 'playVideo';
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func, args: [] }),
      '*',
    );
    setPlaying((p) => !p);
  }

  return (
    <section className="hero-section">
      <div className="hero-video-wrap">
        <iframe
          ref={iframeRef}
          className="hero-video"
          src={YT_EMBED_SRC}
          title="Mays Anthem"
          allow="autoplay; encrypted-media; picture-in-picture"
          loading="eager"
          aria-hidden="true"
          tabIndex={-1}
        />
        {/* CSS-only animated fallback always rendered behind the iframe so
            it appears instantly on first paint and stays visible behind the
            video while it loads. */}
        <div className="hero-fallback" aria-hidden="true" />
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause Mays Anthem' : 'Play Mays Anthem'}
          aria-pressed={playing}
          className="hero-anthem-toggle"
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <rect x="3" y="2" width="3" height="10" fill="currentColor" />
              <rect x="8" y="2" width="3" height="10" fill="currentColor" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <polygon points="3,2 12,7 3,12" fill="currentColor" />
            </svg>
          )}
          <span>{playing ? 'Pause' : 'Play'} anthem</span>
        </button>
      </div>

      <div className="hero-content-outer">
        <div className="hero-card anim-fade-up">
          <div className="hero-eyebrow">Mays Method Lab</div>
          <h1 className="hero-title">AI Just Changed What One Aggie Can Do in a Day.</h1>
          <p className="hero-sub">
            A Lab for the faculty and staff using it to do better work, faster, in
            service of the students who came here for you.
          </p>
          <div className="hero-buttons">
            <Link href="/resources" className="btn-primary">
              Start With You
              <span className="btn-arrow" aria-hidden="true">&rarr;</span>
            </Link>
            <Link href="/about" className="btn-secondary">
              About the Lab
            </Link>
          </div>
        </div>
      </div>

      <div className="scroll-indicator anim-fade-up scroll-pulse">Scroll</div>
    </section>
  );
}
