'use client';

import Link from 'next/link';

export default function Packages() {
  const packages = [
    { name: 'Package 1', amount: '$500', bot: 'NEO', fee: '$50', monthlyRoi: '3% ($15)', totalRoi: '$180 (36%)' },
    { name: 'Package 2', amount: '$1,000', bot: 'NEO', fee: '$50', monthlyRoi: '3% ($30)', totalRoi: '$360 (36%)' },
    { name: 'Package 3', amount: '$3,000', bot: 'NEO', fee: '$50', monthlyRoi: '3% ($90)', totalRoi: '$1,080 (36%)' },
    { name: 'Package 4', amount: '$5,000', bot: 'NEURAL', fee: '$100', monthlyRoi: '4% ($200)', totalRoi: '$2,400 (48%)' },
    { name: 'Package 5', amount: '$10,000', bot: 'NEURAL', fee: '$100', monthlyRoi: '4% ($400)', totalRoi: '$4,800 (48%)' },
    { name: 'Package 6', amount: '$25,000', bot: 'ORACLE', fee: '$150', monthlyRoi: '5% ($1,250)', totalRoi: '$15,000 (60%)' },
    { name: 'Package 7', amount: '$50,000', bot: 'ORACLE', fee: '$150', monthlyRoi: '5% ($2,500)', totalRoi: '$30,000 (60%)' },
  ];

  return (
    <section className="section">
      <div className="container">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <h2 className="h2 h2-lg mb-6">
            INVESTMENT<br/>PACKAGES
          </h2>
          <div className="hero-description">
            Choose the package that fits your investment goals
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mb-12">
          <table className="table-labs">
            <thead>
              <tr>
                <th className="uppercase tracking-wider">Package</th>
                <th className="uppercase tracking-wider text-center">Amount (USDT)</th>
                <th className="uppercase tracking-wider text-center">Bot Type</th>
                <th className="uppercase tracking-wider text-center">Bot Fee</th>
                <th className="uppercase tracking-wider text-center">Monthly ROI</th>
                <th className="uppercase tracking-wider text-center">Total ROI</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg, index) => (
                <tr key={index}>
                  <td className="font-bold">{pkg.name}</td>
                  <td className="text-center font-bold text-orange">{pkg.amount}</td>
                  <td className="text-center">
                    <span className="px-3 py-1 bg-orange/20 text-orange rounded uppercase text-xs font-bold tracking-wider">
                      {pkg.bot}
                    </span>
                  </td>
                  <td className="text-center">{pkg.fee}</td>
                  <td className="text-center text-white/80">{pkg.monthlyRoi}</td>
                  <td className="text-center font-bold text-orange">{pkg.totalRoi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/register" className="button-primary">
            <div className="button-primary-border">
              <div className="button-primary-text">START INVESTING TODAY</div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
