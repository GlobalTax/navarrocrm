import { useEffect, useMemo, useState } from 'react'
import { useApp } from '@/contexts/AppContext'

export type PageUIPreferences = {
  showKpis: boolean
  hiddenCards: string[]
}

const DEFAULTS: PageUIPreferences = {
  showKpis: false,
  hiddenCards: []
}

function readFromStorage(userId: string): Record<string, PageUIPreferences> {
  try {
    const raw = localStorage.getItem(`ui:preferences:${userId || 'anon'}`)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeToStorage(userId: string, data: Record<string, PageUIPreferences>) {
  try {
    localStorage.setItem(`ui:preferences:${userId || 'anon'}`, JSON.stringify(data))
  } catch {
    // ignore quota errors
  }
}

export function useUIPreferences(pageKey: string, defaults?: Partial<PageUIPreferences>) {
  const { user } = useApp()
  const userId = user?.id || 'anon'

  const initial = useMemo(() => {
    const map = readFromStorage(userId)
    const current = map[pageKey]
    const merged: PageUIPreferences = {
      ...DEFAULTS,
      ...(defaults || {}),
      ...(current || {})
    }
    return merged
  }, [userId, pageKey, defaults])

  const [prefs, setPrefs] = useState<PageUIPreferences>(initial)

  // Persist when userId/pageKey changes (load latest)
  useEffect(() => {
    const map = readFromStorage(userId)
    const current = map[pageKey]
    if (current) setPrefs(prev => ({ ...prev, ...current }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, pageKey])

  // Save on change
  useEffect(() => {
    const map = readFromStorage(userId)
    map[pageKey] = prefs
    writeToStorage(userId, map)
  }, [prefs, userId, pageKey])

  const toggleKpis = () => setPrefs(p => ({ ...p, showKpis: !p.showKpis }))
  const setShowKpis = (v: boolean) => setPrefs(p => ({ ...p, showKpis: v }))

  const hideCard = (cardId: string) => setPrefs(p => ({ ...p, hiddenCards: Array.from(new Set([...(p.hiddenCards || []), cardId])) }))
  const showCard = (cardId: string) => setPrefs(p => ({ ...p, hiddenCards: (p.hiddenCards || []).filter(id => id !== cardId) }))
  const resetCards = () => setPrefs(p => ({ ...p, hiddenCards: [] }))

  const isCardVisible = (cardId: string) => !(prefs.hiddenCards || []).includes(cardId)

  return {
    showKpis: prefs.showKpis,
    hiddenCards: prefs.hiddenCards,
    toggleKpis,
    setShowKpis,
    hideCard,
    showCard,
    resetCards,
    isCardVisible,
  }
}
