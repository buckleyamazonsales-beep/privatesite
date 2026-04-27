'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Mail, 
  Plus, 
  Copy, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  Settings2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Account {
  email: string
  password: string
  recovery: string
  gender: string
  birthDate: string
}

export function GmailGenerator() {
  const [count, setCount] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])

  // Load from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('aether_generated_accounts')
    if (saved) {
      try {
        setAccounts(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse saved accounts', e)
      }
    }
  }, [])

  const generateAccounts = () => {
    setIsGenerating(true)
    // Simulate generation delay
    setTimeout(() => {
      const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda']
      const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']
      const domains = ['gmail.com']
      
      const newAccounts: Account[] = Array.from({ length: count }).map(() => {
        const first = firstNames[Math.floor(Math.random() * firstNames.length)]
        const last = lastNames[Math.floor(Math.random() * lastNames.length)]
        const randomNum = Math.floor(1000 + Math.random() * 9000)
        const password = Math.random().toString(36).slice(-12) + '!A1'
        
        return {
          email: `${first.toLowerCase()}.${last.toLowerCase()}${randomNum}@${domains[0]}`,
          password: password,
          recovery: `rec.${Math.random().toString(36).slice(-8)}@outlook.com`,
          gender: Math.random() > 0.5 ? 'Male' : 'Female',
          birthDate: `${Math.floor(1980 + Math.random() * 25)}-${String(Math.floor(1 + Math.random() * 12)).padStart(2, '0')}-${String(Math.floor(1 + Math.random() * 28)).padStart(2, '0')}`
        }
      })
      
      const totalAccounts = [...newAccounts, ...accounts].slice(0, 5000) // Support high-volume history
      setAccounts(totalAccounts)
      localStorage.setItem('aether_generated_accounts', JSON.stringify(totalAccounts))
      setIsGenerating(false)
    }, 1500)
  }

  const copyAsJson = () => {
    const json = JSON.stringify(accounts, null, 2)
    navigator.clipboard.writeText(json)
  }

  const downloadCsv = () => {
    const headers = ['Email', 'Password', 'Recovery', 'Gender', 'BirthDate']
    const rows = accounts.map(a => [a.email, a.password, a.recovery, a.gender, a.birthDate].join(','))
    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gmail_accounts_${new Date().getTime()}.csv`
    a.click()
  }

  return (
    <Card className="bg-zinc-900/50 border-white/5 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Gmail Account Generator
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Bulk account generation tool for testing environments
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-zinc-600" />
            <span className="text-xs font-mono text-zinc-600">v1.0.4-BETA</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="count" className="text-zinc-400">Number of Accounts</Label>
            <Input 
              id="count"
              type="number" 
              min={1} 
              value={count} 
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="bg-zinc-950 border-white/10"
            />
          </div>
          <div className="md:col-span-2 flex items-end gap-3">
            <Button 
              className="flex-1 bg-white text-black hover:bg-zinc-200 font-bold h-10"
              onClick={generateAccounts}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate New Gmail Accounts
                </>
              )}
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {accounts.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="text-sm font-medium text-zinc-400">
                  Generated {accounts.length} accounts
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 border-white/10" onClick={copyAsJson}>
                    <Copy className="w-3 h-3 mr-2" />
                    Copy All (JSON)
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 border-white/10" onClick={downloadCsv}>
                    <Download className="w-3 h-3 mr-2" />
                    Download CSV
                  </Button>
                </div>
              </div>

              <div className="border border-white/5 rounded-xl overflow-hidden bg-black/20">
                <Table>
                  <TableHeader className="bg-zinc-900/50">
                    <TableRow className="border-white/5">
                      <TableHead className="text-zinc-500 text-[10px] uppercase font-bold">Email</TableHead>
                      <TableHead className="text-zinc-500 text-[10px] uppercase font-bold">Password</TableHead>
                      <TableHead className="text-zinc-500 text-[10px] uppercase font-bold">Recovery</TableHead>
                      <TableHead className="text-zinc-500 text-[10px] uppercase font-bold">BirthDate</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((acc, i) => (
                      <TableRow key={i} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                        <TableCell className="font-mono text-xs text-white">{acc.email}</TableCell>
                        <TableCell className="font-mono text-xs text-zinc-400">••••••••••••</TableCell>
                        <TableCell className="text-xs text-zinc-500">{acc.recovery}</TableCell>
                        <TableCell className="text-xs text-zinc-500">{acc.birthDate}</TableCell>
                        <TableCell className="text-right">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="text-xs text-amber-200/70 leading-relaxed">
            <span className="font-bold text-amber-500">Legal Disclaimer:</span> This is for demonstration/educational purposes. Generating real Gmail accounts in bulk may violate Google's ToS and require proxies/captcha solving in production. Use responsibly.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
