'use client';

export default function Features() {
  const features = [
    {
      icon: '💰',
      title: 'Consistent Returns',
      description: 'Earn 3-5% monthly ROI automatically deposited to your account. Withdraw anytime after 30 days.',
    },
    {
      icon: '🔐',
      title: 'Secure & Transparent',
      description: 'All transactions on BEP20 & TRC20 blockchains. Fully verifiable and transparent.',
    },
    {
      icon: '🎁',
      title: 'Referral Rewards',
      description: 'Earn 2% direct referral bonus + 6-level deep commission. Build unlimited network.',
    },
    {
      icon: '📊',
      title: 'Real-Time Dashboard',
      description: 'Track your investments, ROI, and network earnings in real-time with detailed analytics.',
    },
    {
      icon: '⚡',
      title: 'Instant Activation',
      description: 'Deposits confirmed within 3-5 minutes. Start earning ROI immediately after confirmation.',
    },
    {
      icon: '🌐',
      title: 'Multi-Network Support',
      description: 'Support for BEP20 (Binance Smart Chain) and TRC20 (TRON) networks for flexible deposits.',
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="h2 h2-lg mb-6">WHY CHOOSE<br/>NSC BOT?</h2>
          <div className="hero-description">Experience the benefits of automated crypto investment</div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="card-labs">
              <div className="graphic-block-decor graphic-block-decor-top-left"></div>
              <div className="graphic-block-decor graphic-block-decor-top-right"></div>
              <div className="graphic-block-decor graphic-block-decor-bottom-right"></div>
              <div className="graphic-block-decor graphic-block-decor-bottom-left"></div>
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3 uppercase tracking-wider">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
