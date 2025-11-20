'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero-section section">
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="https://chaingpt-web.s3.us-east-2.amazonaws.com/assets/video/Labs/LABS_hero_SAFARI_HEVC.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black"></div>
      </div>

      <div className="container hero-content">
        {/* Title with NSC Bot style */}
        <h1 className="h1 hero-title anim-fade-up">
          <span className="text-[#00ff00]">NSC</span> BOT<br/>PLATFORM
        </h1>

        {/* Description */}
        <p className="hero-description anim-fade-up" style={{ animationDelay: '0.2s' }}>
          Automated Crypto Investment Platform<br/>
          Earn Up To <span className="text-[#00ff00] font-bold">60% ROI</span> Annually
        </p>

        {/* CTA Buttons with ChainGPT style */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 anim-fade-up" style={{ animationDelay: '0.4s' }}>
          <Link href="/register" className="button-primary">
            <div className="button-primary-border">
              <div className="button-primary-text">GET STARTED NOW</div>
            </div>
          </Link>
          <Link href="/login" className="button-outline">
            SIGN IN
          </Link>
        </div>

        {/* Stats with decorative blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto anim-stagger">
          <div className="card-labs text-center">
            <div className="graphic-block-decor graphic-block-decor-top-left"></div>
            <div className="graphic-block-decor graphic-block-decor-top-right"></div>
            <div className="graphic-block-decor graphic-block-decor-bottom-right"></div>
            <div className="graphic-block-decor graphic-block-decor-bottom-left"></div>
            <div className="text-5xl font-bold text-[#00ff00] mb-2">$500</div>
            <div className="text-base-content/60 uppercase text-sm tracking-wider">Minimum Investment</div>
          </div>

          <div className="card-labs text-center">
            <div className="graphic-block-decor graphic-block-decor-top-left"></div>
            <div className="graphic-block-decor graphic-block-decor-top-right"></div>
            <div className="graphic-block-decor graphic-block-decor-bottom-right"></div>
            <div className="graphic-block-decor graphic-block-decor-bottom-left"></div>
            <div className="text-5xl font-bold text-[#00ff00] mb-2">12</div>
            <div className="text-base-content/60 uppercase text-sm tracking-wider">Months Duration</div>
          </div>

          <div className="card-labs text-center">
            <div className="graphic-block-decor graphic-block-decor-top-left"></div>
            <div className="graphic-block-decor graphic-block-decor-top-right"></div>
            <div className="graphic-block-decor graphic-block-decor-bottom-right"></div>
            <div className="graphic-block-decor graphic-block-decor-bottom-left"></div>
            <div className="text-5xl font-bold text-[#00ff00] mb-2">60%</div>
            <div className="text-base-content/60 uppercase text-sm tracking-wider">Maximum ROI</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
