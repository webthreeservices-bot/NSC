'use client';

import Link from 'next/link';

export default function HeroCloned() {
  return (
    <>
      {/* Body Lines - ChainGPT signature grid */}
      <div className="body-lines-wrap">
        <div className="body-line left"></div>
        <div className="body-line left-middle"></div>
        <div className="body-line center"></div>
        <div className="body-line right-middle"></div>
        <div className="body-line right"></div>
      </div>

      {/* Hero Section - Exact ChainGPT structure */}
      <section id="hero-section" className="hero-section">
        <div id="hero-section-container" className="hero-container">
          <div className="hero-top">
            <h1 className="h1 hero-h1">
              <span className="text-span">NSC</span> BOT
            </h1>
          </div>

          <div className="hero-video w-embed">
            <video autoPlay loop muted playsInline>
              <source 
                src="https://chaingpt-web.s3.us-east-2.amazonaws.com/assets/video/Labs/LABS_hero_SAFARI_HEVC.mp4" 
                type="video/mp4; codecs=hvc1"
              />
              <source 
                src="https://chaingpt-web.s3.us-east-2.amazonaws.com/assets/video/Labs/LABS_hero_CHROME_VP9.webm" 
                type="video/webm"
              />
            </video>
          </div>

          <div className="hero-main">
            <div className="hero-info">
              <div className="hero-description">
                Automated Crypto Investment Platform - Earn up to 60% ROI annually with Neural Smart Capital bots.
              </div>
              <Link 
                href="/register" 
                className="button-primary hero-apply w-inline-block"
              >
                <div className="button-primary-border">
                  <div className="button-primary-text">GET STARTED NOW</div>
                </div>
              </Link>
            </div>

            <div className="hero-bottom-space"></div>

            {/* Graphic Block */}
            <div className="graphic-block hero-graphic-block">
              <div className="graphic-block-decor graphic-block-decor-top-left"></div>
              <div className="graphic-block-decor graphic-block-decor-top-right"></div>
              <div className="graphic-block-decor graphic-block-decor-bottom-right"></div>
              <div className="graphic-block-decor graphic-block-decor-bottom-left"></div>
              <img 
                src="https://cdn.prod.website-files.com/664753c2515af09bef5b9826/6654a5c3113a6f95af59c707_star.webp" 
                loading="lazy" 
                alt="" 
                className="graphic-block-image"
              />
            </div>

            {/* Stats Cards */}
            <div className="hero-partners" style={{gridColumn: 'span 3'}}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', width: '100%'}}>
                <div className="graphic-block">
                  <div className="graphic-block-decor graphic-block-decor-top-left"></div>
                  <div className="graphic-block-decor graphic-block-decor-top-right"></div>
                  <div className="graphic-block-decor graphic-block-decor-bottom-right"></div>
                  <div className="graphic-block-decor graphic-block-decor-bottom-left"></div>
                  <div style={{textAlign: 'center', padding: '2rem'}}>
                    <div style={{fontSize: '3rem', fontWeight: 'bold', color: '#FF7120'}}>$500</div>
                    <div style={{fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem'}}>
                      Minimum Investment
                    </div>
                  </div>
                </div>

                <div className="graphic-block">
                  <div className="graphic-block-decor graphic-block-decor-top-left"></div>
                  <div className="graphic-block-decor graphic-block-decor-top-right"></div>
                  <div className="graphic-block-decor graphic-block-decor-bottom-right"></div>
                  <div className="graphic-block-decor graphic-block-decor-bottom-left"></div>
                  <div style={{textAlign: 'center', padding: '2rem'}}>
                    <div style={{fontSize: '3rem', fontWeight: 'bold', color: '#FF7120'}}>12</div>
                    <div style={{fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem'}}>
                      Months Duration
                    </div>
                  </div>
                </div>

                <div className="graphic-block">
                  <div className="graphic-block-decor graphic-block-decor-top-left"></div>
                  <div className="graphic-block-decor graphic-block-decor-top-right"></div>
                  <div className="graphic-block-decor graphic-block-decor-bottom-right"></div>
                  <div className="graphic-block-decor graphic-block-decor-bottom-left"></div>
                  <div style={{textAlign: 'center', padding: '2rem'}}>
                    <div style={{fontSize: '3rem', fontWeight: 'bold', color: '#FF7120'}}>60%</div>
                    <div style={{fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.5rem'}}>
                      Maximum ROI
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
