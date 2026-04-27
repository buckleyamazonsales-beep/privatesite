'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Plus, Trash2, Camera, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Milestone {
  id: string
  title: string
  date: string
  description: string
  image?: string
}

interface TimelineProps {
  profile: 'matt' | 'meighan'
}

export function Timeline({ profile }: TimelineProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newMilestone, setNewMilestone] = useState({ title: '', date: '', description: '', image: '' })

  useEffect(() => {
    const saved = localStorage.getItem('aether_timeline')
    if (saved) setMilestones(JSON.parse(saved))
    else {
      setMilestones([
        { id: '1', title: 'The Dubai Investment', date: 'March 2026', description: 'Locked in our first international property venture.', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070&auto=format&fit=crop' },
        { id: '2', title: 'Aether Genesis', date: 'April 2026', description: 'The official launch of our unified life hub.', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop' }
      ])
    }
  }, [])

  const save = (updated: Milestone[]) => {
    setMilestones(updated)
    localStorage.setItem('aether_timeline', JSON.stringify(updated))
  }

  const addMilestone = () => {
    if (!newMilestone.title) return
    const ms: Milestone = {
      id: Math.random().toString(36).substr(2, 9),
      ...newMilestone
    }
    save([ms, ...milestones])
    setNewMilestone({ title: '', date: '', description: '', image: '' })
    setIsAdding(false)
  }

  const removeMilestone = (id: string) => {
    save(milestones.filter(m => m.id !== id))
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-12">
      <div className="flex items-center justify-between border-b border-white/5 pb-8 px-4">
        <div className="space-y-1">
          <h3 className="text-4xl font-black italic tracking-tighter uppercase">The Legacy</h3>
          <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Chronicles of victory • Collective</p>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-white text-black h-12 px-8 rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 shadow-xl"
        >
          Add Event
        </Button>
      </div>

      <div className="relative space-y-24 before:absolute before:left-1/2 before:-translate-x-1/2 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
        <AnimatePresence mode="popLayout">
          {milestones.map((ms, idx) => (
            <motion.div
              key={ms.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`relative flex flex-col md:flex-row items-center gap-12 ${idx % 2 === 0 ? '' : 'md:flex-row-reverse text-right'}`}
            >
              <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-4 border-black z-10 shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
              
              <div className="w-full md:w-1/2 space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">{ms.date}</span>
                  <h4 className="text-4xl font-black italic tracking-tighter uppercase text-white">{ms.title}</h4>
                </div>
                <p className="text-lg font-light text-zinc-400 italic leading-relaxed">
                  "{ms.description}"
                </p>
                <button onClick={() => removeMilestone(ms.id)} className="p-2 text-zinc-800 hover:text-red-400 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="w-full md:w-1/2 group">
                <div className="relative aspect-[16/9] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                  {ms.image ? (
                    <img src={ms.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100" />
                  ) : (
                    <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-zinc-800" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-lg space-y-6">
              <h3 className="text-2xl font-black italic tracking-tighter uppercase text-center">Capture Milestone</h3>
              <div className="space-y-4">
                <input 
                  placeholder="Event Title..." 
                  className="w-full bg-black/50 border border-white/10 rounded-xl h-12 px-6 text-sm text-white focus:outline-none"
                  value={newMilestone.title}
                  onChange={e => setNewMilestone({...newMilestone, title: e.target.value})}
                />
                <input 
                  placeholder="Date (e.g. June 2026)..." 
                  className="w-full bg-black/50 border border-white/10 rounded-xl h-12 px-6 text-sm text-white focus:outline-none"
                  value={newMilestone.date}
                  onChange={e => setNewMilestone({...newMilestone, date: e.target.value})}
                />
                <textarea 
                  placeholder="The significance of this moment..." 
                  className="w-full bg-black/50 border border-white/10 rounded-xl h-24 p-6 text-sm text-white focus:outline-none resize-none"
                  value={newMilestone.description}
                  onChange={e => setNewMilestone({...newMilestone, description: e.target.value})}
                />
                <input 
                  placeholder="Image URL (Unsplash or direct)..." 
                  className="w-full bg-black/50 border border-white/10 rounded-xl h-12 px-6 text-sm text-white focus:outline-none"
                  value={newMilestone.image}
                  onChange={e => setNewMilestone({...newMilestone, image: e.target.value})}
                />
              </div>
              <div className="flex gap-4">
                <Button onClick={addMilestone} className="flex-1 bg-white text-black h-12 rounded-xl font-black uppercase text-xs">Record</Button>
                <Button onClick={() => setIsAdding(false)} variant="ghost" className="flex-1 h-12 rounded-xl text-xs uppercase font-bold text-zinc-500">Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
