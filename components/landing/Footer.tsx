'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="section bg-black/50 border-t border-white/10">
      <div className="container py-12">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-orange mb-2 uppercase tracking-wider">NSC Bot - Neural Smart Capital</h3>
          <p className="text-white/60 mb-6 uppercase text-sm tracking-wider">
            Automated Crypto Investment Platform | BEP20 & TRC20 Networks
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-8">
            <Link href="/terms-of-service" className="link link-hover text-base-content/70">
              Terms of Service
            </Link>
            <Link href="/privacy-policy" className="link link-hover text-base-content/70">
              Privacy Policy
            </Link>
            <Link href="/cookie-policy" className="link link-hover text-base-content/70">
              Cookie Policy
            </Link>
          </div>

          <div className="alert alert-warning max-w-4xl mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm">
              ⚠️ Cryptocurrency investments carry inherent risks. Only invest what you can afford to lose. Past performance does not guarantee future results.
            </span>
          </div>

          <p className="text-base-content/50 text-sm">
            © 2025 NSC Bot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
