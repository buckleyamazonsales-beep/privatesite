'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { UsageMetrics } from '@/components/dashboard/UsageMetrics'
import { ApiKeyManagement } from '@/components/dashboard/ApiKeyManagement'
import { ModelCards } from '@/components/dashboard/ModelCards'
import { SetupGuide } from '@/components/dashboard/SetupGuide'
import { GmailGenerator } from '@/components/dashboard/GmailGenerator'
import { SpotifyPlayer } from '@/components/layout/SpotifyPlayer'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AetherDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [dailyQuote, setDailyQuote] = useState({ text: '', author: '' })

  const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
    { text: "Do not go where the path may lead, go instead where there is no path.", author: "Ralph Waldo Emerson" },
    { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue.", author: "Winston Churchill" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
    { text: "What you get by achieving your goals is not as important as what you become.", author: "Henry David Thoreau" }
  ]

  useEffect(() => {
    // Select random quote on refresh
    const randomIdx = Math.floor(Math.random() * quotes.length)
    const quote = quotes[randomIdx]
    setDailyQuote(quote)

    // Simulate initial load
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleSignIn = (key: string) => {
    if (key.trim()) {
      setLoading(true)
      setTimeout(() => {
        setIsLoggedIn(true)
        setLoading(false)
      }, 800)
    }
  }

  const handleSignOut = () => {
    setIsLoggedIn(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center gap-4 z-20"
        >
          <Sparkles className="w-12 h-12 text-white" />
          <div className="text-zinc-500 font-mono text-sm tracking-widest">INITIALIZING AETHER...</div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black relative overflow-hidden">
      <SpotifyPlayer />
      
      <Header 
        isLoggedIn={isLoggedIn} 
        onSignIn={handleSignIn} 
        onSignOut={handleSignOut} 
      />

      <main className="container mx-auto px-4 py-8 space-y-12">
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            <motion.div 
              key="auth-gate"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto text-center py-32 space-y-12"
            >
              <div className="space-y-6">
                <motion.h1 
                  animate={{ 
                    textShadow: ["0 0 20px rgba(255,255,255,0)", "0 0 20px rgba(255,255,255,0.5)", "0 0 20px rgba(255,255,255,0)"] 
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-7xl md:text-8xl font-black tracking-tighter bg-gradient-to-r from-white via-zinc-400 to-white bg-clip-text text-transparent italic"
                >
                  Welcome Matt
                </motion.h1>
                <div className="space-y-2">
                  <p className="text-zinc-400 font-serif text-xl italic leading-relaxed max-w-lg mx-auto">
                    "{dailyQuote.text}"
                  </p>
                  <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.4em]">
                    — {dailyQuote.author}
                  </p>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="flex flex-col items-center gap-6"
              >
                <Button 
                  size="lg" 
                  className="rounded-full bg-white text-black hover:bg-zinc-200 px-12 h-14 text-xl font-black group shadow-[0_0_30px_rgba(255,255,255,0.1)] tracking-widest uppercase italic"
                  onClick={() => handleSignIn('auto-init')}
                >
                  Press Start
                  <Sparkles className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                </Button>
                
                <div className="text-[10px] uppercase tracking-widest text-zinc-700 font-bold">
                  LOCAL EXECUTION • SECURE SESSION
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-10"
            >
              {/* Top Section: Metrics & Keys */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <UsageMetrics />
                  <ModelCards />
                </div>
                <div className="space-y-8">
                  <ApiKeyManagement />
                </div>
              </div>

              {/* Middle Section: Gmail Generator (New Feature) */}
              <div className="max-w-4xl mx-auto">
                <GmailGenerator />
              </div>

              {/* Bottom Section: Setup Guide */}
              <div className="max-w-4xl mx-auto">
                <SetupGuide />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-12 bg-zinc-950/50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold tracking-tighter">Aether</span>
          </div>
          <div className="flex gap-8 text-xs text-zinc-600 font-medium">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
          <div className="text-[10px] text-zinc-700 font-mono">
            © 2026 AETHER LIFE SYSTEMS. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  )
}
