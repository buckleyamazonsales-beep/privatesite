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

export function Header() {
  return (
    <header className="bg-transparent border-none sticky top-0 z-50">
      <div className="container mx-auto px-4 h-24 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-black tracking-[0.3em] text-white uppercase italic">
            Aether
          </span>
        </motion.div>
      </div>
    </header>
  )
}
