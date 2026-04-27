'use client'

import React from 'react'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Copy, 
  Download, 
  BookOpen, 
  Terminal, 
  Settings, 
  Play, 
  RefreshCcw 
} from 'lucide-react'

export function SetupGuide() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // Add toast notification logic here if needed
  }

  return (
    <div className="space-y-6">
      <Card className="bg-zinc-900/50 border-white/5">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-zinc-400" />
            Detailed Setup Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* Step 1 */}
            <AccordionItem value="step-1" className="border-white/5">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4 text-left">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold">1</span>
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">Install Claude Code</div>
                    <div className="text-xs text-zinc-500">Choose your preferred installation method</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { label: 'Shell (macOS/Linux)', command: 'curl -fsSL https://claude.ai/install.sh | sh' },
                    { label: 'PowerShell (Windows)', command: 'irm https://claude.ai/install.ps1 | iex' },
                    { label: 'NPM (Cross-platform)', command: 'npm install -g @anthropic-ai/claude-code' }
                  ].map((item) => (
                    <div key={item.label} className="bg-black/40 rounded-lg p-3 border border-white/5 group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-zinc-400">{item.label}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(item.command)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <code className="text-xs text-emerald-500 font-mono break-all">{item.command}</code>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 2 */}
            <AccordionItem value="step-2" className="border-white/5">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4 text-left">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold">2</span>
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">Connect to Aether</div>
                    <div className="text-xs text-zinc-500">Configure environment or settings file</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6 pt-2">
                <div className="space-y-4">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Option A: Environment Variables</div>
                  <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                    <pre className="text-xs text-zinc-300 font-mono leading-relaxed">
                      {`# Linux/macOS
export CLAUDE_API_BASE="http://185.193.127.242/api"
export CLAUDE_API_KEY="your_aether_key"

# Windows (PowerShell)
$env:CLAUDE_API_BASE="http://185.193.127.242/api"
$env:CLAUDE_API_KEY="your_aether_key"`}
                    </pre>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-tight">Option B: Settings File</div>
                  <div className="flex items-center justify-between p-4 bg-zinc-900/30 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-zinc-500" />
                      <div className="text-xs text-zinc-400">
                        Download pre-configured <code className="text-white">settings.json</code>
                      </div>
                    </div>
                    <Button size="sm" className="h-8 bg-zinc-800 hover:bg-zinc-700">
                      <Download className="w-3 h-3 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 3 */}
            <AccordionItem value="step-3" className="border-white/5">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4 text-left">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold">3</span>
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">Run it</div>
                    <div className="text-xs text-zinc-500">Start the interactive terminal</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <div className="bg-black/40 rounded-lg p-4 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Terminal className="w-4 h-4 text-emerald-500" />
                    <code className="text-sm text-white font-mono">claude</code>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-zinc-400">
                    <Play className="w-3 h-3 mr-2" />
                    Preview
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Step 4 */}
            <AccordionItem value="step-4" className="border-white/5">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-4 text-left">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-bold">4</span>
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold">Switch models</div>
                    <div className="text-xs text-zinc-500">Change model within the CLI</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <div className="bg-black/40 rounded-lg p-4 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RefreshCcw className="w-4 h-4 text-amber-500" />
                    <code className="text-sm text-white font-mono">/model &lt;model_name&gt;</code>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-zinc-400">
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-white/5">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-zinc-400">Guide History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-zinc-600 text-center py-4 border border-dashed border-white/10 rounded-lg">
            No previous guides found.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
