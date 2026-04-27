'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Music, X, SkipForward, SkipBack, Plus, Volume2, ExternalLink, Settings, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function SpotifyPlayer() {
  const [isOpen, setIsOpen] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [clientId, setClientId] = useState('f5aa22ca1a3b4318ba63a91a75f8ff2b')
  const [accessToken, setAccessToken] = useState('')
  
  // Spotify AI DJ Playlist ID (Standard)
  const djPlaylistId = '37i9dQZF1EYMclpMh69zI8'

  useEffect(() => {
    // Check for auth code in URL (Authorization Code Flow)
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (code) {
      exchangeCodeForToken(code)
      window.history.replaceState({}, document.title, window.location.pathname)
    } else {
      const savedToken = localStorage.getItem('aether_spotify_access_token')
      if (savedToken) setAccessToken(savedToken)
    }
  }, [])

  const generateRandomString = (length: number) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const values = crypto.getRandomValues(new Uint8Array(length))
    return values.reduce((acc, x) => acc + possible[x % possible.length], "")
  }

  const sha256 = async (plain: string) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
  }

  const base64encode = (input: ArrayBuffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  }

  const handleConnect = async () => {
    const codeVerifier = generateRandomString(64)
    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64encode(hashed)

    localStorage.setItem('spotify_code_verifier', codeVerifier)

    const redirectUri = window.location.origin
    const scopes = [
      'user-modify-playback-state',
      'user-read-playback-state',
      'playlist-modify-public',
      'playlist-modify-private'
    ].join(' ')

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      scope: scopes,
    })

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
  }

  const exchangeCodeForToken = async (code: string) => {
    const codeVerifier = localStorage.getItem('spotify_code_verifier')
    const redirectUri = window.location.origin

    const payload = {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier!,
      }),
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', payload)
      const data = await response.json()
      if (data.access_token) {
        setAccessToken(data.access_token)
        localStorage.setItem('aether_spotify_access_token', data.access_token)
        setIsOpen(true)
      }
    } catch (err) {
      console.error('Token exchange error:', err)
    }
  }

  const saveSettings = () => {
    localStorage.setItem('aether_spotify_client_id', clientId)
    setShowSetup(false)
  }

  const setVolume = async (val: number) => {
    try {
      await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${val}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
    } catch (err) {
      console.error('Volume error:', err)
    }
  }

  const addToLibrary = async () => {
    // This requires the current playing track ID, which we'd get from /v1/me/player/currently-playing
    // For now we'll trigger the like action if we have a track
    try {
      const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })
      const data = await res.json()
      if (data.item?.id) {
        await fetch(`https://api.spotify.com/v1/me/tracks?ids=${data.item.id}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${accessToken}` }
        })
        alert('Added to your Liked Songs!')
      }
    } catch (err) {
      console.error('Like error:', err)
    }
  }

  return (
    <div className="fixed bottom-12 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            className="w-[340px] bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${accessToken ? 'bg-[#1DB954] shadow-[0_0_10px_#1DB954]' : 'bg-zinc-600'} animate-pulse`} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  {accessToken ? 'Active Control' : 'Setup Required'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-white" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="h-[152px] bg-zinc-950 relative border-b border-white/5">
                <iframe
                  src={`https://open.spotify.com/embed/playlist/${djPlaylistId}`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
                {!accessToken && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 text-center">
                    <div className="space-y-4">
                      <p className="text-xs font-medium text-zinc-300">Authorize Aether to control your music</p>
                      <Button 
                        onClick={handleConnect}
                        className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold h-10 px-8 rounded-full text-xs uppercase italic tracking-widest shadow-[0_0_20px_rgba(29,185,84,0.3)]"
                      >
                        Unlock Controls
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6 bg-gradient-to-b from-zinc-900/50 to-black">
                {/* Control Deck */}
                <div className="flex items-center justify-center gap-10">
                  <Button variant="ghost" size="icon" onClick={() => spotifyControl('previous')} className="text-zinc-500 hover:text-white transition-all scale-125" disabled={!accessToken}>
                    <SkipBack className="w-6 h-6 fill-current" />
                  </Button>
                  
                  <div className={`w-14 h-14 rounded-full border-2 ${accessToken ? 'border-[#1DB954]' : 'border-zinc-800'} flex items-center justify-center shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] bg-zinc-950`}>
                    <Music className={`w-6 h-6 ${accessToken ? 'text-[#1DB954] animate-bounce' : 'text-zinc-800'}`} />
                  </div>

                  <Button variant="ghost" size="icon" onClick={() => spotifyControl('next')} className="text-zinc-500 hover:text-white transition-all scale-125" disabled={!accessToken}>
                    <SkipForward className="w-6 h-6 fill-current" />
                  </Button>
                </div>

                {/* Sub Controls */}
                <div className="flex items-center justify-between pt-2">
                  <Button variant="ghost" size="icon" onClick={addToLibrary} className="text-zinc-500 hover:text-[#1DB954] transition-colors" disabled={!accessToken} title="Like Song">
                    <Plus className="w-5 h-5" />
                  </Button>
                  
                  <div className="flex items-center gap-3 flex-1 px-6 group">
                    <Volume2 className="w-4 h-4 text-zinc-500 group-hover:text-[#1DB954]" />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      defaultValue="70"
                      onChange={(e) => setVolume(parseInt(e.target.value))}
                      className="h-1 flex-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#1DB954]" 
                      disabled={!accessToken}
                    />
                  </div>

                  <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white" disabled={!accessToken}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button 
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full px-4 h-10 border transition-all flex items-center gap-2 group ${
          isOpen ? 'bg-white text-black border-white' : 'bg-black/40 text-zinc-400 border-white/10 hover:border-white/20'
        }`}
      >
        <Music className={`w-4 h-4 ${isOpen ? 'text-black' : 'group-hover:text-[#1DB954]'}`} />
        <span className="text-xs font-bold uppercase tracking-wider">
          {isOpen ? 'Close Player' : 'Spotify'}
        </span>
      </Button>
    </div>
  )
}
