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
  const [profile, setProfile] = useState<'matt' | 'meighan'>('matt')
  const [dailyQuote, setDailyQuote] = useState({ text: '', author: '' })

  const mattQuotes = [
    { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
    { text: "Waste no more time arguing what a good man should be. Be one.", author: "Marcus Aurelius" },
    { text: "The harder the conflict, the more glorious the triumph.", author: "Thomas Paine" },
    { text: "A man is but the product of his thoughts. What he thinks, he becomes.", author: "Mahatma Gandhi" },
    { text: "Strength does not come from winning. Your struggles develop your strengths.", author: "Arnold Schwarzenegger" },
    { text: "It is not the critic who counts; not the man who points out how the strong man stumbles.", author: "Theodore Roosevelt" },
    { text: "Discipline is doing what needs to be done, even if you don't want to do it.", author: "Unknown" },
    { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" }
  ]

  const meighanQuotes = [
    { text: "Grace is finding a waterfall when you were only looking for a stream.", author: "Unknown" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Kindness is the light that dissolves all walls between souls.", author: "Paramahansa Yogananda" },
    { text: "Bloom where you are planted, and let your light shine through.", author: "Mary Engelbreit" },
    { text: "Poetry is not a turning loose of emotion, but an escape from emotion.", author: "T.S. Eliot" },
    { text: "The most beautiful things in the world cannot be seen or even touched.", author: "Helen Keller" },
    { text: "Life is a journey, and if you fall in love with the journey, you will be in love forever.", author: "Peter Hagerty" },
    { text: "Your soul knows the geography of your destiny.", author: "John O'Donohue" }
  ]

  useEffect(() => {
    const selectedQuotes = profile === 'matt' ? mattQuotes : meighanQuotes
    const randomIdx = Math.floor(Math.random() * selectedQuotes.length)
    setDailyQuote(selectedQuotes[randomIdx])

    // Simulate initial load
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [profile])

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
              <div className="space-y-8">
                <div className="flex justify-center gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setProfile('matt')}
                    className={`h-12 px-8 rounded-full border ${profile === 'matt' ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-black text-white border-white/10 hover:border-white/20'}`}
                  >
                    Matt
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setProfile('meighan')}
                    className={`h-12 px-8 rounded-full border ${profile === 'meighan' ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-black text-white border-white/10 hover:border-white/20'}`}
                  >
                    Meighan
                  </Button>
                </div>

                <div className="space-y-6">
                  <motion.h1 
                    key={profile}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-7xl md:text-8xl font-black tracking-tighter bg-gradient-to-r from-white via-zinc-400 to-white bg-clip-text text-transparent italic"
                  >
                    Welcome {profile === 'matt' ? 'Matt' : 'Meighan'}
                  </motion.h1>
                  
                  <div className="max-w-xl mx-auto space-y-2">
                    <p className="text-zinc-500 font-mono text-sm tracking-[0.2em] uppercase">Private Session Authorized</p>
                    <div className="h-px w-12 bg-zinc-800 mx-auto" />
                  </div>
                </div>

                <motion.div 
                  key={dailyQuote.text}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <p className="text-xl md:text-2xl font-light text-zinc-300 italic">"{dailyQuote.text}"</p>
                  <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">— {dailyQuote.author}</p>
                </motion.div>
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
