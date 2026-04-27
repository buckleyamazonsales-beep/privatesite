'use client'

import React, { useState, useEffect } from 'react'
import { Clock as ClockIcon, Cloud, CloudRain, Sun, Thermometer } from 'lucide-react'

export function GlobalIdentity() {
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('Local')
  const [temp, setTemp] = useState('--')

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, 1000)

    // Mock weather for aesthetic
    setTemp('24°C')
    setLocation('Dubai, UAE')

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-8 bg-zinc-900/40 backdrop-blur-3xl border border-white/5 px-8 py-3 rounded-full">
      <div className="flex items-center gap-3">
        <ClockIcon className="w-3 h-3 text-zinc-500" />
        <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">{time}</span>
      </div>
      <div className="w-px h-3 bg-white/10" />
      <div className="flex items-center gap-3">
        <Thermometer className="w-3 h-3 text-zinc-500" />
        <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">{temp}</span>
      </div>
      <div className="w-px h-3 bg-white/10 hidden md:block" />
      <div className="hidden md:flex items-center gap-3">
        <Sun className="w-3 h-3 text-zinc-500" />
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{location}</span>
      </div>
    </div>
  )
}
