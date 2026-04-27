'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Globe, 
  LogIn, 
  LogOut, 
  Sparkles, 
  Menu,
  X
} from 'lucide-react'
import { motion } from 'framer-motion'

interface HeaderProps {
  isLoggedIn: boolean
  onSignIn: (key: string) => void
  onSignOut: () => void
}

export function Header({ isLoggedIn, onSignIn, onSignOut }: HeaderProps) {
  const [apiKey, setApiKey] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Load key from localStorage on mount
  React.useEffect(() => {
    const savedKey = localStorage.getItem('aether_auth_key')
    if (savedKey) {
      setApiKey(savedKey)
      // Auto sign-in if key exists
      onSignIn(savedKey)
    }
  }, [])

  const handleSignIn = () => {
    if (apiKey.trim()) {
      localStorage.setItem('aether_auth_key', apiKey)
      onSignIn(apiKey)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('aether_auth_key')
    onSignOut()
  }

  return (
    <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="text-black w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">
            Aether
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white cursor-pointer transition-colors">
            <Globe className="w-4 h-4" />
            <span>EN</span>
          </div>

          {!isLoggedIn ? (
            <div className="flex items-center gap-3 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
              <Input 
                placeholder="Sign in with your API key" 
                className="h-9 w-64 bg-transparent border-none focus-visible:ring-0 text-sm"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button 
                size="sm" 
                onClick={handleSignIn}
                className="h-8 px-4 rounded-lg bg-white text-black hover:bg-zinc-200"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-zinc-400"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-white/10 bg-black p-4 space-y-4"
        >
          <div className="flex items-center justify-between text-zinc-400">
            <span>Language</span>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>EN</span>
            </div>
          </div>
          {!isLoggedIn ? (
            <div className="space-y-2">
              <Input 
                placeholder="API Key" 
                className="bg-zinc-900 border-white/10"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button 
                className="w-full bg-white text-black"
                onClick={() => onSignIn(apiKey)}
              >
                Sign In
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full border-white/10 text-zinc-400"
              onClick={onSignOut}
            >
              Sign out
            </Button>
          )}
        </motion.div>
      )}
    </header>
  )
}
