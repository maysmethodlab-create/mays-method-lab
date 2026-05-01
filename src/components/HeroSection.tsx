'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/**
 * Mays Method Lab hero — recreates mays.tamu.edu's `.hero--main` pattern.
 *
 * Layout: full-bleed video (or maroon gradient fallback) with a flat white
 * content card overlapping the bottom-left, wrapped in a 2px dotted white
 * outline projecting 16px outside the card. Inside the card: superhead
 * (uppercase Work Sans, maroon-muted), Oswald maroon H1 sentence-case,
 * Work Sans 18px gray subhead, primary maroon CTA.
 */
export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onError = () => setVideoFailed(true);
    video.addEventListener('error', onError);
    return () => video.removeEventListener('error', onError);
  }, []);

  return (
    <section className="hero-section">
      <div className="hero-video-wrap">
        {!videoFailed ? (
          <video
            ref={videoRef}
            className="hero-video"
            autoPlay
            loop
            muted
            playsInline
            poster="/hero-poster.svg"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
        ) : null}
        {/* CSS-only animated fallback always rendered behind the video so
            it appears instantly on first paint and stays visible if the
            video tag fails to load. */}
        <div className="hero-fallback" aria-hidden="true" />
      </div>

      <div className="hero-content-outer">
        <div className="hero-card anim-fade-up">
          <div className="hero-eyebrow">Mays Method Lab</div>
          <h1 className="hero-title">Discover the Next Way.</h1>
          <p className="hero-sub">
            The Mays Method Lab exists to discover, test, and codify a new way of teaching
            business for the AI era.
          </p>
          <div className="hero-buttons">
            <Link href="/admin" className="btn-primary">
              Admin Tools
              <span className="btn-arrow" aria-hidden="true">&rarr;</span>
            </Link>
            <Link href="/about" className="btn-secondary">
              Learn More
            </Link>
          </div>
        </div>
      </div>

      <div className="scroll-indicator anim-fade-up scroll-pulse">Scroll</div>
    </section>
  );
}
