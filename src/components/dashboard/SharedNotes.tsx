'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pin, Send, Trash2, ShieldCheck, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Note {
  id: string
  content: string
  author: 'matt' | 'meighan'
  timestamp: string
  pinned: boolean
}

interface SharedNotesProps {
  activeProfile: 'matt' | 'meighan'
}

export function SharedNotes({ activeProfile }: SharedNotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('aether_shared_notes')
    if (saved) setNotes(JSON.parse(saved))
    else {
      setNotes([
        { id: '1', content: 'Remember to finalize the property investment strategy by Friday.', author: 'matt', timestamp: '2026-04-27 10:30', pinned: true },
        { id: '2', content: 'Flight tickets for the retreat are in our shared email.', author: 'meighan', timestamp: '2026-04-27 14:15', pinned: false }
      ])
    }
  }, [])

  const save = (updated: Note[]) => {
    setNotes(updated)
    localStorage.setItem('aether_shared_notes', JSON.stringify(updated))
  }

  const addNote = () => {
    if (!newNote) return
    const note: Note = {
      id: Math.random().toString(36).substr(2, 9),
      content: newNote,
      author: activeProfile,
      timestamp: new Date().toLocaleString(),
      pinned: false
    }
    save([note, ...notes])
    setNewNote('')
  }

  const togglePin = (id: string) => {
    save(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))
  }

  const removeNote = (id: string) => {
    save(notes.filter(n => n.id !== id))
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="relative group">
        <textarea
          placeholder="Enter a strategic note or mission brief..."
          className="w-full h-32 bg-zinc-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 text-lg font-light text-zinc-300 focus:outline-none focus:border-white/20 transition-all resize-none italic leading-relaxed"
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
        />
        <div className="absolute bottom-6 right-6 flex items-center gap-4">
          <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest hidden md:block">Posting as {activeProfile}</span>
          <button 
            onClick={addNote}
            disabled={!newNote}
            className="p-4 bg-white text-black rounded-2xl hover:bg-zinc-200 transition-all disabled:opacity-30 disabled:hover:scale-100 hover:scale-110 active:scale-95 shadow-xl"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4 px-2">
          <ShieldCheck className="w-4 h-4 text-zinc-500" />
          <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500 italic">Strategic Archive</h4>
        </div>

        <AnimatePresence mode="popLayout">
          {notes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`relative bg-zinc-900/20 border rounded-[2rem] p-8 space-y-6 transition-all hover:bg-zinc-900/40 ${note.pinned ? 'border-white/20' : 'border-white/5'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-white/5 ${note.author === 'matt' ? 'text-blue-400' : 'text-rose-400'}`}>
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 italic">
                    {note.author} • <span className="font-mono text-zinc-600">{note.timestamp}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => togglePin(note.id)}
                    className={`p-2 rounded-lg transition-all ${note.pinned ? 'text-white' : 'text-zinc-700 hover:text-zinc-400'}`}
                  >
                    <Pin className={`w-4 h-4 ${note.pinned ? 'fill-white' : ''}`} />
                  </button>
                  <button 
                    onClick={() => removeNote(note.id)}
                    className="p-2 text-zinc-800 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xl font-light text-zinc-200 leading-relaxed italic">
                "{note.content}"
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
