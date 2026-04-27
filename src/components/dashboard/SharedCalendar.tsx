'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalIcon, Plus, Trash2, Clock, Repeat, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CalEvent {
  id: string
  title: string
  date: string
  time: string
  repeat: 'None' | 'Weekly' | 'Monthly'
  author: 'matt' | 'meighan'
}

interface SharedCalendarProps {
  profile: 'matt' | 'meighan'
}

export function SharedCalendar({ profile }: SharedCalendarProps) {
  const [events, setEvents] = useState<CalEvent[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', repeat: 'None' as CalEvent['repeat'] })

  useEffect(() => {
    const saved = localStorage.getItem('aether_calendar')
    if (saved) setEvents(JSON.parse(saved))
    else {
      setEvents([
        { id: '1', title: 'Strategy Retreat', date: '2026-04-28', time: '10:00', repeat: 'None', author: 'matt' },
        { id: '2', title: 'Weekly Performance Review', date: '2026-04-30', time: '15:00', repeat: 'Weekly', author: 'meighan' }
      ])
    }
  }, [])

  const save = (updated: CalEvent[]) => {
    setEvents(updated)
    localStorage.setItem('aether_calendar', JSON.stringify(updated))
  }

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return
    const event: CalEvent = {
      id: Math.random().toString(36).substr(2, 9),
      ...newEvent,
      author: profile
    }
    save([...events, event])
    setNewEvent({ title: '', date: '', time: '', repeat: 'None' })
    setIsAdding(false)
  }

  const removeEvent = (id: string) => {
    save(events.filter(e => e.id !== id))
  }

  const daysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const days = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    return { days, firstDay }
  }

  const { days, firstDay } = daysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleString('default', { month: 'long' })
  const year = currentMonth.getFullYear()

  const prevMonth = () => setCurrentMonth(new Date(year, currentMonth.getMonth() - 1))
  const nextMonth = () => setCurrentMonth(new Date(year, currentMonth.getMonth() + 1))

  return (
    <div className="w-full max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
            <CalIcon className="w-6 h-6 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-3xl font-black italic tracking-tighter uppercase">{monthName} {year}</h3>
            <p className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">Shared Operations • {profile}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-900/40 rounded-xl p-1 border border-white/5">
            <button onClick={prevMonth} className="p-2 hover:bg-white/5 rounded-lg transition-all"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={nextMonth} className="p-2 hover:bg-white/5 rounded-lg transition-all"><ChevronRight className="w-5 h-5" /></button>
          </div>
          <Button 
            onClick={() => setIsAdding(true)}
            className="bg-white text-black h-12 px-8 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95"
          >
            Schedule
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        {/* Calendar Grid */}
        <div className="lg:col-span-5 bg-zinc-900/20 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8">
          <div className="grid grid-cols-7 gap-2 mb-6">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-zinc-600 uppercase tracking-widest pb-4">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: days }).map((_, i) => {
              const dayNum = i + 1
              const dateStr = `${year}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
              const dayEvents = events.filter(e => e.date === dateStr)
              
              return (
                <div key={i} className="aspect-square bg-white/[0.02] border border-white/[0.02] rounded-xl p-2 relative group hover:bg-white/[0.05] transition-all">
                  <span className="text-[10px] font-mono text-zinc-700">{dayNum}</span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.map(e => (
                      <div key={e.id} className={`h-1.5 w-full rounded-full ${e.author === 'matt' ? 'bg-blue-400/40' : 'bg-rose-400/40'}`} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Event List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Clock className="w-4 h-4 text-zinc-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 italic">Timeline Brief</h4>
          </div>
          <div className="space-y-4 max-h-[500px] overflow-y-auto no-scrollbar">
            <AnimatePresence mode="popLayout">
              {events.sort((a, b) => a.date.localeCompare(b.date)).map((e) => (
                <motion.div
                  key={e.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 space-y-3 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${e.author === 'matt' ? 'bg-blue-400' : 'bg-rose-400'}`} />
                      <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">{e.date} • {e.time}</span>
                    </div>
                    <button onClick={() => removeEvent(e.id)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-800 hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <h5 className="font-bold text-white uppercase tracking-tighter italic">{e.title}</h5>
                  {e.repeat !== 'None' && (
                    <div className="flex items-center gap-2 text-[8px] text-zinc-600 uppercase font-bold tracking-widest">
                      <Repeat className="w-2 h-2" />
                      Repeats {e.repeat}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {events.length === 0 && (
              <p className="text-[10px] text-zinc-800 text-center py-12 font-mono uppercase tracking-widest">No events scheduled.</p>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-md space-y-6">
              <h3 className="text-2xl font-black italic tracking-tighter uppercase text-center">Schedule Brief</h3>
              <div className="space-y-4">
                <input 
                  placeholder="Event Title..." 
                  className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-6 text-sm text-white focus:outline-none"
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="date"
                    className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 text-xs text-zinc-400 focus:outline-none"
                    value={newEvent.date}
                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  />
                  <input 
                    type="time"
                    className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 text-xs text-zinc-400 focus:outline-none"
                    value={newEvent.time}
                    onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                  />
                </div>
                <select 
                  className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 text-xs text-zinc-400 focus:outline-none"
                  value={newEvent.repeat}
                  onChange={e => setNewEvent({...newEvent, repeat: e.target.value as any})}
                >
                  <option value="None">No Repeat</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>
              <div className="flex gap-4 pt-2">
                <Button onClick={addEvent} className="flex-1 bg-white text-black h-12 rounded-xl font-black uppercase text-xs">Authorize</Button>
                <Button onClick={() => setIsAdding(false)} variant="ghost" className="flex-1 h-12 rounded-xl text-xs uppercase font-bold text-zinc-500">Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
