'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InvestmentTracker } from '@/components/dashboard/InvestmentTracker'

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

    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [profile])

  const handleSignIn = (key: string) => {
    setIsLoggedIn(true)
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
          <div className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Initializing...</div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black relative overflow-x-hidden flex flex-col">
      <Header 
        isLoggedIn={isLoggedIn} 
        onSignIn={handleSignIn} 
        onSignOut={handleSignOut} 
      />

      <main className="flex-1 flex flex-col items-center justify-center container mx-auto px-4">
        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            <motion.div 
              key="auth-gate"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto text-center space-y-16"
            >
              <div className="space-y-12">
                <div className="flex justify-center gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setProfile('matt')}
                    className={`h-10 px-8 rounded-full border transition-all duration-300 uppercase text-[10px] tracking-widest ${profile === 'matt' ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-black text-white border-white/10 hover:border-white/20'}`}
                  >
                    Matt
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setProfile('meighan')}
                    className={`h-10 px-8 rounded-full border transition-all duration-300 uppercase text-[10px] tracking-widest ${profile === 'meighan' ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-black text-white border-white/10 hover:border-white/20'}`}
                  >
                    Meighan
                  </Button>
                </div>

                <div className="space-y-4 pb-12">
                  <motion.h1 
                    key={profile}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-8xl md:text-[10rem] font-black tracking-tighter bg-gradient-to-b from-white to-zinc-600 bg-clip-text text-transparent italic leading-[1.1] pb-8 block"
                  >
                    Welcome<br />{profile === 'matt' ? 'Matt' : 'Meighan'}
                  </motion.h1>
                </div>

                <motion.div 
                  key={dailyQuote.text}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2"
                >
                  <p className="text-xl md:text-2xl font-light text-zinc-400 italic">"{dailyQuote.text}"</p>
                  <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.4em]">— {dailyQuote.author}</p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button 
                  onClick={() => setIsLoggedIn(true)}
                  className="h-14 px-10 rounded-full bg-white text-black hover:bg-zinc-200 font-black text-xs uppercase tracking-[0.3em] transition-all"
                >
                  Enter
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Command Center</h2>
                <div className="h-px w-12 bg-zinc-800 mx-auto" />
              </div>

              <InvestmentTracker profile={profile} />

              <div className="flex justify-center pt-12">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsLoggedIn(false)}
                  className="text-zinc-700 hover:text-white uppercase text-[10px] tracking-widest font-bold"
                >
                  End Session
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
