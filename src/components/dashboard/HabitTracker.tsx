'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Flame, Zap, Trophy, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Habit {
  id: string
  name: string
  completedToday: boolean
  streak: number
  lastCompleted: string
}

interface HabitTrackerProps {
  profile: 'matt' | 'meighan'
}

export function HabitTracker({ profile }: HabitTrackerProps) {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newHabit, setNewHabit] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem(`aether_habits_${profile}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Reset if it's a new day
      const today = new Date().toLocaleDateString()
      const updated = parsed.map((h: Habit) => {
        if (h.lastCompleted !== today) {
          return { ...h, completedToday: false }
        }
        return h
      })
      setHabits(updated)
    } else {
      setHabits([
        { id: '1', name: 'Physical Training', completedToday: false, streak: 12, lastCompleted: '' },
        { id: '2', name: 'Deep Meditation', completedToday: false, streak: 8, lastCompleted: '' },
        { id: '3', name: 'Strategic Reading', completedToday: false, streak: 5, lastCompleted: '' }
      ])
    }
  }, [profile])

  const save = (updated: Habit[]) => {
    setHabits(updated)
    localStorage.setItem(`aether_habits_${profile}`, JSON.stringify(updated))
  }

  const toggleHabit = (id: string) => {
    const today = new Date().toLocaleDateString()
    const updated = habits.map(h => {
      if (h.id === id) {
        const wasCompleted = h.completedToday
        const newStreak = !wasCompleted ? h.streak + 1 : Math.max(0, h.streak - 1)
        return { 
          ...h, 
          completedToday: !wasCompleted, 
          streak: newStreak,
          lastCompleted: !wasCompleted ? today : h.lastCompleted
        }
      }
      return h
    })
    save(updated)
  }

  const addHabit = () => {
    if (!newHabit) return
    const habit: Habit = {
      id: Math.random().toString(36).substr(2, 9),
      name: newHabit,
      completedToday: false,
      streak: 0,
      lastCompleted: ''
    }
    save([...habits, habit])
    setNewHabit('')
    setIsAdding(false)
  }

  const removeHabit = (id: string) => {
    save(habits.filter(h => h.id !== id))
  }

  const totalCompleted = habits.filter(h => h.completedToday).length
  const progress = habits.length > 0 ? (totalCompleted / habits.length) * 100 : 0

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-zinc-900/20 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-3xl font-black italic tracking-tighter uppercase">Discipline Pulse</h3>
          <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">The foundation of greatness • {profile}</p>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-orange-500 mb-1">
              <Flame className="w-6 h-6 fill-orange-500/20" />
              <span className="text-4xl font-black italic tracking-tighter">
                {Math.max(...habits.map(h => h.streak), 0)}
              </span>
            </div>
            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Top Streak</p>
          </div>
          
          <div className="h-12 w-px bg-white/5 hidden md:block" />
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-white mb-1">
              <Zap className="w-6 h-6 text-zinc-400" />
              <span className="text-4xl font-black italic tracking-tighter">
                {progress.toFixed(0)}%
              </span>
            </div>
            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">Today's Focus</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {habits.map((habit) => (
            <motion.div
              key={habit.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`group relative flex items-center justify-between p-6 rounded-[2rem] border transition-all cursor-pointer ${habit.completedToday ? 'bg-white/5 border-white/20' : 'bg-zinc-900/40 border-white/5 hover:border-white/10'}`}
              onClick={() => toggleHabit(habit.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl transition-all ${habit.completedToday ? 'bg-white text-black scale-110' : 'bg-white/5 text-zinc-600 group-hover:text-zinc-400'}`}>
                  {habit.completedToday ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </div>
                <div className="space-y-1">
                  <h4 className={`text-xl font-bold tracking-tight uppercase italic transition-all ${habit.completedToday ? 'text-white' : 'text-zinc-500'}`}>
                    {habit.name}
                  </h4>
                  <div className="flex items-center gap-2 opacity-50">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">{habit.streak} Day Streak</span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); removeHabit(habit.id); }}
                className="opacity-0 group-hover:opacity-100 p-2 text-zinc-800 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        <button 
          onClick={() => setIsAdding(true)}
          className="flex flex-col items-center justify-center gap-3 p-8 rounded-[2rem] border-2 border-dashed border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all text-zinc-600 group"
        >
          <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Integrate Habit</span>
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-md space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black italic tracking-tighter uppercase">New Protocol</h3>
                <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Add a daily discipline</p>
              </div>
              <input 
                type="text" 
                placeholder="Habit Name..." 
                className="w-full bg-black/50 border border-white/10 rounded-2xl h-14 px-6 text-sm text-white focus:outline-none focus:border-white/30"
                value={newHabit}
                onChange={e => setNewHabit(e.target.value)}
                autoFocus
              />
              <div className="flex gap-4">
                <Button onClick={addHabit} className="flex-1 bg-white text-black h-14 rounded-2xl font-black uppercase text-xs tracking-widest">Activate</Button>
                <Button onClick={() => setIsAdding(false)} variant="ghost" className="flex-1 h-14 rounded-2xl text-xs uppercase font-bold text-zinc-500">Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
