'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, PieChart, ArrowUpCircle, ArrowDownCircle, DollarSign, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

interface Transaction {
  id: string
  amount: number
  date: string
  note: string
}

interface IncomeStream {
  id: string
  source: string
  amount: number
  date: string
}

interface BudgetCategory {
  id: string
  name: string
  spent: number
  limit: number
  schedule: 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly'
  transactions: Transaction[]
}

interface BudgetTrackerProps {
  profile: 'matt' | 'meighan'
}

export function BudgetTracker({ profile }: BudgetTrackerProps) {
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [incomeStreams, setIncomeStreams] = useState<IncomeStream[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isAddingIncome, setIsAddingIncome] = useState(false)
  const [newCat, setNewCat] = useState({ name: '', limit: '', schedule: 'Monthly' as BudgetCategory['schedule'] })
  const [newIncome, setNewIncome] = useState({ source: '', amount: '', date: new Date().toISOString().split('T')[0] })

  useEffect(() => {
    const saved = localStorage.getItem(`aether_budget_${profile}`)
    if (saved) setCategories(JSON.parse(saved))
    
    const savedIncome = localStorage.getItem(`aether_income_${profile}`)
    if (savedIncome) setIncomeStreams(JSON.parse(savedIncome))
  }, [profile])

  const save = (updated: BudgetCategory[]) => {
    setCategories(updated)
    localStorage.setItem(`aether_budget_${profile}`, JSON.stringify(updated))
  }

  const saveIncome = (updated: IncomeStream[]) => {
    setIncomeStreams(updated)
    localStorage.setItem(`aether_income_${profile}`, JSON.stringify(updated))
  }

  const addIncome = () => {
    if (!newIncome.source) return
    const inc: IncomeStream = {
      id: Math.random().toString(36).substr(2, 9),
      source: newIncome.source,
      amount: parseFloat(newIncome.amount) || 0,
      date: newIncome.date
    }
    saveIncome([...incomeStreams, inc])
    setNewIncome({ source: '', amount: '', date: new Date().toISOString().split('T')[0] })
    setIsAddingIncome(false)
  }

  const addCategory = () => {
    if (!newCat.name) return
    const cat: BudgetCategory = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCat.name,
      spent: 0,
      limit: parseFloat(newCat.limit) || 0,
      schedule: newCat.schedule,
      transactions: []
    }
    save([...categories, cat])
    setNewCat({ name: '', limit: '', schedule: 'Monthly' })
    setIsAdding(false)
  }

  const logExpense = (id: string, amount: number, note: string = 'Expense') => {
    save(categories.map(c => {
      if (c.id === id) {
        const trans: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          amount,
          date: new Date().toLocaleDateString(),
          note
        }
        return { 
          ...c, 
          spent: Number((c.spent + amount).toFixed(2)), 
          transactions: [trans, ...c.transactions].slice(0, 5)
        }
      }
      return c
    }))
  }

  const removeCategory = (id: string) => {
    save(categories.filter(c => c.id !== id))
  }

  const totalSpent = categories.reduce((acc, c) => acc + c.spent, 0)
  
  // Normalize everything to Monthly for the "Pulse"
  const totalLimit = categories.reduce((acc, c) => {
    const factor = c.schedule === 'Daily' ? 30 : c.schedule === 'Weekly' ? 4 : c.schedule === 'Bi-Weekly' ? 2 : 1
    return acc + (c.limit * factor)
  }, 0)

  const totalIncome = incomeStreams.reduce((acc, i) => acc + i.amount, 0)
  const percent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0
  const netFlow = totalIncome - totalSpent

  // Smart Recommendations (50/30/20 Rule)
  const recNeeds = totalIncome * 0.50
  const recWants = totalIncome * 0.30
  const recSavings = totalIncome * 0.20

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 md:space-y-10 px-2 md:px-0">
      {/* Smart Advisor Section */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-center">
        <div className="p-3 md:p-4 bg-white/5 rounded-2xl md:rounded-3xl border border-white/10">
          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-zinc-400 animate-pulse" />
        </div>
        <div className="flex-1 space-y-1 md:space-y-2 text-center md:text-left">
          <h4 className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-zinc-400">Aether Smart Advisor</h4>
          <p className="text-lg md:text-xl font-medium tracking-tight leading-snug">
            Based on your <span className="text-green-400 font-bold">${totalIncome.toLocaleString()}</span> monthly inflow:
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-6 text-center w-full md:w-auto">
          <div className="space-y-1">
            <p className="text-[7px] md:text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Needs (50%)</p>
            <p className="text-sm md:text-lg font-black italic tracking-tighter text-white">${recNeeds.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[7px] md:text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Wants (30%)</p>
            <p className="text-sm md:text-lg font-black italic tracking-tighter text-white">${recWants.toLocaleString()}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[7px] md:text-[8px] text-zinc-500 font-bold uppercase tracking-widest">Savings (20%)</p>
            <p className="text-sm md:text-lg font-black italic tracking-tighter text-green-400">${recSavings.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Budget Pulse */}
        <div className="md:col-span-2 bg-zinc-900/20 backdrop-blur-3xl border border-white/5 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 space-y-6 md:space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 hidden md:block">
            <PieChart className="w-32 h-32" />
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <h3 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase">Budget Pulse</h3>
              <p className="text-[9px] md:text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Monthly Spend Velocity</p>
            </div>
            <div className="text-left md:text-right">
              <span className="text-3xl md:text-4xl font-black italic tracking-tighter text-white">${totalSpent.toLocaleString()}</span>
              <p className="text-[9px] md:text-[10px] text-zinc-600 font-mono uppercase tracking-widest">of ${totalLimit.toLocaleString()} limit</p>
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <span>Usage</span>
              <span className={percent > 90 ? 'text-red-400' : 'text-zinc-400'}>{percent.toFixed(1)}%</span>
            </div>
            <Progress value={percent} className="h-1.5 bg-zinc-800" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 relative z-10">
            <Button onClick={() => setIsAdding(true)} className="bg-white text-black hover:bg-zinc-200 h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Add Stream</Button>
            <Button onClick={() => setIsAddingIncome(true)} variant="ghost" className="h-12 border border-white/5 rounded-2xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/5">Log Paycheque</Button>
          </div>
        </div>

        {/* Cashflow Summary */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between h-full">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Monthly Inflow</p>
                <p className="text-3xl font-black italic tracking-tighter text-green-400">+${totalIncome.toLocaleString()}</p>
              </div>
              <div className="h-px bg-white/5" />
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Net Cashflow</p>
                <p className={`text-4xl font-black italic tracking-tighter ${netFlow >= 0 ? 'text-white' : 'text-red-400'}`}>
                  {netFlow >= 0 ? '+' : '-'}${Math.abs(netFlow).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <ArrowDownCircle className="w-5 h-5 text-zinc-500" />
            <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400 italic">Capital Outflow</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {categories.map((cat) => (
                <motion.div
                  key={cat.id}
                  layout
                  className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-4 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-bold text-white uppercase tracking-tighter italic text-lg">{cat.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] bg-white/5 text-zinc-500 px-1.5 py-0.5 rounded font-mono uppercase tracking-widest">{cat.schedule}</span>
                        <p className="text-[10px] text-zinc-600 font-mono">${cat.limit} Limit</p>
                      </div>
                    </div>
                    <button onClick={() => removeCategory(cat.id)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-700 hover:text-red-400 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <p className="text-2xl font-black italic tracking-tighter">${cat.spent}</p>
                      <div className="flex gap-2">
                        <button onClick={() => logExpense(cat.id, 10, 'Quick Add')} className="h-8 px-3 bg-white/5 rounded-xl hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest">+$10</button>
                        <button onClick={() => logExpense(cat.id, 50, 'Large Spend')} className="h-8 px-3 bg-white/5 rounded-xl hover:bg-white/10 text-[10px] font-bold uppercase tracking-widest">+$50</button>
                      </div>
                    </div>
                    <Progress value={(cat.spent / cat.limit) * 100} className={`h-1.5 ${cat.spent > cat.limit ? 'bg-red-500/20' : 'bg-zinc-800'}`} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Income History */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <ArrowUpCircle className="w-5 h-5 text-zinc-500" />
            <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-400 italic">Capital Inflow</h4>
          </div>
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {incomeStreams.map((inc) => (
                <motion.div
                  key={inc.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex justify-between items-center"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-zinc-200">{inc.source}</p>
                    <p className="text-[8px] text-zinc-600 font-mono uppercase tracking-widest">{inc.date}</p>
                  </div>
                  <p className="text-lg font-black italic tracking-tighter text-green-400">+${inc.amount.toLocaleString()}</p>
                </motion.div>
              ))}
            </AnimatePresence>
            {incomeStreams.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-2xl">
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">No income logged</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAdding && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md space-y-6">
              <h3 className="text-2xl font-black italic tracking-tighter uppercase text-center">Define Stream</h3>
              <div className="space-y-4">
                <Input placeholder="Stream Name" className="h-12 bg-black/40 border-white/10 rounded-xl" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Limit" type="number" className="h-12 bg-black/40 border-white/10 rounded-xl" value={newCat.limit} onChange={e => setNewCat({...newCat, limit: e.target.value})} />
                  <select className="h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-zinc-400" value={newCat.schedule} onChange={e => setNewCat({...newCat, schedule: e.target.value as any})}>
                    <option value="Daily">Daily</option><option value="Weekly">Weekly</option><option value="Bi-Weekly">Bi-Weekly</option><option value="Monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3"><Button onClick={addCategory} className="flex-1 bg-white text-black h-12 rounded-xl font-bold uppercase">Create</Button><Button onClick={() => setIsAdding(false)} variant="ghost" className="flex-1 h-12 rounded-xl uppercase font-bold text-zinc-500">Cancel</Button></div>
            </div>
          </motion.div>
        )}

        {isAddingIncome && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md space-y-6">
              <h3 className="text-2xl font-black italic tracking-tighter uppercase text-center">Log Paycheque</h3>
              <div className="space-y-4">
                <Input placeholder="Income Source (e.g. Salary)" className="h-12 bg-black/40 border-white/10 rounded-xl" value={newIncome.source} onChange={e => setNewIncome({...newIncome, source: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Amount" type="number" className="h-12 bg-black/40 border-white/10 rounded-xl" value={newIncome.amount} onChange={e => setNewIncome({...newIncome, amount: e.target.value})} />
                  <Input type="date" className="h-12 bg-black/40 border border-white/10 rounded-xl px-4 text-zinc-400" value={newIncome.date} onChange={e => setNewIncome({...newIncome, date: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3"><Button onClick={addIncome} className="flex-1 bg-white text-black h-12 rounded-xl font-bold uppercase">Log Income</Button><Button onClick={() => setIsAddingIncome(false)} variant="ghost" className="flex-1 h-12 rounded-xl uppercase font-bold text-zinc-500">Cancel</Button></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
