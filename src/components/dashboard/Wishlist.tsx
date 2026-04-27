'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Heart, ExternalLink, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface WishItem {
  id: string
  title: string
  price: string
  link: string
  category: string
}

interface WishlistProps {
  profile: 'matt' | 'meighan'
}

export function Wishlist({ profile }: WishlistProps) {
  const [items, setItems] = useState<WishItem[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState({ title: '', price: '', link: '', category: 'General' })

  useEffect(() => {
    const saved = localStorage.getItem(`aether_wishlist_${profile}`)
    if (saved) setItems(JSON.parse(saved))
  }, [profile])

  const save = (updated: WishItem[]) => {
    setItems(updated)
    localStorage.setItem(`aether_wishlist_${profile}`, JSON.stringify(updated))
  }

  const addItem = () => {
    if (!newItem.title) return
    const item: WishItem = {
      id: Math.random().toString(36).substr(2, 9),
      ...newItem
    }
    save([...items, item])
    setNewItem({ title: '', price: '', link: '', category: 'General' })
    setIsAdding(false)
  }

  const removeItem = (id: string) => {
    save(items.filter(i => i.id !== id))
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-full border border-white/10">
            <Heart className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter uppercase">Vision Board</h3>
            <p className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">Future Aspirations • {profile}</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsAdding(true)}
          className="bg-white text-black hover:bg-zinc-200 rounded-full h-10 px-6 text-xs font-bold uppercase tracking-widest"
        >
          Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative aspect-[4/5] bg-zinc-900/20 backdrop-blur-3xl border border-white/5 rounded-[2rem] overflow-hidden flex flex-col p-8 transition-all hover:border-white/20 hover:bg-zinc-900/40"
            >
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{item.category}</span>
                  <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 p-2 text-zinc-700 hover:text-red-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-3xl font-black italic tracking-tighter leading-none">{item.title}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400 font-mono text-sm">${item.price}</span>
                    {item.link && (
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md space-y-6">
              <h3 className="text-2xl font-black italic tracking-tighter uppercase text-center">Define Goal</h3>
              <div className="space-y-4">
                <Input 
                  placeholder="What is it?" 
                  className="h-12 bg-black/40 border-white/10 text-sm rounded-xl"
                  value={newItem.title}
                  onChange={e => setNewItem({...newItem, title: e.target.value})}
                />
                <Input 
                  placeholder="Target Price" 
                  className="h-12 bg-black/40 border-white/10 text-sm rounded-xl"
                  value={newItem.price}
                  onChange={e => setNewItem({...newItem, price: e.target.value})}
                />
                <Input 
                  placeholder="Link (optional)" 
                  className="h-12 bg-black/40 border-white/10 text-sm rounded-xl"
                  value={newItem.link}
                  onChange={e => setNewItem({...newItem, link: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={addItem} className="flex-1 bg-white text-black h-12 rounded-xl font-bold uppercase tracking-widest text-xs">Add to Board</Button>
                <Button onClick={() => setIsAdding(false)} variant="ghost" className="flex-1 h-12 rounded-xl text-xs uppercase font-bold text-zinc-500">Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
