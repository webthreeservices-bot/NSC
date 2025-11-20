'use client';

import { useState } from 'react';
import { Calculator, TrendingUp, DollarSign, Calendar, BarChart3, Package as PackageIcon } from 'lucide-react';

export default function ROIPage() {
  const [investment, setInvestment] = useState(1000);
  const [selectedPackage, setSelectedPackage] = useState('neo');
  const [duration, setDuration] = useState(12);

  const packages = {
    neo: { name: 'NEO', roi: 3, color: '#00ff00' },
    neural: { name: 'NEURAL', roi: 4, color: '#00ff00' },
    oracle: { name: 'ORACLE', roi: 5, color: '#00ff00' }
  };

  const calculateROI = () => {
    const monthlyROI = packages[selectedPackage as keyof typeof packages].roi / 100;
    const monthlyReturn = investment * monthlyROI;
    const totalReturn = monthlyReturn * duration;
    const totalValue = investment + totalReturn;

    return {
      monthlyReturn,
      totalReturn,
      totalValue,
      roiPercentage: (totalReturn / investment) * 100
    };
  };

  const results = calculateROI();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Calculator className="h-6 w-6 text-[#00ff00]" />
            ROI Calculator
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm">Calculate your potential returns with NSC Bot</p>
        </div>
      </div>

      {/* Calculator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Calculator Input */}
        <div className="bg-black border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-[#00ff00]/30 transition-all">
          <h2 className="text-lg font-bold text-[#00ff00] mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Investment Calculator
          </h2>

          <div className="space-y-4">
            {/* Investment Amount */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Investment Amount (USDT)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={investment}
                  onChange={(e) => setInvestment(Number(e.target.value))}
                  className="bg-gray-900 border border-gray-700 text-white rounded-lg w-full pl-10 pr-4 py-3 focus:border-[#00ff00] focus:ring-1 focus:ring-[#00ff00] transition-all"
                  min="500"
                  step="100"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">Minimum investment: $500 USDT</p>
            </div>

            {/* Package Selection */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Select Package
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {Object.entries(packages).map(([key, pkg]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPackage(key)}
                    className={`p-3 rounded-lg border-2 transition-all active:scale-95 ${
                      selectedPackage === key
                        ? 'border-[#00ff00] bg-[#00ff00]/10'
                        : 'border-gray-700 hover:border-[#00ff00]/50'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-[#00ff00] font-bold text-sm">{pkg.name}</div>
                      <div className="text-white text-xs">{pkg.roi}% ROI</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Investment Duration (Months)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="bg-gray-900 border border-gray-700 text-white rounded-lg w-full pl-10 pr-4 py-3 focus:border-[#00ff00] focus:ring-1 focus:ring-[#00ff00] transition-all"
                  min="1"
                  max="12"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">Maximum duration: 12 months</p>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-black border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-[#00ff00]/30 transition-all">
          <h2 className="text-lg font-bold text-[#00ff00] mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Projected Returns
          </h2>

          <div className="space-y-4">
            {/* Monthly Return */}
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Monthly Return</span>
                <span className="text-[#00ff00] text-xl font-bold">
                  ${results.monthlyReturn.toFixed(2)}
                </span>
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {packages[selectedPackage as keyof typeof packages].roi}% of ${investment}
              </div>
            </div>

            {/* Total Return */}
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-800">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Total Returns</span>
                <span className="text-[#00ff00] text-xl font-bold">
                  ${results.totalReturn.toFixed(2)}
                </span>
              </div>
              <div className="text-gray-500 text-xs mt-1">
                Over {duration} months
              </div>
            </div>

            {/* Total Value */}
            <div className="bg-gray-900 p-4 rounded-lg border-2 border-[#00ff00] bg-[#00ff00]/5">
              <div className="flex justify-between items-center">
                <span className="text-white font-medium">Final Value</span>
                <span className="text-[#00ff00] text-2xl font-black">
                  ${results.totalValue.toFixed(2)}
                </span>
              </div>
              <div className="text-[#00ff00] text-sm mt-1 font-medium">
                {results.roiPercentage.toFixed(1)}% Total ROI
              </div>
            </div>

            {/* Breakdown */}
            <div className="pt-4 border-t border-gray-800">
              <h3 className="text-white font-medium mb-3 text-sm">Investment Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Initial Investment</span>
                  <span className="text-white">${investment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Package</span>
                  <span className="text-[#00ff00]">
                    {packages[selectedPackage as keyof typeof packages].name}
                    ({packages[selectedPackage as keyof typeof packages].roi}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-white">{duration} months</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Comparison */}
      <div className="bg-black border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-[#00ff00]/30 transition-all">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <PackageIcon className="h-5 w-5 text-[#00ff00]" />
          Package Comparison
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm mb-4">
          Compare all our investment packages and their potential returns
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(packages).map(([key, pkg]) => {
            const packageResults = {
              monthlyReturn: investment * (pkg.roi / 100),
              totalReturn: investment * (pkg.roi / 100) * duration,
              totalValue: investment + (investment * (pkg.roi / 100) * duration)
            };

            return (
              <div
                key={key}
                className={`bg-gray-900 p-4 rounded-lg border transition-all ${
                  selectedPackage === key ? 'border-[#00ff00] bg-[#00ff00]/5' : 'border-gray-800'
                }`}
              >
                <div className="text-center mb-4">
                  <h3 className="text-base font-bold text-[#00ff00] mb-1">{pkg.name}</h3>
                  <div className="text-2xl font-black text-white">{pkg.roi}%</div>
                  <div className="text-gray-400 text-xs">Monthly ROI</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-400">Monthly</span>
                    <span className="text-[#00ff00] font-medium">${packageResults.monthlyReturn.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-400">Total Return</span>
                    <span className="text-[#00ff00] font-medium">${packageResults.totalReturn.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm border-t border-gray-800 pt-2">
                    <span className="text-white font-medium">Final Value</span>
                    <span className="text-[#00ff00] font-bold">${packageResults.totalValue.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPackage(key)}
                  className={`w-full mt-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
                    selectedPackage === key
                      ? 'bg-[#00ff00] text-black'
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  {selectedPackage === key ? 'Selected' : 'Select Package'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
