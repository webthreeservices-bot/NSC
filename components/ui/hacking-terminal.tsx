'use client'

import { useState, useEffect, useRef } from 'react'
import { Spotlight } from "@/components/ui/spotlight"

interface TerminalLine {
  id: number
  text: string
  type: 'command' | 'output' | 'success' | 'error' | 'warning'
  delay?: number
}

export function HackingTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [showCursor, setShowCursor] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const hackingSequence: TerminalLine[] = [
    { id: 1, text: 'root@nsc-bot:~$ initializing NSC Bot system...', type: 'command', delay: 100 },
    { id: 2, text: '[✓] Loading AI trading algorithms', type: 'success', delay: 80 },
    { id: 3, text: '[✓] Connecting to USDT markets', type: 'success', delay: 60 },
    { id: 4, text: '[✓] Establishing secure blockchain connection', type: 'success', delay: 90 },
    { id: 5, text: '[!] Scanning market volatility...', type: 'warning', delay: 70 },
    { id: 6, text: 'root@nsc-bot:~$ ./start_trading_engine.sh', type: 'command', delay: 120 },
    { id: 7, text: 'Initializing neural network...', type: 'output', delay: 80 },
    { id: 8, text: 'Loading market data streams...', type: 'output', delay: 60 },
    { id: 9, text: '[✓] Trading engine online', type: 'success', delay: 100 },
    { id: 10, text: '[✓] Risk management protocols active', type: 'success', delay: 90 },
    { id: 11, text: 'root@nsc-bot:~$ status --all', type: 'command', delay: 80 },
    { id: 12, text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', type: 'output', delay: 50 },
    { id: 13, text: '🤖 NSC BOT STATUS: OPERATIONAL', type: 'success', delay: 100 },
    { id: 14, text: '💰 USDT PAIRS: 47 ACTIVE', type: 'success', delay: 80 },
    { id: 15, text: '📊 ALGORITHMS: 12 RUNNING', type: 'success', delay: 70 },
    { id: 16, text: '🔒 SECURITY: MAXIMUM', type: 'success', delay: 90 },
    { id: 17, text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', type: 'output', delay: 50 },
    { id: 18, text: 'root@nsc-bot:~$ welcome_user', type: 'command', delay: 100 },
    { id: 19, text: 'Welcome to NSC Bot - Your AI Trading Companion', type: 'success', delay: 120 },
    { id: 20, text: 'Ready for automated USDT trading...', type: 'output', delay: 100 },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentLineIndex < hackingSequence.length) {
        setIsTyping(true)
        const currentLine = hackingSequence[currentLineIndex]
        
        setTimeout(() => {
          setLines(prev => [...prev, currentLine])
          setCurrentLineIndex(prev => prev + 1)
          setIsTyping(false)
        }, currentLine.delay || 100)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [currentLineIndex])

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)

    return () => clearInterval(cursorTimer)
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  const getLineColor = (type: string) => {
    switch (type) {
      case 'command':
        return 'text-[#00ff00]'
      case 'success':
        return 'text-[#00ff00]'
      case 'error':
        return 'text-red-400'
      case 'warning':
        return 'text-yellow-400'
      case 'output':
        return 'text-gray-300'
      default:
        return 'text-white'
    }
  }

  const restartSequence = () => {
    setLines([])
    setCurrentLineIndex(0)
    setIsTyping(false)
  }

  return (
    <div className="w-full h-full bg-transparent font-mono text-sm relative">
      {/* Terminal Header */}
      <div className="bg-gray-900 px-4 py-2 border-b border-[#00ff00]/30 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-[#00ff00] rounded-full"></div>
        </div>
        <div className="text-[#00ff00] text-xs font-bold">NSC-BOT-TERMINAL v2.1.0</div>
        <button 
          onClick={restartSequence}
          className="text-[#00ff00] hover:text-[#00cc00] text-xs"
        >
          RESTART
        </button>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="p-4 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#00ff00] scrollbar-track-gray-900"
      >
        {/* ASCII Art Header */}
        <div className="text-[#00ff00] mb-4 text-xs leading-tight">
          <pre>{`
███╗   ██╗███████╗ ██████╗    ██████╗  ██████╗ ████████╗
████╗  ██║██╔════╝██╔════╝    ██╔══██╗██╔═══██╗╚══██╔══╝
██╔██╗ ██║███████╗██║         ██████╔╝██║   ██║   ██║   
██║╚██╗██║╚════██║██║         ██╔══██╗██║   ██║   ██║   
██║ ╚████║███████║╚██████╗    ██████╔╝╚██████╔╝   ██║   
╚═╝  ╚═══╝╚══════╝ ╚═════╝    ╚═════╝  ╚═════╝    ╚═╝   
          `}</pre>
        </div>

        {/* Terminal Lines */}
        {lines.map((line) => (
          <div key={line.id} className={`mb-1 ${getLineColor(line.type)}`}>
            {line.text}
          </div>
        ))}

        {/* Current Typing Line */}
        {isTyping && (
          <div className="text-[#00ff00] flex items-center">
            <span>Processing...</span>
            <div className="ml-2 flex space-x-1">
              <div className="w-1 h-1 bg-[#00ff00] rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-[#00ff00] rounded-full animate-bounce delay-100"></div>
              <div className="w-1 h-1 bg-[#00ff00] rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}

        {/* Cursor */}
        {currentLineIndex >= hackingSequence.length && (
          <div className="text-[#00ff00] flex items-center">
            <span>root@nsc-bot:~$ </span>
            <span className={`ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>█</span>
          </div>
        )}

        {/* Matrix Rain Effect */}
        {isMounted && (
          <div className="absolute top-0 right-0 w-20 h-full opacity-20 overflow-hidden pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-[#00ff00] text-xs"
                style={{
                  left: `${i * 10}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '3s'
                }}
              >
                {Array.from({ length: 20 }).map((_, j) => (
                  <div key={j} className="opacity-30">
                    {(i + j) % 2 === 0 ? '1' : '0'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
