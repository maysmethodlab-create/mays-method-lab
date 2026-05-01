'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // If the video can't be loaded, fall back to the CSS animated background.
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
        {/* CSS-only animated fallback always rendered behind the video so it appears
            instantly on first paint and stays visible if the video tag fails. */}
        <div className="hero-fallback" aria-hidden="true" />
      </div>

      <div className="hero-overlay" aria-hidden="true" />

      <div className="hero-content">
        <div className="hero-eyebrow anim-fade-up">Mays Method Lab</div>
        <h1 className="hero-title anim-fade-up">Discover the Next Way.</h1>
        <p className="hero-sub anim-fade-up">
          The Mays Method Lab exists to discover, test, and codify a new way of teaching
          business for the AI era.
        </p>
        <div className="hero-buttons anim-fade-up">
          <Link href="/admin" className="btn-primary">
            Admin Tools
            <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link href="/about" className="btn-secondary">
            Learn More
          </Link>
        </div>
      </div>

      <div className="scroll-indicator anim-fade-up scroll-pulse">Scroll</div>
    </section>
  );
}
