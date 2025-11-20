'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function ChainGPTScripts() {
  return (
    <>
      {/* GSAP - Animation library */}
      <Script src="https://cdn.jsdelivr.net/npm/gsap@3.11.5/dist/gsap.min.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/gsap@3.11.5/dist/ScrollTrigger.min.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/gsap@3.11.5/dist/EasePack.min.js" strategy="beforeInteractive" />
      
      {/* ChainGPT Custom Plugins */}
      <Script src="https://chaingpt-web.s3.us-east-2.amazonaws.com/assets/js/SplitText.min.js" strategy="beforeInteractive" />
      <Script src="https://chaingpt-web.s3.us-east-2.amazonaws.com/assets/js/ScrambleTextPlugin.min.js" strategy="beforeInteractive" />
      
      {/* Swiper - Slider library */}
      <Script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js" strategy="beforeInteractive" />
      
      {/* Lenis - Smooth scrolling */}
      <Script src="https://cdn.jsdelivr.net/npm/lenis@1.1.16/dist/lenis.min.js" strategy="beforeInteractive" />
      
      {/* Webflow core */}
      <Script 
        src="https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js" 
        integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" 
        crossOrigin="anonymous"
        strategy="beforeInteractive"
      />
      
      {/* Initialization Script */}
      <Script id="chaingpt-init" strategy="lazyOnload">
        {`
          // Browser detection
          const isChromium = !!window.chrome;
          const body = document.querySelector("body");
          isChromium ? body.classList.add("is-chromium-browser") : body.classList.add("is-other-browser");
          if(!!window.InternalError) { body.classList.add("is-firefox-browser") };
          
          // Lenis smooth scroll
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          let lenis;
          
          if (isSafari) {
            body.classList.add("is-safari-browser");
          }
          
          if (!isSafari) {
            lenis = new Lenis();
            function raf(time) {
              lenis.raf(time);
              requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
            lenis.on("scroll", ScrollTrigger.update);
            gsap.ticker.lagSmoothing(0);
          }
          
          // Hide scrollbar
          document.head.insertAdjacentHTML("beforeend", \`<style>* { scrollbar-width: none !important; }</style>\`);
        `}
      </Script>
    </>
  );
}
