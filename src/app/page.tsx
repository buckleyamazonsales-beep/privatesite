'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, PieChart, Heart, Flame, MessageSquare, History, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InvestmentTracker } from '@/components/dashboard/InvestmentTracker'
import { Wishlist } from '@/components/dashboard/Wishlist'
import { BudgetTracker } from '@/components/dashboard/BudgetTracker'
import { HabitTracker } from '@/components/dashboard/HabitTracker'
import { SharedNotes } from '@/components/dashboard/SharedNotes'
import { Timeline } from '@/components/dashboard/Timeline'
import { GlobalIdentity } from '@/components/dashboard/GlobalIdentity'
import { Starfield } from '@/components/layout/Starfield'

type Tab = 'investments' | 'budgeting' | 'wishlist' | 'habits' | 'notes' | 'legacy'

export default function AetherDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<'matt' | 'meighan'>('matt')
  const [activeTab, setActiveTab] = useState<Tab>('investments')
  const [dailyQuote, setDailyQuote] = useState({ text: '', author: '' })

  const renderTab = () => {
    switch (activeTab) {
      case 'investments': return <InvestmentTracker profile={profile} />
      case 'budgeting': return <BudgetTracker profile={profile} />
      case 'wishlist': return <Wishlist profile={profile} />
      case 'habits': return <HabitTracker profile={profile} />
      case 'notes': return <SharedNotes activeProfile={profile} />
      case 'legacy': return <Timeline profile={profile} />
      default: return <InvestmentTracker profile={profile} />
    }
  }

  // ... quotes logic ...

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
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black relative overflow-x-hidden flex flex-col font-sans">
      <Starfield />
      <Header />
      
      <AnimatePresence mode="wait">
        {!isLoggedIn ? (
          <div key="welcome" className="relative z-10 flex flex-col items-center justify-center min-h-[90vh]">
            <motion.div 
              key="auth-gate"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-5xl mx-auto text-center space-y-6 md:space-y-12 py-4 md:py-8 px-4"
            >
              <div className="space-y-6 md:space-y-8">
                <div className="flex justify-center gap-3 md:gap-6">
                  <Button 
                    variant="ghost" 
                    onClick={() => setProfile('matt')}
                    className={`h-9 md:h-10 px-6 md:px-8 rounded-full border transition-all duration-500 uppercase text-[9px] md:text-[10px] tracking-[0.4em] font-bold ${profile === 'matt' ? 'bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.2)]' : 'bg-black text-white border-white/10 hover:border-white/30'}`}
                  >
                    Matt
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setProfile('meighan')}
                    className={`h-9 md:h-10 px-6 md:px-8 rounded-full border transition-all duration-500 uppercase text-[9px] md:text-[10px] tracking-[0.4em] font-bold ${profile === 'meighan' ? 'bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.2)]' : 'bg-black text-white border-white/10 hover:border-white/30'}`}
                  >
                    Meighan
                  </Button>
                </div>

                <div className="space-y-2 pb-4 md:pb-6">
                  <motion.h1 
                    key={profile}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 40 }}
                    className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter bg-gradient-to-b from-white via-white to-zinc-700 bg-clip-text text-transparent italic leading-[0.9] pb-2 md:pb-4 block break-words"
                  >
                    Welcome<br />{profile === 'matt' ? 'Matt' : 'Meighan'}
                  </motion.h1>
                </div>

                <motion.div 
                  key={dailyQuote.text}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2 px-2"
                >
                  <p className="text-sm sm:text-lg md:text-2xl font-extralight text-zinc-400 italic max-w-2xl mx-auto leading-relaxed">"{dailyQuote.text}"</p>
                  <p className="text-[8px] md:text-[10px] font-bold text-zinc-800 uppercase tracking-[0.4em] md:tracking-[0.6em]">— {dailyQuote.author}</p>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button 
                  onClick={() => setIsLoggedIn(true)}
                  className="h-12 md:h-14 px-10 md:px-12 rounded-full bg-white text-black hover:bg-zinc-200 font-black text-[10px] md:text-xs uppercase tracking-[0.4em] transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                >
                  Initialize
                </Button>
              </motion.div>
            </motion.div>
          </div>
        ) : (
          <div key="dashboard" className="relative z-10 pt-24 md:pt-32 pb-20">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 md:space-y-12"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-1 text-center md:text-left">
                    <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">Command Center</h2>
                    <p className="text-[10px] text-zinc-600 font-mono tracking-[0.4em] uppercase">Unified Intelligence • {profile}</p>
                  </div>
                  
                  <GlobalIdentity />
                </div>

                <div className="flex overflow-x-auto no-scrollbar md:justify-center bg-zinc-900/40 p-1 rounded-3xl md:rounded-full border border-white/5 backdrop-blur-xl gap-1">
                  {[
                    { id: 'investments', label: 'Investments', icon: TrendingUp },
                    { id: 'budgeting', label: 'Budget', icon: PieChart },
                    { id: 'habits', label: 'Pulse', icon: Flame },
                    { id: 'notes', label: 'Briefs', icon: MessageSquare },
                    { id: 'wishlist', label: 'Goals', icon: Heart },
                    { id: 'legacy', label: 'Legacy', icon: History }
                  ].map((tab) => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as Tab)}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl md:rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'}`}
                    >
                      <tab.icon className="w-3 h-3" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                  className="min-h-[500px]"
                >
                  {renderTab()}
                </motion.div>

                <div className="flex justify-center pt-16">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsLoggedIn(false)}
                    className="text-zinc-800 hover:text-white uppercase text-[10px] tracking-[0.5em] font-black transition-all"
                  >
                    Terminate Session
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
