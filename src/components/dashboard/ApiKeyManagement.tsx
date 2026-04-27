'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Key, Lock } from 'lucide-react'

export function ApiKeyManagement() {
  const [anthropicKey, setAnthropicKey] = React.useState('')
  const [openaiKey, setOpenaiKey] = React.useState('')

  React.useEffect(() => {
    setAnthropicKey(localStorage.getItem('anthropic_key') || '')
    setOpenaiKey(localStorage.getItem('openai_key') || '')
  }, [])

  const updateAnthropic = (val: string) => {
    setAnthropicKey(val)
    localStorage.setItem('anthropic_key', val)
  }

  const updateOpenai = (val: string) => {
    setOpenaiKey(val)
    localStorage.setItem('openai_key', val)
  }

  return (
    <Card className="bg-zinc-900/50 border-white/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Key className="w-5 h-5 text-zinc-400" />
          API Key Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="anthropic" className="text-zinc-400">Anthropic API</Label>
            <div className="relative">
              <Input 
                id="anthropic"
                placeholder="sk-ant-..." 
                className="bg-zinc-950 border-white/10 pr-10"
                value={anthropicKey}
                onChange={(e) => updateAnthropic(e.target.value)}
              />
              <Lock className="absolute right-3 top-2.5 w-4 h-4 text-zinc-600" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="openai" className="text-zinc-400">OpenAI API</Label>
            <div className="relative">
              <Input 
                id="openai"
                placeholder="sk-..." 
                className="bg-zinc-950 border-white/10 pr-10"
                value={openaiKey}
                onChange={(e) => updateOpenai(e.target.value)}
              />
              <Lock className="absolute right-3 top-2.5 w-4 h-4 text-zinc-600" />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-semibold">Connect to Aether</div>
              <div className="text-xs text-zinc-500">The key used to authenticate with Aether</div>
            </div>
            <div className="text-xl font-mono text-zinc-600">-</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
