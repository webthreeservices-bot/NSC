'use client';

export default function BotTypes() {
  const bots = [
    {
      name: 'NEO BOT',
      icon: '🚀',
      level: 'Entry-Level Trading Bot',
      fee: '$50',
      packages: '$500, $1,000, $3,000',
      roi: '3%',
      total: '36%',
      bestFor: 'Beginners & small investors',
    },
    {
      name: 'NEURAL BOT',
      icon: '⚡',
      level: 'Mid-Level Trading Bot',
      fee: '$100',
      packages: '$5,000, $10,000',
      roi: '4%',
      total: '48%',
      bestFor: 'Intermediate investors',
    },
    {
      name: 'ORACLE BOT',
      icon: '💎',
      level: 'High-Level Trading Bot',
      fee: '$150',
      packages: '$25,000, $50,000',
      roi: '5%',
      total: '60%',
      bestFor: 'Advanced investors & whales',
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="h2 h2-lg mb-6">
            BOT TYPES &<br/>FEATURES
          </h2>
          <div className="hero-description">
            Choose your automated trading bot
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {bots.map((bot, index) => (
            <div key={index} className="card-labs">
              <div className="graphic-block-decor graphic-block-decor-top-left"></div>
              <div className="graphic-block-decor graphic-block-decor-top-right"></div>
              <div className="graphic-block-decor graphic-block-decor-bottom-right"></div>
              <div className="graphic-block-decor graphic-block-decor-bottom-left"></div>
              
              <div className="text-6xl mb-4 text-center">{bot.icon}</div>
              <h3 className="text-2xl font-bold text-orange mb-2 text-center tracking-wider">{bot.name}</h3>
              <p className="text-white/60 mb-8 text-center uppercase text-xs tracking-wider">{bot.level}</p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-orange text-xl">✓</span>
                  <div className="flex-1">
                    <div className="font-bold uppercase text-sm tracking-wider">Activation Fee</div>
                    <div className="text-white/70 text-sm">{bot.fee} USDT (one-time)</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-orange text-xl">✓</span>
                  <div className="flex-1">
                    <div className="font-bold uppercase text-sm tracking-wider">Eligible Packages</div>
                    <div className="text-white/70 text-sm">{bot.packages}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-orange text-xl">✓</span>
                  <div className="flex-1">
                    <div className="font-bold uppercase text-sm tracking-wider">Monthly ROI</div>
                    <div className="text-white/70 text-sm">{bot.roi} of investment</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-orange text-xl">✓</span>
                  <div className="flex-1">
                    <div className="font-bold uppercase text-sm tracking-wider">Total Returns</div>
                    <div className="text-white/70 text-sm">{bot.total} over 12 months</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="text-orange text-xl">✓</span>
                  <div className="flex-1">
                    <div className="font-bold uppercase text-sm tracking-wider">Best For</div>
                    <div className="text-white/70 text-sm">{bot.bestFor}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
