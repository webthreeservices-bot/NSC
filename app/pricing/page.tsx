'use client'

import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, Users, Rocket } from 'lucide-react';
import {
  type FeatureItem,
  PricingTable,
  PricingTableBody,
  PricingTableHeader,
  PricingTableHead,
  PricingTableRow,
  PricingTableCell,
  PricingTablePlan,
} from '@/components/pricing-table';
import { Button } from '@/components/ui/button';

export default function PricingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-20 bg-black">
      <div
        className={cn(
          'absolute inset-0 z-[-10] size-full max-h-102 opacity-30',
          '[mask-image:radial-gradient(ellipse_at_center,var(--background),transparent)]',
        )}
        style={{
          backgroundImage:
            'radial-gradient(#00ff00 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
        <h1
          className={cn(
            'text-4xl leading-tight font-black text-balance sm:text-5xl text-white',
          )}
        >
          {'Investment '}
          <i className="bg-gradient-to-r from-[#00ff00] via-[#00cc00] to-[#009900] bg-clip-text font-extrabold text-transparent drop-shadow-[0_0_18px_rgba(0,255,0,0.55)]">
            {'Packages'}
          </i>
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-gray-400">
          Choose from our carefully designed investment packages with up to 3-5% monthly ROI for 12 months
        </p>
      </div>
      
      <div className="mx-auto my-10 max-w-5xl">
        <PricingTable>
          <PricingTableHeader>
            <PricingTableRow>
              <th />
              <th className="p-1">
                <PricingTablePlan
                  name="NEO"
                  badge="Entry Level Package"
                  price="$50"
                  compareAt=""
                  icon={Shield}
                >
                  <Button variant="outline" className="w-full rounded-lg border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00]/10" size="lg">
                    Get Started
                  </Button>
                </PricingTablePlan>
              </th>
              <th className="p-1">
                <PricingTablePlan
                  name="NEURAL"
                  badge="Advanced Package"
                  price="$100"
                  compareAt=""
                  icon={Users}
                  className="after:pointer-events-none after:absolute after:-inset-0.5 after:rounded-[inherit] after:bg-gradient-to-b after:from-[#00ff00]/15 after:to-transparent after:blur-[2px]"
                >
                  <Button
                    className="w-full rounded-lg bg-[#00ff00] text-black hover:bg-[#00cc00]"
                    size="lg"
                  >
                    Get Started
                  </Button>
                </PricingTablePlan>
              </th>
              <th className="p-1">
                <PricingTablePlan
                  name="ORACLE"
                  badge="Premium Package"
                  price="$150"
                  compareAt=""
                  icon={Rocket}
                >
                  <Button variant="outline" className="w-full rounded-lg border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00]/10" size="lg">
                    Get Started
                  </Button>
                </PricingTablePlan>
              </th>
            </PricingTableRow>
          </PricingTableHeader>
          <PricingTableBody>
            {features.map((feature, index) => (
              <PricingTableRow key={index}>
                <PricingTableHead>{feature.label}</PricingTableHead>
                {feature.values.map((value, index) => (
                  <PricingTableCell key={index}>{value}</PricingTableCell>
                ))}
              </PricingTableRow>
            ))}
          </PricingTableBody>
        </PricingTable>
      </div>
      
      <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-gradient-to-r from-[#00ff00]/10 to-transparent border border-[#00ff00]/30 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Trading?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join thousands of users who trust NSC Bot for their automated trading needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/register" className="bg-[#00ff00] text-black px-8 py-3 rounded-lg font-bold text-lg hover:bg-[#00cc00] transition-all">
                Create Account
              </a>
              <a href="/login" className="border-2 border-[#00ff00] text-[#00ff00] px-8 py-3 rounded-lg font-bold text-lg hover:bg-[#00ff00] hover:text-black transition-all">
                Sign In
              </a>
            </div>
          </div>
      </div>
    </div>
  );
}

const features: FeatureItem[] = [
  {
    label: 'Monthly ROI',
    values: ['Up to 3%', 'Up to 4%', 'Up to 5%'],
  },
  {
    label: 'Contract Duration',
    values: ['12 Months', '12 Months', '12 Months'],
  },
  {
    label: 'Total Return',
    values: ['Up to 36%', 'Up to 48%', 'Up to 60%'],
  },
];
