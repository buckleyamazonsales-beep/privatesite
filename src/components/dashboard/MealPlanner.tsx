'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Utensils, Ban, Search, CheckCircle2, ShoppingCart, Plus, Trash2, Sparkles, ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Meal {
  id: string
  name: string
  ingredients: string[]
  instructions: string
  image?: string
}

interface MealPlannerProps {
  profile: 'matt' | 'meighan'
}

export function MealPlanner({ profile }: MealPlannerProps) {
  const [dislikes, setDislikes] = useState<string[]>([])
  const [plannedMeals, setPlannedMeals] = useState<Meal[]>([])
  const [suggestions, setSuggestions] = useState<Meal[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [newDislike, setNewDislike] = useState('')

  // Mock database of premium meals
  const mealDatabase: Meal[] = [
    { id: '1', name: 'Wagyu Steak with Asparagus', ingredients: ['beef', 'wagyu', 'asparagus', 'butter', 'garlic'], instructions: 'Sear wagyu 3 mins per side. Grill asparagus.' },
    { id: '2', name: 'Lemon Butter Salmon', ingredients: ['salmon', 'lemon', 'butter', 'dill', 'broccoli'], instructions: 'Bake salmon with butter and lemon slices.' },
    { id: '3', name: 'Mediterranean Chicken Bowl', ingredients: ['chicken', 'quinoa', 'cucumber', 'feta', 'olives'], instructions: 'Grill chicken. Combine with quinoa and fresh toppings.' },
    { id: '4', name: 'Truffle Mushroom Pasta', ingredients: ['pasta', 'truffle oil', 'mushrooms', 'cream', 'parmesan'], instructions: 'Sauté mushrooms. Toss with cream and truffle oil.' },
    { id: '5', name: 'Zesty Shrimp Tacos', ingredients: ['shrimp', 'tortilla', 'cabbage', 'lime', 'cilantro'], instructions: 'Sauté shrimp with lime. Top with slaw.' },
    { id: '6', name: 'Ribeye with Rosemary Potatoes', ingredients: ['beef', 'ribeye', 'potatoes', 'rosemary', 'butter'], instructions: 'Pan sear ribeye. Roast potatoes with rosemary.' },
    { id: '7', name: 'Pesto Caprese Salad', ingredients: ['mozzarella', 'tomato', 'basil', 'pesto', 'balsamic'], instructions: 'Slice mozzarella and tomatoes. Drizzle with pesto.' }
  ]

  useEffect(() => {
    const savedDislikes = localStorage.getItem(`aether_dislikes_${profile}`)
    if (savedDislikes) setDislikes(JSON.parse(savedDislikes))

    const savedMeals = localStorage.getItem(`aether_planned_meals_${profile}`)
    if (savedMeals) setPlannedMeals(JSON.parse(savedMeals))
  }, [profile])

  const saveDislikes = (updated: string[]) => {
    setDislikes(updated)
    localStorage.setItem(`aether_dislikes_${profile}`, JSON.stringify(updated))
  }

  const saveMeals = (updated: Meal[]) => {
    setPlannedMeals(updated)
    localStorage.setItem(`aether_planned_meals_${profile}`, JSON.stringify(updated))
  }

  const addDislike = () => {
    if (!newDislike) return
    if (!dislikes.includes(newDislike.toLowerCase())) {
      saveDislikes([...dislikes, newDislike.toLowerCase()])
    }
    setNewDislike('')
  }

  const removeDislike = (item: string) => {
    saveDislikes(dislikes.filter(d => d !== item))
  }

  const findMeals = () => {
    setIsSearching(true)
    setTimeout(() => {
      const filtered = mealDatabase.filter(meal => 
        !meal.ingredients.some(ing => dislikes.includes(ing.toLowerCase()))
      )
      setSuggestions(filtered)
      setIsSearching(false)
    }, 800)
  }

  const planMeal = (meal: Meal) => {
    if (!plannedMeals.find(m => m.id === meal.id)) {
      saveMeals([...plannedMeals, meal])
    }
    setSuggestions(suggestions.filter(m => m.id !== meal.id))
  }

  const removePlanned = (id: string) => {
    saveMeals(plannedMeals.filter(m => m.id !== id))
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-zinc-900/20 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-3xl font-black italic tracking-tighter uppercase">Provisioning Hub</h3>
          <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Ingredient Intelligence • {profile}</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <div className="relative group">
            <Input 
              placeholder="Add Dislike (e.g. Olives)" 
              className="h-12 w-64 bg-black/40 border-white/10 rounded-xl pr-12 text-xs"
              value={newDislike}
              onChange={e => setNewDislike(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addDislike()}
            />
            <button onClick={addDislike} className="absolute right-4 top-3.5 text-zinc-600 hover:text-white transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <Button 
            onClick={findMeals}
            disabled={isSearching}
            className="h-12 bg-white text-black hover:bg-zinc-200 rounded-xl px-8 font-black uppercase text-[10px] tracking-widest shadow-xl"
          >
            {isSearching ? <Sparkles className="w-4 h-4 animate-spin" /> : 'Find Intelligent Meals'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Exclusion Logic */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Ban className="w-4 h-4 text-zinc-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 italic">Ingredient Exclusions</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {dislikes.map((item) => (
                <motion.span
                  key={item}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-lg flex items-center gap-2 group"
                >
                  {item}
                  <button onClick={() => removeDislike(item)} className="hover:text-white transition-colors">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
            {dislikes.length === 0 && (
              <p className="text-[10px] text-zinc-700 italic font-mono uppercase tracking-widest py-4">No exclusions defined.</p>
            )}
          </div>
        </div>

        {/* Suggestion Engine */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <ChefHat className="w-4 h-4 text-zinc-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 italic">Curated Menus (Filtered)</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {suggestions.map((meal) => (
                <motion.div
                  key={meal.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-4 group hover:bg-zinc-900/60 transition-all"
                >
                  <div className="space-y-1">
                    <h5 className="text-xl font-black italic tracking-tighter uppercase text-white leading-none">{meal.name}</h5>
                    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">{meal.ingredients.join(' • ')}</p>
                  </div>
                  <Button 
                    onClick={() => planMeal(meal)}
                    className="w-full h-10 bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                  >
                    Add to Provisions
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            {suggestions.length === 0 && !isSearching && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                <p className="text-[10px] text-zinc-700 font-mono uppercase tracking-widest">Use the intelligence engine to find meals.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Planned Meals (Provision List) */}
      <div className="space-y-8 pt-12">
        <div className="flex items-center justify-between border-b border-white/5 pb-4 px-2">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-5 h-5 text-zinc-500" />
            <h4 className="text-xl font-black italic tracking-tighter uppercase">Weekly Provision List</h4>
          </div>
          <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">{plannedMeals.length} Meals Planned</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {plannedMeals.map((meal) => (
              <motion.div
                key={meal.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6 relative group"
              >
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-white/5 rounded-2xl">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <button onClick={() => removePlanned(meal.id)} className="p-2 text-zinc-800 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-2xl font-black italic tracking-tighter uppercase text-white">{meal.name}</h4>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {meal.ingredients.map(ing => (
                      <span key={ing} className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs font-light text-zinc-400 italic leading-relaxed">
                    "{meal.instructions}"
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
