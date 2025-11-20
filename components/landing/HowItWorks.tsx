'use client';

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Sign Up',
      description: 'Create your account and complete KYC verification in minutes.',
    },
    {
      number: '2',
      title: 'Choose Package',
      description: 'Select your investment package from $500 to $50,000 USDT.',
    },
    {
      number: '3',
      title: 'Deposit USDT',
      description: 'Send USDT to your unique wallet address via BEP20 or TRC20.',
    },
    {
      number: '4',
      title: 'Activate Bot',
      description: 'Pay one-time bot fee to unlock referral income and start earning.',
    },
    {
      number: '5',
      title: 'Earn Monthly ROI',
      description: 'Receive consistent monthly returns directly to your account.',
    },
    {
      number: '6',
      title: 'Withdraw & Reinvest',
      description: 'Withdraw earnings monthly or reinvest to compound your returns.',
    },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="h2 h2-lg mb-6">HOW IT<br/>WORKS</h2>
          <div className="hero-description">Get started in 6 simple steps</div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="card-labs">
              <div className="graphic-block-decor graphic-block-decor-top-left"></div>
              <div className="graphic-block-decor graphic-block-decor-top-right"></div>
              <div className="graphic-block-decor graphic-block-decor-bottom-right"></div>
              <div className="graphic-block-decor graphic-block-decor-bottom-left"></div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-orange flex items-center justify-center text-black text-2xl font-bold">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold uppercase tracking-wider">{step.title}</h3>
              </div>
              <p className="text-white/70">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
