'use client'

import React, { useState, useEffect } from 'react'
import { Zap } from 'lucide-react'

const themes = [
  { name: 'dark', label: 'Dark', icon: Zap },
]

export const ThemeToggler: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState('dark')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const savedTheme = localStorage.getItem('theme')
    const isValidTheme = themes.some((theme) => theme.name === savedTheme)
    const theme = isValidTheme ? savedTheme! : 'dark'
    if (!isValidTheme) {
      localStorage.setItem('theme', theme)
    }
    setCurrentTheme(theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme)
    document.documentElement.setAttribute('data-theme', theme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme)
    }
    setIsOpen(false)
  }

  const CurrentIcon = themes.find(t => t.name === currentTheme)?.icon || Zap

  return (
    <div className="dropdown dropdown-end">
      <label 
        tabIndex={0} 
        className="btn btn-ghost btn-circle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CurrentIcon className="h-5 w-5" />
      </label>
      {isOpen && (
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-52 mt-3">
          <li className="menu-title">
            <span>Choose Theme</span>
          </li>
          {themes.map((theme) => {
            const Icon = theme.icon
            return (
              <li key={theme.name}>
                <button
                  className={`flex items-center gap-3 ${currentTheme === theme.name ? 'active' : ''}`}
                  onClick={() => handleThemeChange(theme.name)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{theme.label}</span>
                  {currentTheme === theme.name && (
                    <span className="badge badge-primary badge-sm ml-auto">Active</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default ThemeToggler
