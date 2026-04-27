'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Edit2, TrendingUp, DollarSign, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Investment {
  id: string
  name: string
  amount: number
  value: number
}

interface InvestmentTrackerProps {
  profile: 'matt' | 'meighan'
}

export function InvestmentTracker({ profile }: InvestmentTrackerProps) {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newAsset, setNewAsset] = useState({ name: '', amount: '', value: '' })
  const [isUpdating, setIsUpdating] = useState(false)

  // Asset mapping for CoinGecko
  const coinMap: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'ADA': 'cardano',
    'DOGE': 'dogecoin',
    'DOT': 'polkadot',
    'MATIC': 'polygon-hermez',
    'LINK': 'chainlink'
  }

  const fetchLivePrices = async (currentInvestments: Investment[]) => {
    const ids = currentInvestments
      .map(a => coinMap[a.name.toUpperCase()])
      .filter(id => !!id)
      .join(',')
    
    if (!ids) return

    setIsUpdating(true)
    try {
      const resp = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
      const prices = await resp.json()
      
      const updated = currentInvestments.map(asset => {
        const coinId = coinMap[asset.name.toUpperCase()]
        if (coinId && prices[coinId]) {
          return { ...asset, value: prices[coinId].usd }
        }
        return asset
      })
      save(updated)
    } catch (err) {
      console.error('Price fetch failed:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`aether_investments_${profile}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      setInvestments(parsed)
      fetchLivePrices(parsed)
    } else {
      setInvestments([])
    }
  }, [profile])

  // Save to localStorage
  const save = (updated: Investment[]) => {
    setInvestments(updated)
    localStorage.setItem(`aether_investments_${profile}`, JSON.stringify(updated))
  }

  const addAsset = () => {
    if (!newAsset.name) return
    const asset: Investment = {
      id: Math.random().toString(36).substr(2, 9),
      name: newAsset.name,
      amount: parseFloat(newAsset.amount) || 0,
      value: parseFloat(newAsset.value) || 0
    }
    save([...investments, asset])
    setNewAsset({ name: '', amount: '', value: '' })
    setIsAdding(false)
  }

  const removeAsset = (id: string) => {
    save(investments.filter(a => a.id !== id))
  }

  const totalValue = investments.reduce((acc, curr) => acc + (curr.amount * curr.value), 0)

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-lg border border-white/10">
            <TrendingUp className={`w-5 h-5 text-white ${isUpdating ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold tracking-tight uppercase italic">Portfolio Overview</h3>
              {isUpdating && <span className="text-[8px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE UPDATE</span>}
            </div>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Global Markets • {profile}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => fetchLivePrices(investments)}
            disabled={isUpdating}
            className="text-zinc-600 hover:text-white"
          >
            <DollarSign className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
          </Button>
          <div className="text-right">
            <div className="text-2xl font-black italic tracking-tighter text-white">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Total Assets</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {investments.map((asset) => (
            <motion.div
              key={asset.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-zinc-400" />
                </div>
                <button 
                  onClick={() => removeAsset(asset.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-zinc-600 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-lg tracking-tight text-zinc-200">{asset.name}</h4>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Position</p>
                    <p className="text-sm font-bold text-white">{asset.amount} Units</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Market Value</p>
                    <p className="text-sm font-bold text-white">${(asset.amount * asset.value).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {isAdding ? (
            <motion.div 
              layout
              className="bg-white/5 border-2 border-dashed border-white/10 rounded-2xl p-5 space-y-4"
            >
              <Input 
                placeholder="Asset Name (e.g. BTC)" 
                className="h-9 bg-black/40 border-white/5 text-xs"
                value={newAsset.name}
                onChange={e => setNewAsset({...newAsset, name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input 
                  placeholder="Units" 
                  type="number"
                  className="h-9 bg-black/40 border-white/5 text-xs"
                  value={newAsset.amount}
                  onChange={e => setNewAsset({...newAsset, amount: e.target.value})}
                />
                <Input 
                  placeholder="Price" 
                  type="number"
                  className="h-9 bg-black/40 border-white/5 text-xs"
                  value={newAsset.value}
                  onChange={e => setNewAsset({...newAsset, value: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addAsset} className="flex-1 bg-white text-black h-8 text-[10px] font-bold uppercase">Add</Button>
                <Button onClick={() => setIsAdding(false)} variant="ghost" className="flex-1 text-[10px] uppercase h-8">Cancel</Button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              layout
              onClick={() => setIsAdding(true)}
              className="h-full min-h-[140px] flex flex-col items-center justify-center gap-2 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-2xl hover:bg-white/[0.04] hover:border-white/10 transition-all text-zinc-500 hover:text-zinc-300 group"
            >
              <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Add Asset</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
