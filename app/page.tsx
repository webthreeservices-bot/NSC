'use client';

import dynamic from 'next/dynamic';
import { ContinuousTextScramble } from "@/components/ui/continuous-text-scramble";
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { ErrorSuppressor } from "@/app/error-suppressor";
import PurchaseButton from '@/components/PurchaseButton';
import { useEffect, useRef, useState } from 'react';

// Lazy load heavy components
const WebGLShader = dynamic(() => import("@/components/ui/web-gl-shader").then(mod => ({ default: mod.WebGLShader })), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
});

const LenisScroll = dynamic(() => import("@/components/ui/lenis-scroll").then(mod => ({ default: mod.LenisScroll })), {
  ssr: false
});

// Activity data generators
const packages = ['NEO Package', 'NEURAL Package', 'ORACLE Package'];
const investmentAmounts = [
  500, 500, 1000, 1000, 1000, 3000, 3000, 5000, 5000, 10000, 10000, 25000, 50000
]; // Weighted towards lower amounts
const withdrawalTypes = ['ROI Withdrawal', 'Referral Bonus', 'Level Income', 'Direct Bonus'];
const withdrawalAmounts = [
  25, 30, 45, 50, 75, 80, 95, 100, 120, 150, 175, 200, 225, 250, 280, 
  300, 350, 375, 400, 450, 500, 550, 600, 675, 720, 800, 850, 920, 1000,
  1100, 1200, 1350, 1500, 1650, 1800, 2000, 2250
]; // More varied amounts

// International names pool
const firstNames = [
  // Indian names
  'Raj', 'Priya', 'Amit', 'Ananya', 'Vikram', 'Sneha', 'Rohan', 'Kavya', 'Arjun', 'Isha',
  'Rahul', 'Deepika', 'Karan', 'Pooja', 'Aditya', 'Neha', 'Siddharth', 'Riya', 'Akash', 'Simran',
  'Manish', 'Anjali', 'Nikhil', 'Shreya', 'Varun', 'Divya', 'Kunal', 'Priyanka', 'Vishal', 'Megha',
  // Western names
  'John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James', 'Emily', 'Robert', 'Jessica',
  'Daniel', 'Ashley', 'Chris', 'Michelle', 'Ryan', 'Amanda', 'Kevin', 'Jennifer', 'Brian', 'Nicole',
  // Asian names
  'Wei', 'Mei', 'Chen', 'Lin', 'Zhang', 'Li', 'Wang', 'Liu', 'Hiroshi', 'Yuki',
  'Kenji', 'Sakura', 'Taro', 'Hana', 'Kim', 'Park', 'Lee', 'Choi',
  // Middle Eastern names
  'Ahmed', 'Fatima', 'Mohammed', 'Aisha', 'Omar', 'Zainab', 'Ali', 'Layla',
  // African names
  'Kwame', 'Amara', 'Juma', 'Nia', 'Kofi', 'Zara',
  // Latin American names
  'Carlos', 'Maria', 'Diego', 'Ana', 'Luis', 'Sofia', 'Miguel', 'Isabella'
];

const lastNames = [
  // Indian surnames
  'Kumar', 'Singh', 'Sharma', 'Patel', 'Gupta', 'Reddy', 'Verma', 'Joshi', 'Iyer', 'Mehta',
  'Chopra', 'Agarwal', 'Shah', 'Desai', 'Malhotra', 'Rao', 'Nair', 'Pillai', 'Khan', 'Das',
  'Banerjee', 'Chatterjee', 'Mukherjee', 'Kapoor', 'Bhatia', 'Sethi', 'Saxena', 'Jain', 'Sinha', 'Mishra',
  // Western surnames
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Lee',
  // Asian surnames
  'Wong', 'Chen', 'Liu', 'Wang', 'Zhang', 'Tanaka', 'Sato', 'Suzuki', 'Takahashi', 'Kim',
  'Park', 'Choi', 'Jung', 'Kang', 'Nguyen', 'Tran', 'Le', 'Pham',
  // Middle Eastern surnames
  'Hassan', 'Abdullah', 'Rahman', 'Ali', 'Hussein', 'Mahmoud',
  // Other surnames
  'Silva', 'Santos', 'Fernandez', 'Lopez', 'Gonzalez', 'Perez', 'Torres', 'Ramirez'
];

// Telegram-style username components
const telegramPrefixes = [
  'crypto', 'invest', 'trader', 'hodl', 'moon', 'bull', 'diamond', 'whale', 'profit',
  'smart', 'quick', 'fast', 'pro', 'king', 'queen', 'master', 'boss', 'alpha', 'beta',
  'zen', 'nova', 'stellar', 'cosmic', 'quantum', 'digital', 'tech', 'cyber', 'future',
  'golden', 'silver', 'rich', 'wealthy', 'lucky', 'blessed', 'elite', 'premium', 'vip'
];

const telegramSuffixes = [
  'trader', 'investor', 'hodler', 'whale', 'shark', 'bull', 'bear', 'hunter', 'seeker',
  'master', 'king', 'queen', 'boss', 'pro', 'expert', 'guru', 'ninja', 'wizard', 'legend',
  'gains', 'profits', 'wins', 'moon', 'rocket', 'lambo', 'success', 'wealth', 'fortune',
  'diamond', 'gold', 'platinum', 'elite', 'vip', 'premium', 'champion', 'winner', 'achiever'
];

const telegramWords = [
  'btc', 'eth', 'usdt', 'bnb', 'sol', 'ada', 'doge', 'xrp', 'dot', 'matic',
  'crypto', 'defi', 'nft', 'web3', 'meta', 'block', 'chain', 'coin', 'token', 'gem',
  'moon', 'mars', 'sky', 'star', 'sun', 'ace', 'max', 'neo', 'apex', 'zen'
];

const generateUsername = () => {
  const styles = [
    // Style 1: prefix_suffix123
    () => {
      const prefix = getRandomItem(telegramPrefixes);
      const suffix = getRandomItem(telegramSuffixes);
      const num = Math.floor(Math.random() * 999) + 1;
      return `${prefix}_${suffix}${num}`;
    },
    // Style 2: word1word2_number
    () => {
      const word1 = getRandomItem(telegramWords);
      const word2 = getRandomItem(telegramWords);
      const num = Math.floor(Math.random() * 99) + 1;
      return `${word1}${word2}_${num}`;
    },
    // Style 3: prefix123
    () => {
      const prefix = getRandomItem(telegramPrefixes);
      const num = Math.floor(Math.random() * 9999) + 100;
      return `${prefix}${num}`;
    },
    // Style 4: word_suffix
    () => {
      const word = getRandomItem(telegramWords);
      const suffix = getRandomItem(telegramSuffixes);
      return `${word}_${suffix}`;
    },
    // Style 5: prefix_word123
    () => {
      const prefix = getRandomItem(telegramPrefixes);
      const word = getRandomItem(telegramWords);
      const num = Math.floor(Math.random() * 999) + 1;
      return `${prefix}_${word}${num}`;
    },
    // Style 6: double underscore style
    () => {
      const prefix = getRandomItem(telegramPrefixes);
      const suffix = getRandomItem(telegramSuffixes);
      return `${prefix}__${suffix}`;
    },
    // Style 7: single word + numbers
    () => {
      const word = getRandomItem([...telegramPrefixes, ...telegramWords]);
      const num = Math.floor(Math.random() * 999) + 10;
      return `${word}${num}`;
    },
    // Style 8: word.suffix style
    () => {
      const word = getRandomItem(telegramWords);
      const suffix = getRandomItem(telegramSuffixes);
      const num = Math.floor(Math.random() * 99);
      return num > 50 ? `${word}.${suffix}` : `${word}.${suffix}${num}`;
    }
  ];
  
  return getRandomItem(styles)();
};

const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const getTimestamp = () => {
  const seconds = Math.floor(Math.random() * 300) + 10; // 10 seconds to 5 minutes
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds > 30) return `${minutes}m ${remainingSeconds}s ago`;
  return `${minutes}m ago`;
};

interface Activity {
  id: string;
  user: string;
  type: string;
  amount: number;
  timestamp: string;
}

const generateInvestment = (): Activity => ({
  id: `inv-${Date.now()}-${Math.random()}`,
  user: generateUsername(),
  type: getRandomItem(packages),
  amount: getRandomItem(investmentAmounts),
  timestamp: getTimestamp()
});

const generateWithdrawal = (): Activity => ({
  id: `with-${Date.now()}-${Math.random()}`,
  user: generateUsername(),
  type: getRandomItem(withdrawalTypes),
  amount: getRandomItem(withdrawalAmounts),
  timestamp: getTimestamp()
});

export default function Home() {
  const sectionsRef = useRef<(HTMLElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [investments, setInvestments] = useState<Activity[]>([]);
  const [withdrawals, setWithdrawals] = useState<Activity[]>([]);
  const investmentScrollRef = useRef<HTMLDivElement>(null);
  const withdrawalScrollRef = useRef<HTMLDivElement>(null);

  const setRef = (index: number) => (el: HTMLElement | null) => {
    sectionsRef.current[index] = el;
  };

  // Initialize activity data
  useEffect(() => {
    const initialInvestments = Array.from({ length: 250 }, generateInvestment);
    const initialWithdrawals = Array.from({ length: 250 }, generateWithdrawal);
    setInvestments(initialInvestments);
    setWithdrawals(initialWithdrawals);
  }, []);

  // Auto-scroll to top when new investment is added
  useEffect(() => {
    if (investmentScrollRef.current && investments.length > 0) {
      investmentScrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [investments]);

  // Auto-scroll to top when new withdrawal is added
  useEffect(() => {
    if (withdrawalScrollRef.current && withdrawals.length > 0) {
      withdrawalScrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [withdrawals]);

  // Auto-update investments with varying intervals
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    let isMounted = true

    const updateInvestment = () => {
      if (!isMounted) return

      setInvestments(prev => {
        const newInvestment = generateInvestment();
        return [newInvestment, ...prev.slice(0, 249)];
      });
      
      // Schedule next update with random delay between 3-8 seconds
      if (isMounted) {
        const nextDelay = Math.random() * 5000 + 3000;
        timeoutId = setTimeout(updateInvestment, nextDelay);
      }
    };
    
    // Start the first update after 2 seconds
    timeoutId = setTimeout(updateInvestment, 2000);
    
    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    };
  }, []);

  // Auto-update withdrawals with varying intervals
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    let isMounted = true

    const updateWithdrawal = () => {
      if (!isMounted) return

      setWithdrawals(prev => {
        const newWithdrawal = generateWithdrawal();
        return [newWithdrawal, ...prev.slice(0, 249)];
      });
      
      // Schedule next update with random delay between 4-10 seconds
      if (isMounted) {
        const nextDelay = Math.random() * 6000 + 4000;
        timeoutId = setTimeout(updateWithdrawal, nextDelay);
      }
    };
    
    // Start the first update after 3 seconds
    timeoutId = setTimeout(updateWithdrawal, 3000);
    
    return () => {
      isMounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    };
  }, []);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Mark as loaded after initial render
    setIsLoaded(true);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            entry.target.classList.remove('animate-fade-in-safe');
          }
        });
      },
      { threshold: isMobile ? 0.05 : 0.1, rootMargin: '50px' }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [isMobile, isLoaded]);

  // Wrap with Lenis only on desktop for better performance on mobile
  const PageContent = () => (
    <div className="min-h-screen bg-black text-white relative z-10">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-sm z-[100] border-b border-gray-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 sm:h-14">
            <a href="/" className="text-base sm:text-lg font-bold text-white">NSC Bot</a>
            <nav className="hidden md:flex space-x-4 lg:space-x-6 text-xs lg:text-sm">
              <a href="/pricing" className="hover:text-[#00ff00] transition-colors text-white">Pricing</a>
              <a href="/#packages" className="hover:text-[#00ff00] transition-colors text-white">Packages</a>
              <a href="/#bots" className="hover:text-[#00ff00] transition-colors text-white">Bots</a>
              <a href="/roi" className="hover:text-[#00ff00] transition-colors text-white">ROI</a>
              <a href="/#referral" className="hover:text-[#00ff00] transition-colors text-white">Referral</a>
              <a href="/#about" className="hover:text-[#00ff00] transition-colors text-white">About</a>
            </nav>
            <a href="/register" className="bg-[#00ff00] text-black px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg text-sm font-bold hover:bg-[#00cc00] transition-all active:scale-95 z-10 relative">
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section - Conditional WebGL */}
      <section className="relative h-screen bg-black overflow-hidden flex items-center justify-center pt-12 sm:pt-14">
        {/* Only render WebGL on desktop */}
        {!isMobile && isLoaded && <WebGLShader />}
        {/* Mobile fallback gradient */}
        {isMobile && (
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        )}
        <div className="relative border border-[#00ff00]/20 p-1.5 sm:p-2 w-full mx-4 sm:mx-auto max-w-4xl z-20">
          <main className="relative border border-[#00ff00]/20 py-4 sm:py-6 overflow-hidden bg-black/50 backdrop-blur-sm">
            <div className="flex justify-center mb-2">
              <lord-icon
                src="https://cdn.lordicon.com/qhviklyi.json"
                trigger="loop"
                delay="2000"
                colors="primary:#00ff00,secondary:#ffffff"
                style={{width: "50px", height: "50px"}}>
              </lord-icon>
            </div>
            <h1 className="mb-1 sm:mb-2 text-white text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tighter z-30 relative">
              <span className="text-[#00ff00]">NSC</span> Bot Platform
            </h1>
            <p className="text-white/90 px-4 sm:px-6 text-center text-xs sm:text-sm z-30 relative">
              Automated Crypto Investment Platform - Unleash the power of AI-driven USDT trading
            </p>
            <div className="my-3 sm:my-4 flex items-center justify-center gap-1 z-30 relative">
              <span className="relative flex h-2 w-2 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ff00] opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00ff00]"></span>
              </span>
              <p className="text-xs text-[#00ff00]">Available for New Investments</p>
            </div>

            <div className="flex justify-center px-4 z-30 relative">
              <LiquidButton
                className="text-white border border-[#00ff00] rounded-full hover:bg-[#00ff00]/10 active:scale-95"
                size={isMobile ? 'sm' : 'lg'}
                onClick={() => window.location.href = '/register'}
              >
                Start Trading Now
              </LiquidButton>
            </div> 
          </main>
        </div>
      </section>

      {/* Investment Packages Section */}
      <section
        id="packages"
        ref={setRef(1)}
        className="py-6 sm:py-10 px-4 bg-black transition-all duration-1000 animate-fade-in-safe relative z-20"
      >
        <div className="max-w-7xl mx-auto relative z-30">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-2 text-white">Investment <span className="text-[#00ff00]">Packages</span></h2>
          <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto text-sm">Choose from our carefully designed investment packages with up to 3-5% monthly ROI for 12 months</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* NEO Package */}
            <div className="bg-black border-2 border-gray-800 rounded-xl p-4 hover:border-[#00ff00] transition-all duration-300 stagger-1">
              <div className="text-center mb-3">
                <div className="flex justify-center mb-2">
                  <lord-icon
                    src="https://cdn.lordicon.com/qhviklyi.json"
                    trigger="loop"
                    delay="2000"
                    colors="primary:#00ff00,secondary:#ffffff"
                    style={{width: "40px", height: "40px"}}>
                  </lord-icon>
                </div>
                <h3 className="text-lg font-black text-[#00ff00] mb-1">
                  <ContinuousTextScramble text="NEO" delay={0} />
                </h3>
                <p className="text-gray-400 text-xs">Entry Level Package</p>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Investment Options:</span>
                  <span className="text-white font-bold">$500 / $1,000 / $3,000</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Monthly ROI:</span>
                  <span className="text-[#00ff00] font-bold">Up to 3%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white font-bold">12 Months</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Total Return:</span>
                  <span className="text-[#00ff00] font-bold">Up to 36%</span>
                </div>
              </div>
              <a href="/register" className="block w-full bg-[#00ff00] text-black py-2 rounded-lg text-sm font-bold hover:bg-[#00cc00] transition-all text-center">
                Choose NEO
              </a>
            </div>

            {/* NEURAL Package */}
            <div className="bg-black border-2 border-[#00ff00] rounded-xl p-4 relative hover:shadow-lg hover:shadow-[#00ff00]/30 transition-all duration-300 stagger-2">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#00ff00] text-black px-3 py-0.5 rounded-full text-xs font-bold">POPULAR</span>
              </div>
              <div className="text-center mb-3">
                <div className="flex justify-center mb-2">
                  <lord-icon
                    src="https://cdn.lordicon.com/eszyyflr.json"
                    trigger="loop"
                    delay="2500"
                    colors="primary:#00ff00,secondary:#ffffff"
                    style={{width: "40px", height: "40px"}}>
                  </lord-icon>
                </div>
                <h3 className="text-lg font-black text-[#00ff00] mb-1">
                  <ContinuousTextScramble text="NEURAL" delay={1000} />
                </h3>
                <p className="text-gray-400 text-xs">Advanced Package</p>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Investment Options:</span>
                  <span className="text-white font-bold">$5,000 / $10,000</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Monthly ROI:</span>
                  <span className="text-[#00ff00] font-bold">Up to 4%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white font-bold">12 Months</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Total Return:</span>
                  <span className="text-[#00ff00] font-bold">Up to 48%</span>
                </div>
              </div>
              <PurchaseButton 
                type="package"
                id="neural-package"
                amount="5000"
                network="BEP20"
              />
            </div>

            {/* ORACLE Package */}
            <div className="bg-black border-2 border-gray-800 rounded-xl p-4 hover:border-[#00ff00] transition-all duration-300 stagger-3">
              <div className="text-center mb-3">
                <div className="flex justify-center mb-2">
                  <lord-icon
                    src="https://cdn.lordicon.com/wxnxiano.json"
                    trigger="loop"
                    delay="3000"
                    colors="primary:#00ff00,secondary:#ffffff"
                    style={{width: "40px", height: "40px"}}>
                  </lord-icon>
                </div>
                <h3 className="text-lg font-black text-[#00ff00] mb-1">
                  <ContinuousTextScramble text="ORACLE" delay={2000} />
                </h3>
                <p className="text-gray-400 text-xs">Premium Package</p>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Investment Options:</span>
                  <span className="text-white font-bold">$25,000 / $50,000</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Monthly ROI:</span>
                  <span className="text-[#00ff00] font-bold">Up to 5%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white font-bold">12 Months</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Total Return:</span>
                  <span className="text-[#00ff00] font-bold">Up to 60%</span>
                </div>
              </div>
              <PurchaseButton 
                type="package"
                id="oracle-package"
                amount="25000"
                network="TRC20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        ref={setRef(2)}
        className="py-6 sm:py-10 px-4 bg-black transition-all duration-1000 animate-fade-in-safe relative z-20"
      >
        <div className="max-w-7xl mx-auto relative z-30">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-2 text-white">How It <span className="text-[#00ff00]">Works</span></h2>
          <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto text-sm">Get started with NSC Bot in 6 simple steps and begin earning passive income</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center hover:border-[#00ff00] transition-all duration-300 stagger-1">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 bg-[#00ff00] text-black rounded-full flex items-center justify-center font-bold text-lg">1</div>
              </div>
              <div className="flex justify-center mb-2">
                <lord-icon
                  src="https://cdn.lordicon.com/abfverha.json"
                  trigger="loop"
                  delay="2000"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "35px", height: "35px"}}>
                </lord-icon>
              </div>
              <h3 className="text-base font-bold text-[#00ff00] mb-2">Sign Up</h3>
              <p className="text-gray-400 text-xs">Create your account and complete KYC verification in minutes. Simple and secure registration process.</p>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center hover:border-[#00ff00] transition-all duration-300 stagger-2">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 bg-[#00ff00] text-black rounded-full flex items-center justify-center font-bold text-lg">2</div>
              </div>
              <div className="flex justify-center mb-2">
                <lord-icon
                  src="https://cdn.lordicon.com/qhgmphtg.json"
                  trigger="loop"
                  delay="2200"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "35px", height: "35px"}}>
                </lord-icon>
              </div>
              <h3 className="text-base font-bold text-[#00ff00] mb-2">Choose Package</h3>
              <p className="text-gray-400 text-xs">Select your investment package from $500 to $50,000 USDT. NEO, NEURAL, or ORACLE packages available.</p>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center hover:border-[#00ff00] transition-all duration-300 stagger-3">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 bg-[#00ff00] text-black rounded-full flex items-center justify-center font-bold text-lg">3</div>
              </div>
              <div className="flex justify-center mb-2">
                <lord-icon
                  src="https://cdn.lordicon.com/eszyyflr.json"
                  trigger="loop"
                  delay="2400"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "35px", height: "35px"}}>
                </lord-icon>
              </div>
              <h3 className="text-base font-bold text-[#00ff00] mb-2">Deposit USDT</h3>
              <p className="text-gray-400 text-xs">Send USDT to your unique wallet address via BEP20 or TRC20 networks. Instant confirmation.</p>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center hover:border-[#00ff00] transition-all duration-300 stagger-1">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 bg-[#00ff00] text-black rounded-full flex items-center justify-center font-bold text-lg">4</div>
              </div>
              <div className="flex justify-center mb-2">
                <lord-icon
                  src="https://cdn.lordicon.com/dxjqoygy.json"
                  trigger="loop"
                  delay="2600"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "35px", height: "35px"}}>
                </lord-icon>
              </div>
              <h3 className="text-base font-bold text-[#00ff00] mb-2">Activate Bot</h3>
              <p className="text-gray-400 text-xs">Pay one-time bot fee ($50-$150) to unlock referral income and start automated trading.</p>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center hover:border-[#00ff00] transition-all duration-300 stagger-2">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 bg-[#00ff00] text-black rounded-full flex items-center justify-center font-bold text-lg">5</div>
              </div>
              <div className="flex justify-center mb-2">
                <lord-icon
                  src="https://cdn.lordicon.com/rjzlnunf.json"
                  trigger="loop"
                  delay="2800"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "35px", height: "35px"}}>
                </lord-icon>
              </div>
              <h3 className="text-base font-bold text-[#00ff00] mb-2">Earn Monthly ROI</h3>
              <p className="text-gray-400 text-xs">Receive consistent 3-5% monthly returns directly to your account. Completely automated.</p>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center hover:border-[#00ff00] transition-all duration-300 stagger-3">
              <div className="flex justify-center mb-3">
                <div className="w-10 h-10 bg-[#00ff00] text-black rounded-full flex items-center justify-center font-bold text-lg">6</div>
              </div>
              <div className="flex justify-center mb-2">
                <lord-icon
                  src="https://cdn.lordicon.com/wxnxiano.json"
                  trigger="loop"
                  delay="3000"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "35px", height: "35px"}}>
                </lord-icon>
              </div>
              <h3 className="text-base font-bold text-[#00ff00] mb-2">Withdraw & Reinvest</h3>
              <p className="text-gray-400 text-xs">Withdraw earnings monthly or reinvest to compound your returns. Flexible withdrawal options.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bot Activation Section */}
      <section
        id="bots"
        ref={setRef(3)}
        className="py-6 sm:py-10 px-4 transition-all duration-1000 animate-fade-in-safe relative z-20 bg-black"
      >
        <div className="max-w-7xl mx-auto relative z-30">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-2 text-white">Trading <span className="text-[#00ff00]">Bots</span></h2>
          <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto text-sm">Activate trading bots to unlock referral commissions and maximize your earning potential</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center hover:border-[#00ff00] transition-all duration-300 stagger-1">
              <div className="flex justify-center mb-2">
                <lord-icon
                  src="https://cdn.lordicon.com/dxjqoygy.json"
                  trigger="loop"
                  delay="2000"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "35px", height: "35px"}}>
                </lord-icon>
              </div>
              <h3 className="text-base font-bold text-[#00ff00] mb-2">NEO Bot</h3>
              <div className="text-xl font-black text-white mb-1">$50</div>
              <p className="text-gray-400 mb-3 text-xs">12 months validity</p>
              <PurchaseButton
                type="bot"
                id="neo-bot"
                amount="50"
                network="BEP20"
              />
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center hover:border-[#00ff00] transition-all duration-300 stagger-2">
              <div className="flex justify-center mb-2">
                <lord-icon
                  src="https://cdn.lordicon.com/slkvcfos.json"
                  trigger="loop"
                  delay="2500"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "35px", height: "35px"}}>
                </lord-icon>
              </div>
              <h3 className="text-base font-bold text-[#00ff00] mb-2">NEURAL Bot</h3>
              <div className="text-xl font-black text-white mb-1">$100</div>
              <p className="text-gray-400 mb-3 text-xs">12 months validity</p>
              <PurchaseButton
                type="bot"
                id="neural-bot"
                amount="100"
                network="BEP20"
              />
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-4 text-center hover:border-[#00ff00] transition-all duration-300 stagger-3">
              <div className="flex justify-center mb-2">
                <lord-icon
                  src="https://cdn.lordicon.com/epietrpn.json"
                  trigger="loop"
                  delay="3000"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "35px", height: "35px"}}>
                </lord-icon>
              </div>
              <h3 className="text-base font-bold text-[#00ff00] mb-2">ORACLE Bot</h3>
              <div className="text-xl font-black text-white mb-1">$150</div>
              <p className="text-gray-400 mb-3 text-xs">12 months validity</p>
              <PurchaseButton
                type="bot"
                id="oracle-bot"
                amount="150"
                network="TRC20"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#00ff00]/10 to-transparent border border-[#00ff00]/30 rounded-xl p-4">
            <h3 className="text-base font-bold text-[#00ff00] mb-2">⚠️ Important Note</h3>
            <p className="text-gray-300 text-sm">
              Bot activation is <span className="text-[#00ff00] font-bold">required</span> to earn referral commissions.
              Without an active bot, you won't be eligible for any referral bonuses from your network.
            </p>
          </div>
        </div>
      </section>

      {/* Referral System Section */}
      <section
        id="referral"
        ref={setRef(4)}
        className="py-6 sm:py-10 px-4 bg-black transition-all duration-1000 animate-fade-in-safe relative z-20"
      >
        <div className="max-w-7xl mx-auto relative z-30">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-2 text-white">Referral <span className="text-[#00ff00]">System</span></h2>
          <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto text-sm">Earn commissions up to 6 levels deep with our multi-level referral program</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Referral Levels */}
            <div>
              <h3 className="text-lg font-bold text-[#00ff00] mb-4">Commission Structure</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-black border border-gray-800 rounded-lg">
                  <span className="text-white font-bold text-sm">Direct Referral</span>
                  <span className="text-[#00ff00] font-bold text-base">2.00%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-black border border-gray-800 rounded-lg">
                  <span className="text-white font-bold text-sm">Level 1</span>
                  <span className="text-[#00ff00] font-bold text-base">2.00%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-black border border-gray-800 rounded-lg">
                  <span className="text-white font-bold text-sm">Level 2</span>
                  <span className="text-[#00ff00] font-bold text-base">0.75%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-black border border-gray-800 rounded-lg">
                  <span className="text-white font-bold text-sm">Level 3</span>
                  <span className="text-[#00ff00] font-bold text-base">0.50%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-black border border-gray-800 rounded-lg">
                  <span className="text-white font-bold text-sm">Level 4</span>
                  <span className="text-[#00ff00] font-bold text-base">0.25%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-black border border-gray-800 rounded-lg">
                  <span className="text-white font-bold text-sm">Level 5</span>
                  <span className="text-[#00ff00] font-bold text-base">0.15%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-black border border-gray-800 rounded-lg">
                  <span className="text-white font-bold text-sm">Level 6</span>
                  <span className="text-[#00ff00] font-bold text-base">0.10%</span>
                </div>
              </div>
            </div>

            {/* Referral Benefits */}
            <div>
              <h3 className="text-lg font-bold text-[#00ff00] mb-4">How It Works</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <lord-icon
                      src="https://cdn.lordicon.com/gqdnbnwt.json"
                      trigger="loop"
                      delay="2000"
                      colors="primary:#00ff00,secondary:#ffffff"
                      style={{width: "30px", height: "30px"}}>
                    </lord-icon>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1 text-sm">Share Your Link</h4>
                    <p className="text-gray-400 text-xs">Get your unique referral code and share it with friends and family.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <lord-icon
                      src="https://cdn.lordicon.com/rjzlnunf.json"
                      trigger="loop"
                      delay="2500"
                      colors="primary:#00ff00,secondary:#ffffff"
                      style={{width: "30px", height: "30px"}}>
                    </lord-icon>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1 text-sm">They Invest</h4>
                    <p className="text-gray-400 text-xs">When someone uses your code to invest, they join your network.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <lord-icon
                      src="https://cdn.lordicon.com/qhgmphtg.json"
                      trigger="loop"
                      delay="3000"
                      colors="primary:#00ff00,secondary:#ffffff"
                      style={{width: "30px", height: "30px"}}>
                    </lord-icon>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1 text-sm">Earn Commissions</h4>
                    <p className="text-gray-400 text-xs">Receive instant commissions from their investments and their referrals too.</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-[#00ff00]/10 to-transparent border border-[#00ff00]/30 rounded-lg p-3 mt-4">
                  <h4 className="text-[#00ff00] font-bold mb-1 text-sm">💡 Pro Tip</h4>
                  <p className="text-gray-300 text-xs">
                    Build a strong network to maximize your passive income potential. The deeper your network grows, the more you earn!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Withdrawal Information Section */}
      <section
        id="withdrawals"
        ref={setRef(5)}
        className="py-6 sm:py-10 px-4 transition-all duration-1000 animate-fade-in-safe"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-2">Withdrawal <span className="text-[#00ff00]">System</span></h2>
          <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto text-sm">Flexible withdrawal options with transparent fees and processing times</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            {/* Withdrawal Types */}
            <div className="bg-black border border-gray-800 rounded-xl p-4 hover:border-[#00ff00] transition-all duration-300">
              <div className="text-center mb-3">
                <div className="flex justify-center mb-2">
                  <lord-icon
                    src="https://cdn.lordicon.com/qhgmphtg.json"
                    trigger="loop"
                    delay="2000"
                    colors="primary:#00ff00,secondary:#ffffff"
                    style={{width: "40px", height: "40px"}}>
                  </lord-icon>
                </div>
                <h3 className="text-base font-bold text-[#00ff00] mb-2">ROI Only</h3>
                <p className="text-gray-400 text-xs">Withdraw your earned returns while keeping your capital invested</p>
              </div>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-4 hover:border-[#00ff00] transition-all duration-300">
              <div className="text-center mb-3">
                <div className="flex justify-center mb-2">
                  <lord-icon
                    src="https://cdn.lordicon.com/wxnxiano.json"
                    trigger="loop"
                    delay="2500"
                    colors="primary:#00ff00,secondary:#ffffff"
                    style={{width: "40px", height: "40px"}}>
                  </lord-icon>
                </div>
                <h3 className="text-base font-bold text-[#00ff00] mb-2">Capital</h3>
                <p className="text-gray-400 text-xs">Withdraw your initial investment amount (ends the investment)</p>
              </div>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-4 hover:border-[#00ff00] transition-all duration-300">
              <div className="text-center mb-3">
                <div className="flex justify-center mb-2">
                  <lord-icon
                    src="https://cdn.lordicon.com/rjzlnunf.json"
                    trigger="loop"
                    delay="3000"
                    colors="primary:#00ff00,secondary:#ffffff"
                    style={{width: "40px", height: "40px"}}>
                  </lord-icon>
                </div>
                <h3 className="text-base font-bold text-[#00ff00] mb-2">Full Amount</h3>
                <p className="text-gray-400 text-xs">Withdraw everything - capital plus all earned returns</p>
              </div>
            </div>
          </div>

          {/* Withdrawal Rules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-black border border-gray-800 rounded-xl p-4">
              <h3 className="text-lg font-bold text-[#00ff00] mb-3">Withdrawal Rules</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-[#00ff00] rounded-full"></div>
                  <span className="text-gray-300 text-xs">Minimum withdrawal: <span className="text-[#00ff00] font-bold">$20 USDT</span></span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-[#00ff00] rounded-full"></div>
                  <span className="text-gray-300 text-xs">Processing fee: <span className="text-[#00ff00] font-bold">10%</span></span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-[#00ff00] rounded-full"></div>
                  <span className="text-gray-300 text-xs">Cooldown period: <span className="text-[#00ff00] font-bold">30 days</span></span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-[#00ff00] rounded-full"></div>
                  <span className="text-gray-300 text-xs">Admin approval required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-[#00ff00] rounded-full"></div>
                  <span className="text-gray-300 text-xs">Supports BEP20 & TRC20 networks</span>
                </div>
              </div>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-4">
              <h3 className="text-lg font-bold text-[#00ff00] mb-3">Processing Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#00ff00] text-black rounded-full flex items-center justify-center font-bold text-xs">1</div>
                  <div>
                    <h4 className="text-white font-bold mb-0.5 text-sm">Request Submission</h4>
                    <p className="text-gray-400 text-xs">Submit withdrawal request through dashboard</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#00ff00] text-black rounded-full flex items-center justify-center font-bold text-xs">2</div>
                  <div>
                    <h4 className="text-white font-bold mb-0.5 text-sm">Admin Review</h4>
                    <p className="text-gray-400 text-xs">24-48 hours for verification and approval</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#00ff00] text-black rounded-full flex items-center justify-center font-bold text-xs">3</div>
                  <div>
                    <h4 className="text-white font-bold mb-0.5 text-sm">Blockchain Processing</h4>
                    <p className="text-gray-400 text-xs">Funds sent to your wallet address</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        ref={setRef(6)}
        className="py-6 sm:py-10 px-4 bg-black transition-all duration-1000 animate-fade-in-safe"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-3">
            <lord-icon
              src="https://cdn.lordicon.com/kiynvdns.json"
              trigger="loop"
              delay="2000"
              colors="primary:#00ff00,secondary:#ffffff"
              style={{width: "50px", height: "50px"}}>
            </lord-icon>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mb-4 text-white">About <span className="text-[#00ff00]">NSC Bot</span></h2>
          <p className="text-sm text-gray-400 mb-4">
            NSC Bot is a cutting-edge automated trading platform that leverages artificial intelligence 
            to optimize USDT trading strategies. Our platform combines advanced market analysis, 
            risk management, and automated execution to deliver consistent results for our users.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <div className="flex justify-center mb-1">
                <lord-icon
                  src="https://cdn.lordicon.com/abfverha.json"
                  trigger="loop"
                  delay="2000"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "30px", height: "30px"}}>
                </lord-icon>
              </div>
              <h3 className="text-xl font-black text-[#00ff00] mb-1">24/7</h3>
              <p className="text-gray-400 text-xs">Trading</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <lord-icon
                  src="https://cdn.lordicon.com/eszyyflr.json"
                  trigger="loop"
                  delay="2200"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "40px", height: "40px"}}>
                </lord-icon>
              </div>
              <h3 className="text-3xl font-black text-[#00ff00] mb-2">AI</h3>
              <p className="text-gray-400">Powered</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <lord-icon
                  src="https://cdn.lordicon.com/kkvxgpti.json"
                  trigger="loop"
                  delay="2400"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "40px", height: "40px"}}>
                </lord-icon>
              </div>
              <h3 className="text-3xl font-black text-[#00ff00] mb-2">Secure</h3>
              <p className="text-gray-400">Platform</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <lord-icon
                  src="https://cdn.lordicon.com/slkvcfos.json"
                  trigger="loop"
                  delay="2600"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "40px", height: "40px"}}>
                </lord-icon>
              </div>
              <h3 className="text-3xl font-black text-[#00ff00] mb-2">Global</h3>
              <p className="text-gray-400">Access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Statistics Section */}
      <section 
        ref={setRef(7)}
        className="py-6 sm:py-10 px-4 bg-gradient-to-r from-[#00ff00]/5 to-transparent transition-all duration-1000 animate-fade-in-safe"
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-4 text-white">Platform <span className="text-[#00ff00]">Statistics</span></h2>
          <p className="text-sm text-gray-400 mb-6">
            Join thousands of successful investors earning consistent returns on our platform
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-black border border-gray-800 rounded-xl p-6 hover:border-[#00ff00] transition-all duration-300">
              <div className="flex justify-center mb-4">
                <lord-icon
                  src="https://cdn.lordicon.com/abfverha.json"
                  trigger="loop"
                  delay="2000"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "50px", height: "50px"}}>
                </lord-icon>
              </div>
              <h3 className="text-3xl font-black text-[#00ff00] mb-2">800+</h3>
              <p className="text-gray-400">Active Users</p>
            </div>
            <div className="bg-black border border-gray-800 rounded-xl p-6 hover:border-[#00ff00] transition-all duration-300">
              <div className="flex justify-center mb-4">
                <lord-icon
                  src="https://cdn.lordicon.com/qhgmphtg.json"
                  trigger="loop"
                  delay="2200"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "50px", height: "50px"}}>
                </lord-icon>
              </div>
              <h3 className="text-3xl font-black text-[#00ff00] mb-2">$1.25M+</h3>
              <p className="text-gray-400">Funds Managed</p>
            </div>
            <div className="bg-black border border-gray-800 rounded-xl p-6 hover:border-[#00ff00] transition-all duration-300">
              <div className="flex justify-center mb-4">
                <lord-icon
                  src="https://cdn.lordicon.com/rjzlnunf.json"
                  trigger="loop"
                  delay="2400"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "50px", height: "50px"}}>
                </lord-icon>
              </div>
              <h3 className="text-3xl font-black text-[#00ff00] mb-2">$200K+</h3>
              <p className="text-gray-400">ROI Distributed</p>
            </div>
            <div className="bg-black border border-gray-800 rounded-xl p-6 hover:border-[#00ff00] transition-all duration-300">
              <div className="flex justify-center mb-4">
                <lord-icon
                  src="https://cdn.lordicon.com/wxnxiano.json"
                  trigger="loop"
                  delay="2600"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "50px", height: "50px"}}>
                </lord-icon>
              </div>
              <h3 className="text-3xl font-black text-[#00ff00] mb-2">79.7%</h3>
              <p className="text-gray-400">Success Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={setRef(8)}
        className="py-6 sm:py-10 px-4 bg-black transition-all duration-1000 animate-fade-in-safe"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-2 text-white">Platform <span className="text-[#00ff00]">Features</span></h2>
          <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto text-sm">Discover what makes NSC Bot the premier choice for automated crypto trading</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-black border border-gray-800 rounded-xl p-8 hover:border-[#00ff00] transition-all duration-300 stagger-1">
              <div className="flex justify-center mb-6">
                <lord-icon
                  src="https://cdn.lordicon.com/qhgmphtg.json"
                  trigger="loop"
                  delay="2000"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "60px", height: "60px"}}>
                </lord-icon>
              </div>
              <h3 className="text-xl font-bold text-[#00ff00] mb-4 text-center">Consistent Returns</h3>
              <p className="text-gray-400 text-center">Earn up to 3-5% monthly ROI automatically deposited to your account. Withdraw anytime after 30 days with transparent fee structure.</p>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-8 hover:border-[#00ff00] transition-all duration-300 stagger-2">
              <div className="flex justify-center mb-6">
                <lord-icon
                  src="https://cdn.lordicon.com/kkvxgpti.json"
                  trigger="loop"
                  delay="2200"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "60px", height: "60px"}}>
                </lord-icon>
              </div>
              <h3 className="text-xl font-bold text-[#00ff00] mb-4 text-center">Secure & Transparent</h3>
              <p className="text-gray-400 text-center">All transactions on BEP20 & TRC20 blockchains. Fully verifiable, transparent operations with multi-layer security.</p>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-8 hover:border-[#00ff00] transition-all duration-300 stagger-3">
              <div className="flex justify-center mb-6">
                <lord-icon
                  src="https://cdn.lordicon.com/gqdnbnwt.json"
                  trigger="loop"
                  delay="2400"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "60px", height: "60px"}}>
                </lord-icon>
              </div>
              <h3 className="text-xl font-bold text-[#00ff00] mb-4 text-center">Referral Rewards</h3>
              <p className="text-gray-400 text-center">Earn 2% direct referral bonus + 6-level deep commission. Build unlimited network and maximize passive income.</p>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-8 hover:border-[#00ff00] transition-all duration-300 stagger-1">
              <div className="flex justify-center mb-6">
                <lord-icon
                  src="https://cdn.lordicon.com/eszyyflr.json"
                  trigger="loop"
                  delay="2600"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "60px", height: "60px"}}>
                </lord-icon>
              </div>
              <h3 className="text-xl font-bold text-[#00ff00] mb-4 text-center">Real-Time Dashboard</h3>
              <p className="text-gray-400 text-center">Track investments, ROI, and network earnings in real-time with detailed analytics and performance metrics.</p>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-8 hover:border-[#00ff00] transition-all duration-300 stagger-2">
              <div className="flex justify-center mb-6">
                <lord-icon
                  src="https://cdn.lordicon.com/abfverha.json"
                  trigger="loop"
                  delay="2800"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "60px", height: "60px"}}>
                </lord-icon>
              </div>
              <h3 className="text-xl font-bold text-[#00ff00] mb-4 text-center">Instant Activation</h3>
              <p className="text-gray-400 text-center">Deposits confirmed within 3-5 minutes. Start earning ROI immediately after confirmation with instant setup.</p>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-8 hover:border-[#00ff00] transition-all duration-300 stagger-3">
              <div className="flex justify-center mb-6">
                <lord-icon
                  src="https://cdn.lordicon.com/slkvcfos.json"
                  trigger="loop"
                  delay="3000"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "60px", height: "60px"}}>
                </lord-icon>
              </div>
              <h3 className="text-xl font-bold text-[#00ff00] mb-4 text-center">24/7 Support</h3>
              <p className="text-gray-400 text-center">Round-the-clock customer support with dedicated account managers for premium packages and technical assistance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section 
        ref={setRef(9)}
        className="py-6 sm:py-10 px-4 bg-gradient-to-r from-[#00ff00]/5 to-transparent transition-all duration-1000 animate-fade-in-safe"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-2 text-white">Frequently Asked <span className="text-[#00ff00]">Questions</span></h2>
          <p className="text-center text-gray-400 mb-8 text-sm">Get answers to the most common questions about NSC Bot Platform</p>
          
          <div className="space-y-6">
            <details className="group bg-black border border-gray-800 rounded-xl hover:border-[#00ff00] transition-all duration-300">
              <summary className="flex items-center justify-between cursor-pointer p-6 hover:bg-gray-900/50 rounded-xl transition-all">
                <span className="text-white font-bold text-lg">How do I make my first investment?</span>
                <div className="flex justify-center">
                  <lord-icon
                    src="https://cdn.lordicon.com/lupuorrc.json"
                    trigger="click"
                    colors="primary:#00ff00,secondary:#ffffff"
                    style={{width: "24px", height: "24px"}}>
                  </lord-icon>
                </div>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                Navigate to the Packages section, choose your desired package (NEO, NEURAL, or ORACLE), and follow the payment instructions. You'll need to send USDT to the provided wallet address via BEP20 or TRC20 network.
              </div>
            </details>

            <details className="group bg-black border border-gray-800 rounded-xl hover:border-[#00ff00] transition-all duration-300">
              <summary className="flex items-center justify-between cursor-pointer p-6 hover:bg-gray-900/50 rounded-xl transition-all">
                <span className="text-white font-bold text-lg">When will I receive my ROI payments?</span>
                <div className="flex justify-center">
                  <lord-icon
                    src="https://cdn.lordicon.com/lupuorrc.json"
                    trigger="click"
                    colors="primary:#00ff00,secondary:#ffffff"
                    style={{width: "24px", height: "24px"}}>
                  </lord-icon>
                </div>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                ROI payments are processed monthly on the same date you made your investment. You'll receive notifications via email when payments are processed and can track them in your dashboard.
              </div>
            </details>

            <details className="group bg-black border border-gray-800 rounded-xl hover:border-[#00ff00] transition-all duration-300">
              <summary className="flex items-center justify-between cursor-pointer p-6 hover:bg-gray-900/50 rounded-xl transition-all">
                <span className="text-white font-bold text-lg">How do I activate my trading bot?</span>
                <div className="flex justify-center">
                  <lord-icon
                    src="https://cdn.lordicon.com/lupuorrc.json"
                    trigger="click"
                    colors="primary:#00ff00,secondary:#ffffff"
                    style={{width: "24px", height: "24px"}}>
                  </lord-icon>
                </div>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                Go to the Bot Activation section in your dashboard, select your bot type (NEO $50, NEURAL $100, or ORACLE $150), and complete the activation fee payment. Bots are required to earn referral commissions.
              </div>
            </details>

            <details className="group bg-black border border-gray-800 rounded-xl hover:border-[#00ff00] transition-all duration-300">
              <summary className="flex items-center justify-between cursor-pointer p-6 hover:bg-gray-900/50 rounded-xl transition-all">
                <span className="text-white font-bold text-lg">What are the withdrawal limits and fees?</span>
                <div className="flex justify-center">
                  <lord-icon
                    src="https://cdn.lordicon.com/lupuorrc.json"
                    trigger="click"
                    colors="primary:#00ff00,secondary:#ffffff"
                    style={{width: "24px", height: "24px"}}>
                  </lord-icon>
                </div>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                Minimum withdrawal is $20 USDT with a 10% processing fee. There's a 30-day cooldown period between withdrawals, and all withdrawals require admin approval for security purposes.
              </div>
            </details>

            <details className="group bg-black border border-gray-800 rounded-xl hover:border-[#00ff00] transition-all duration-300">
              <summary className="flex items-center justify-between cursor-pointer p-6 hover:bg-gray-900/50 rounded-xl transition-all">
                <span className="text-white font-bold text-lg">How does the referral system work?</span>
                <div className="flex justify-center">
                  <lord-icon
                    src="https://cdn.lordicon.com/lupuorrc.json"
                    trigger="click"
                    colors="primary:#00ff00,secondary:#ffffff"
                    style={{width: "24px", height: "24px"}}>
                  </lord-icon>
                </div>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                Share your referral code with others. When they invest, you earn commissions up to 6 levels deep: Direct 2%, Level 1: 2%, Level 2: 0.75%, Level 3: 0.50%, Level 4: 0.25%, Level 5: 0.15%, Level 6: 0.10%. Bot activation is required to receive referral earnings.
              </div>
            </details>

            <details className="group bg-black border border-gray-800 rounded-xl hover:border-[#00ff00] transition-all duration-300">
              <summary className="flex items-center justify-between cursor-pointer p-6 hover:bg-gray-900/50 rounded-xl transition-all">
                <span className="text-white font-bold text-lg">Is my investment secure?</span>
                <div className="flex justify-center">
                  <lord-icon
                    src="https://cdn.lordicon.com/lupuorrc.json"
                    trigger="click"
                    colors="primary:#00ff00,secondary:#ffffff"
                    style={{width: "24px", height: "24px"}}>
                  </lord-icon>
                </div>
              </summary>
              <div className="px-6 pb-6 text-gray-400">
                Yes, all transactions are conducted on secure blockchain networks (BEP20 & TRC20). We use advanced encryption, multi-layer security protocols, and comply with KYC/AML regulations to protect your investments.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section 
        ref={setRef(10)}
        className="py-6 sm:py-10 px-4 bg-black transition-all duration-1000 animate-fade-in-safe"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-2 text-white">Trust & <span className="text-[#00ff00]">Security</span></h2>
          <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto text-sm">Your security is our priority. We implement industry-leading security measures to protect your investments</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Security Features */}
            <div>
              <h3 className="text-2xl font-bold text-[#00ff00] mb-8">Security Features</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <lord-icon
                      src="https://cdn.lordicon.com/kkvxgpti.json"
                      trigger="loop"
                      delay="2000"
                      colors="primary:#00ff00,secondary:#ffffff"
                      style={{width: "40px", height: "40px"}}>
                    </lord-icon>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">Blockchain Security</h4>
                    <p className="text-gray-400">All transactions verified on BEP20 & TRC20 networks with full transparency and immutability.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <lord-icon
                      src="https://cdn.lordicon.com/abfverha.json"
                      trigger="loop"
                      delay="2200"
                      colors="primary:#00ff00,secondary:#ffffff"
                      style={{width: "40px", height: "40px"}}>
                    </lord-icon>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">Multi-Layer Encryption</h4>
                    <p className="text-gray-400">Advanced encryption protocols protect your personal data and financial information at all times.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <lord-icon
                      src="https://cdn.lordicon.com/eszyyflr.json"
                      trigger="loop"
                      delay="2400"
                      colors="primary:#00ff00,secondary:#ffffff"
                      style={{width: "40px", height: "40px"}}>
                    </lord-icon>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">Secure Wallet Management</h4>
                    <p className="text-gray-400">Cold storage solutions and multi-signature wallets ensure maximum security for your funds.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance */}
            <div>
              <h3 className="text-2xl font-bold text-[#00ff00] mb-8">Compliance & Regulations</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <lord-icon
                      src="https://cdn.lordicon.com/wxnxiano.json"
                      trigger="loop"
                      delay="2600"
                      colors="primary:#00ff00,secondary:#ffffff"
                      style={{width: "40px", height: "40px"}}>
                    </lord-icon>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">KYC/AML Compliance</h4>
                    <p className="text-gray-400">Full Know Your Customer and Anti-Money Laundering compliance to ensure legal operations.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <lord-icon
                      src="https://cdn.lordicon.com/gqdnbnwt.json"
                      trigger="loop"
                      delay="2800"
                      colors="primary:#00ff00,secondary:#ffffff"
                      style={{width: "40px", height: "40px"}}>
                    </lord-icon>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">Regulatory Compliance</h4>
                    <p className="text-gray-400">Adhering to international financial regulations and maintaining transparent operations.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <lord-icon
                      src="https://cdn.lordicon.com/slkvcfos.json"
                      trigger="loop"
                      delay="3000"
                      colors="primary:#00ff00,secondary:#ffffff"
                      style={{width: "40px", height: "40px"}}>
                    </lord-icon>
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-2">Audit & Monitoring</h4>
                    <p className="text-gray-400">Regular security audits and 24/7 monitoring to detect and prevent any suspicious activities.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Badges */}
          <div className="bg-gradient-to-r from-[#00ff00]/10 to-transparent border border-[#00ff00]/30 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-[#00ff00] mb-6">Security Certifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#00ff00]/20 rounded-full flex items-center justify-center mb-2">
                  <lord-icon
                    src="https://cdn.lordicon.com/kkvxgpti.json"
                    trigger="loop"
                    delay="2000"
                    colors="primary:#00ff00,secondary:#ffffff"
                    style={{width: "32px", height: "32px"}}>
                  </lord-icon>
                </div>
                <span className="text-gray-300 text-sm">SSL Secured</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#00ff00]/20 rounded-full flex items-center justify-center mb-2">
                  <lord-icon
                    src="https://cdn.lordicon.com/abfverha.json"
                    trigger="loop"
                    delay="2200"
                    colors="primary:#00ff00,secondary:#ffffff"
                    style={{width: "32px", height: "32px"}}>
                  </lord-icon>
                </div>
                <span className="text-gray-300 text-sm">KYC Verified</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#00ff00]/20 rounded-full flex items-center justify-center mb-2">
                  <lord-icon
                    src="https://cdn.lordicon.com/eszyyflr.json"
                    trigger="loop"
                    delay="2400"
                    colors="primary:#00ff00,secondary:#ffffff"
                    style={{width: "32px", height: "32px"}}>
                  </lord-icon>
                </div>
                <span className="text-gray-300 text-sm">Blockchain Verified</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-[#00ff00]/20 rounded-full flex items-center justify-center mb-2">
                  <lord-icon
                    src="https://cdn.lordicon.com/wxnxiano.json"
                    trigger="loop"
                    delay="2600"
                    colors="primary:#00ff00,secondary:#ffffff"
                    style={{width: "32px", height: "32px"}}>
                  </lord-icon>
                </div>
                <span className="text-gray-300 text-sm">AML Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        ref={setRef(11)}
        className="py-6 sm:py-10 px-4 bg-gradient-to-r from-[#00ff00]/5 to-transparent transition-all duration-1000 animate-fade-in-safe"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-2 text-white">What Our <span className="text-[#00ff00]">Users Say</span></h2>
          <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto text-sm">Real stories from successful investors earning consistent returns with NSC Bot</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black border border-gray-800 rounded-xl p-8 hover:border-[#00ff00] transition-all duration-300 stagger-1">
              <div className="flex justify-center mb-6">
                <lord-icon
                  src="https://cdn.lordicon.com/abfverha.json"
                  trigger="loop"
                  delay="2000"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "50px", height: "50px"}}>
                </lord-icon>
              </div>
              <div className="text-center mb-6">
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#00ff00] text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-400 italic mb-4">
                  "I've been using NSC Bot for 8 months now and consistently receive my 4% monthly ROI. The platform is transparent and the support team is excellent. Already earned over $3,200!"
                </p>
              </div>
              <div className="text-center">
                <h4 className="text-white font-bold">Sarah Chen</h4>
                <p className="text-gray-500 text-sm">NEURAL Package Investor</p>
                <p className="text-[#00ff00] text-sm font-bold">Earned: $3,250</p>
              </div>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-8 hover:border-[#00ff00] transition-all duration-300 stagger-2">
              <div className="flex justify-center mb-6">
                <lord-icon
                  src="https://cdn.lordicon.com/qhgmphtg.json"
                  trigger="loop"
                  delay="2200"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "50px", height: "50px"}}>
                </lord-icon>
              </div>
              <div className="text-center mb-6">
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#00ff00] text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-400 italic mb-4">
                  "The referral system is amazing! I've built a network of 45+ people and earn passive income from 6 levels. Bot activation was the best investment I made."
                </p>
              </div>
              <div className="text-center">
                <h4 className="text-white font-bold">Marcus Rodriguez</h4>
                <p className="text-gray-500 text-sm">ORACLE Package Investor</p>
                <p className="text-[#00ff00] text-sm font-bold">Network: 45+ Referrals</p>
              </div>
            </div>

            <div className="bg-black border border-gray-800 rounded-xl p-8 hover:border-[#00ff00] transition-all duration-300 stagger-3">
              <div className="flex justify-center mb-6">
                <lord-icon
                  src="https://cdn.lordicon.com/eszyyflr.json"
                  trigger="loop"
                  delay="2400"
                  colors="primary:#00ff00,secondary:#ffffff"
                  style={{width: "50px", height: "50px"}}>
                </lord-icon>
              </div>
              <div className="text-center mb-6">
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#00ff00] text-xl">★</span>
                  ))}
                </div>
                <p className="text-gray-400 italic mb-4">
                  "Started with NEO package as a beginner. The platform is user-friendly and withdrawals are processed smoothly. Planning to upgrade to NEURAL next month!"
                </p>
              </div>
              <div className="text-center">
                <h4 className="text-white font-bold">Emily Johnson</h4>
                <p className="text-gray-500 text-sm">NEO Package Investor</p>
                <p className="text-[#00ff00] text-sm font-bold">6 Months Active</p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-black border border-gray-800 rounded-2xl p-8 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-[#00ff00] mb-4">Join 800+ Satisfied Investors</h3>
              <p className="text-gray-400 mb-6">
                Our community of successful investors continues to grow every day. Start your journey towards financial freedom with consistent, reliable returns.
              </p>
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <h4 className="text-2xl font-bold text-[#00ff00]">4.9/5</h4>
                  <p className="text-gray-400 text-sm">Average Rating</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-[#00ff00]">79.7%</h4>
                  <p className="text-gray-400 text-sm">Success Rate</p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-[#00ff00]">$200K+</h4>
                  <p className="text-gray-400 text-sm">Total Paid Out</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Activity Feed Section */}
      <section 
        ref={setRef(12)}
        className="py-6 sm:py-10 px-4 bg-black transition-all duration-1000 animate-fade-in-safe"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-2 text-white">Live Platform <span className="text-[#00ff00]">Activity</span></h2>
          <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto text-sm">See real-time activity from our active community of investors</p>
          
          <div className="space-y-8">
            {/* Recent Investments */}
            <div className="bg-gradient-to-br from-gray-900/90 to-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-800/50 bg-gray-900/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00ff00]/10 rounded-lg flex items-center justify-center">
                    <lord-icon
                      src="https://cdn.lordicon.com/qhgmphtg.json"
                      trigger="loop"
                      delay="2000"
                      colors="primary:#00ff00,secondary:#ffffff"
                      style={{width: "20px", height: "20px"}}>
                    </lord-icon>
                  </div>
                  Recent Investments
                </h3>
                <div className="flex items-center gap-2 bg-[#00ff00]/10 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-[#00ff00] rounded-full animate-pulse"></div>
                  <span className="text-[#00ff00] text-xs font-semibold">LIVE</span>
                </div>
              </div>
              
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-gray-900/30 border-b border-gray-800/30">
                <div className="text-gray-400 text-sm font-semibold">User</div>
                <div className="text-gray-400 text-sm font-semibold">Package</div>
                <div className="text-gray-400 text-sm font-semibold text-right">Amount</div>
                <div className="text-gray-400 text-sm font-semibold text-center">Status</div>
                <div className="text-gray-400 text-sm font-semibold text-right">Time</div>
              </div>
              
              {/* Table Body */}
              <div 
                ref={investmentScrollRef}
                className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#00ff00]/30 scrollbar-track-transparent"
              >
                {investments.slice(0, 25).map((investment, index) => (
                  <div 
                    key={investment.id} 
                    className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-800/20 hover:bg-gray-900/30 transition-all duration-200"
                    style={{ 
                      animation: index === 0 ? 'slideDown 0.4s ease-out' : 'none',
                      opacity: Math.max(0.5, 1 - (index * 0.02))
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#00ff00] rounded-full flex-shrink-0" style={{ opacity: index === 0 ? 1 : 0.4 }}></div>
                      <span className="text-white font-medium text-sm truncate">{investment.user}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400 text-sm">{investment.type}</span>
                    </div>
                    <div className="flex items-center justify-end">
                      <div className="flex items-center gap-1.5 bg-[#00ff00]/10 px-3 py-1 rounded">
                        <span className="text-[#00ff00] font-bold text-sm">${investment.amount.toLocaleString()}</span>
                        <svg className="w-3 h-3 text-[#00ff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      {index === 0 ? (
                        <span className="bg-[#00ff00]/20 text-[#00ff00] px-2.5 py-1 rounded-full text-xs font-semibold">NEW</span>
                      ) : (
                        <span className="bg-gray-800/50 text-gray-400 px-2.5 py-1 rounded-full text-xs font-medium">Confirmed</span>
                      )}
                    </div>
                    <div className="flex items-center justify-end">
                      <span className="text-gray-500 text-xs">{investment.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Withdrawals */}
            <div className="bg-gradient-to-br from-gray-900/90 to-black border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-gray-800/50 bg-gray-900/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#00ff00]/10 rounded-lg flex items-center justify-center">
                    <lord-icon
                      src="https://cdn.lordicon.com/rjzlnunf.json"
                      trigger="loop"
                      delay="2200"
                      colors="primary:#00ff00,secondary:#ffffff"
                      style={{width: "20px", height: "20px"}}>
                    </lord-icon>
                  </div>
                  Recent Withdrawals
                </h3>
                <div className="flex items-center gap-2 bg-[#00ff00]/10 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-[#00ff00] rounded-full animate-pulse"></div>
                  <span className="text-[#00ff00] text-xs font-semibold">LIVE</span>
                </div>
              </div>
              
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-gray-900/30 border-b border-gray-800/30">
                <div className="text-gray-400 text-sm font-semibold">User</div>
                <div className="text-gray-400 text-sm font-semibold">Type</div>
                <div className="text-gray-400 text-sm font-semibold text-right">Amount</div>
                <div className="text-gray-400 text-sm font-semibold text-center">Status</div>
                <div className="text-gray-400 text-sm font-semibold text-right">Time</div>
              </div>
              
              {/* Table Body */}
              <div 
                ref={withdrawalScrollRef}
                className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#00ff00]/30 scrollbar-track-transparent"
              >
                {withdrawals.slice(0, 25).map((withdrawal, index) => (
                  <div 
                    key={withdrawal.id} 
                    className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-800/20 hover:bg-gray-900/30 transition-all duration-200"
                    style={{ 
                      animation: index === 0 ? 'slideDown 0.4s ease-out' : 'none',
                      opacity: Math.max(0.5, 1 - (index * 0.02))
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#00ff00] rounded-full flex-shrink-0" style={{ opacity: index === 0 ? 1 : 0.4 }}></div>
                      <span className="text-white font-medium text-sm truncate">{withdrawal.user}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400 text-sm">{withdrawal.type}</span>
                    </div>
                    <div className="flex items-center justify-end">
                      <div className="flex items-center gap-1.5 bg-red-500/10 px-3 py-1 rounded">
                        <span className="text-red-400 font-bold text-sm">${withdrawal.amount.toLocaleString()}</span>
                        <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      {index === 0 ? (
                        <span className="bg-[#00ff00]/20 text-[#00ff00] px-2.5 py-1 rounded-full text-xs font-semibold">PAID</span>
                      ) : (
                        <span className="bg-gray-800/50 text-gray-400 px-2.5 py-1 rounded-full text-xs font-medium">Processed</span>
                      )}
                    </div>
                    <div className="flex items-center justify-end">
                      <span className="text-gray-500 text-xs">{withdrawal.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="mt-12 bg-gradient-to-r from-[#00ff00]/10 to-transparent border border-[#00ff00]/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-[#00ff00] mb-6 text-center">24H Platform Activity</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <h4 className="text-2xl font-bold text-[#00ff00] mb-2">18</h4>
                <p className="text-gray-400">New Investments</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-[#00ff00] mb-2">12</h4>
                <p className="text-gray-400">Withdrawals Processed</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-[#00ff00] mb-2">$47K</h4>
                <p className="text-gray-400">Total Volume</p>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-[#00ff00] mb-2">9</h4>
                <p className="text-gray-400">New Registrations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={setRef(13)}
        className="py-6 sm:py-10 px-4 bg-gradient-to-r from-[#00ff00]/10 to-transparent transition-all duration-1000 animate-fade-in-safe"
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">Ready to Start Trading?</h2>
          <p className="text-lg text-gray-400 mb-8">
            Join thousands of users who trust NSC Bot for their automated trading needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="bg-[#00ff00] text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#00cc00] transition-all">
              Create Account
            </a>
            <a href="/labs" className="border-2 border-[#00ff00] text-[#00ff00] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#00ff00] hover:text-black transition-all">
              Explore Labs
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 px-4 bg-black min-h-[300px] relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 relative z-30">
          <div>
            <h4 className="text-lg font-bold text-[#00ff00] mb-4">NSC Bot</h4>
            <p className="text-gray-400">Automated USDT trading platform powered by advanced AI algorithms.</p>
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#00ff00] mb-4">Platform</h4>
            <div className="space-y-2">
              <a href="/pricing" className="block text-gray-400 hover:text-[#00ff00] transition-colors">Pricing</a>
              <a href="/labs" className="block text-gray-400 hover:text-[#00ff00] transition-colors">Labs</a>
              <a href="/register" className="block text-gray-400 hover:text-[#00ff00] transition-colors">Register</a>
              <a href="/login" className="block text-gray-400 hover:text-[#00ff00] transition-colors">Login</a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#00ff00] mb-4">Support</h4>
            <div className="space-y-2">
              <a href="/faq" className="block text-gray-400 hover:text-[#00ff00] transition-colors">FAQ</a>
              <a href="/contact" className="block text-gray-400 hover:text-[#00ff00] transition-colors">Contact Us</a>
              <a href="/terms" className="block text-gray-400 hover:text-[#00ff00] transition-colors">Terms</a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold text-[#00ff00] mb-4">Connect</h4>
            <div className="space-y-2">
              <a href="https://twitter.com/nscbot" className="block text-gray-400 hover:text-[#00ff00] transition-colors">Twitter</a>
              <a href="https://t.me/nscbot" className="block text-gray-400 hover:text-[#00ff00] transition-colors">Telegram</a>
              <a href="https://discord.gg/nscbot" className="block text-gray-400 hover:text-[#00ff00] transition-colors">Discord</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 relative z-30">
          <p>&copy; 2025 NSC Bot. All rights reserved. Investment involves risk.</p>
        </div>
      </footer>
    </div>
  );

  // Return with or without Lenis based on device
  return (
    <>
      <ErrorSuppressor />
      {!isMobile ? (
        <LenisScroll>{PageContent()}</LenisScroll>
      ) : (
        PageContent()
      )}
    </>
  );
}
