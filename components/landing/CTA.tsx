'use client';

import Link from 'next/link';

export default function CTA() {
  return (
    <section className="section">
      <div className="container text-center">
        <h2 className="h2 h2-lg mb-6">READY TO START<br/>EARNING?</h2>
        <div className="hero-description mb-12 max-w-2xl mx-auto">
          Join thousands of investors earning passive income with NSC Bot
        </div>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link href="/register" className="button-primary">
            <div className="button-primary-border">
              <div className="button-primary-text">CREATE ACCOUNT</div>
            </div>
          </Link>
          <Link href="/login" className="button-outline">
            SIGN IN
          </Link>
        </div>
      </div>
    </section>
  );
}
