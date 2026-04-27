'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Bot, 
  Code2, 
  Cpu, 
  Terminal, 
  Zap 
} from 'lucide-react'
import { motion } from 'framer-motion'

export function ModelCards() {
  const models = [
    { name: 'Claude Code', icon: Bot, status: 'Active', desc: 'Anthropic Official' },
    { name: 'Opencode', icon: Code2, status: 'Experimental', desc: 'Open Source Logic' },
    { name: 'Cline', icon: Terminal, status: 'Active', desc: 'VS Code Extension' },
    { name: 'Kilo Code', icon: Zap, status: 'Fast', desc: 'High Performance' },
    { name: 'SDK / API', icon: Cpu, status: 'Developer', desc: 'Raw Access' },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider ml-1">Available Models</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {models.map((model, idx) => (
          <motion.div
            key={model.name}
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card className="bg-zinc-900/40 border-white/5 hover:border-white/20 transition-all cursor-pointer group">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-black transition-colors">
                  <model.icon className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-white mb-1">{model.name}</div>
                <div className="text-[10px] text-zinc-500 mb-2">{model.desc}</div>
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-white/10 text-zinc-400">
                  {model.status}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
