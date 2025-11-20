'use client';

import Link from 'next/link';

// This is a 100% clone of ChainGPT Labs structure with NSC Bot content
export default function ClonePage() {
  return (
    <>
      {/* Body Lines - Signature Grid */}
      <div className="body-lines-wrap">
        <div className="body-line left"></div>
        <div className="body-line left-middle"></div>
        <div className="body-line center"></div>
        <div className="body-line right-middle"></div>
        <div className="body-line right"></div>
      </div>

      {/* Header Navbar - Exact Clone */}
      <div className="header-clip-wrapper header-clip-wrapper-left">
        <div className="header-clip header-clip-left"></div>
      </div>
      
      <div data-animation="default" data-collapse="medium" data-duration="400" data-easing="ease" data-easing2="ease" role="banner" className="header-navbar w-nav">
        <div className="header-container w-container">
          <div className="header-inner">
            <div className="brand-wrap">
              <Link href="/" className="brand w-nav-brand w--current">
                <div style={{fontSize: '1.5rem', fontWeight: 'bold', color: '#FF7120'}}>NSC BOT</div>
              </Link>
            </div>
            
            <div className="header-main-nav">
              <nav role="navigation" className="nav-menu w-nav-menu">
                <ul id="w-node-_25add9ba-5160-246b-6d87-3ffd945c5436-945c5436" role="list" className="header-menu">
                  <li className="header-menu-item">
                    <a href="#packages" className="header-menu-link w-inline-block">
                      <div className="header-menu-link-wrapper">
                        <div className="header-menu-link-dekor header-menu-link-dekor-right"></div>
                        <div className="header-menu-link-dekor header-menu-link-dekor-left"></div>
                        <div className="header-menu-link-text">Investment Packages</div>
                      </div>
                    </a>
                  </li>
                  <li className="header-menu-item">
                    <a href="#bots" className="header-menu-link w-inline-block">
                      <div className="header-menu-link-wrapper">
                        <div className="header-menu-link-text">Bot Types</div>
                        <div className="header-menu-link-dekor header-menu-link-dekor-right"></div>
                        <div className="header-menu-link-dekor header-menu-link-dekor-left"></div>
                      </div>
                    </a>
                  </li>
                  <li className="header-menu-item">
                    <a href="#how-it-works" className="header-menu-link w-inline-block">
                      <div className="header-menu-link-wrapper">
                        <div className="header-menu-link-text">How It Works</div>
                        <div className="header-menu-link-dekor header-menu-link-dekor-right"></div>
                        <div className="header-menu-link-dekor header-menu-link-dekor-left"></div>
                      </div>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
            
            <div className="header-actions">
              <Link href="/login" className="button-outline w-inline-block">
                <div className="button-outline-border">
                  <div className="button-outline-text">SIGN IN</div>
                </div>
              </Link>
              <Link href="/register" className="button-primary w-inline-block">
                <div className="button-primary-border">
                  <div className="button-primary-text">GET STARTED</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Exact Clone Structure */}
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
              <Link href="/register" className="button-primary hero-apply w-inline-block">
                <div className="button-primary-border">
                  <div className="button-primary-text">GET STARTED NOW</div>
                </div>
              </Link>
            </div>

            <div className="hero-bottom-space"></div>

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

            <div id="w-node-_3ed4ddf5-96e2-2d95-cc00-99d4d88a966e-ef5b982d" className="hero-partners">
              <div className="hero-partners-title">Key Metrics:</div>
              {/* Stats will go here */}
            </div>
          </div>
        </div>
      </section>

      {/* More sections will follow... */}
    </>
  );
}
