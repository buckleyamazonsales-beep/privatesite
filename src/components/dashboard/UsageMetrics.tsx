'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'

export function UsageMetrics() {
  const metrics = [
    { label: 'Used', value: '0', color: 'text-zinc-500' },
    { label: 'Limit', value: '0', color: 'text-zinc-500' },
    { label: 'Remaining', value: '0', color: 'text-emerald-500' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric, idx) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
        >
          <Card className="bg-zinc-900/50 border-white/5 overflow-hidden group">
            <CardContent className="p-6">
              <div className="text-sm font-medium text-zinc-400 mb-1">{metric.label}</div>
              <div className={`text-4xl font-bold tracking-tight ${metric.color}`}>
                {metric.value}
              </div>
              <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: metric.label === 'Limit' ? '0%' : '0%' }}
                  className="h-full bg-primary"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
