import { useState, useEffect, useCallback, useRef } from 'react'
import { filterMessage, isUserMuted, getUserColor, generateId } from '../utils'

const DEFAULT_SETTINGS = {
  volume: 0.8,
  rate: 1.0,
  pitch: 0.8,
  voiceMode: 'random',
  mutedUsers: [],
  enabled: false,
  maxQueueSize: 10
}

export function useTTS(initialSettings = {}) {
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS, ...initialSettings })
  const [voices, setVoices] = useState([])
  const [speechQueue, setSpeechQueue] = useState([])
  const [currentMessage, setCurrentMessage] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [stats, setStats] = useState({
    totalMessages: 0,
    queueSize: 0,
    uniqueUsers: new Set()
  })
  
  const synthesisRef = useRef(window.speechSynthesis)
  const currentUtteranceRef = useRef(null)
  const userVoicesRef = useRef(new Map())
  const processingRef = useRef(false)
  
  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synthesisRef.current.getVoices()
      if (availableVoices.length === 0) return
      
      // Filter to English voices for better compatibility
      const englishVoices = availableVoices.filter(v => v.lang.startsWith('en-'))
      const voicesToUse = englishVoices.length > 0 ? englishVoices.slice(0, 12) : availableVoices.slice(0, 12)
      
      setVoices(voicesToUse)
    }
    
    loadVoices()
    
    if (synthesisRef.current.onvoiceschanged !== undefined) {
      synthesisRef.current.onvoiceschanged = loadVoices
    }
    
    return () => {
      if (synthesisRef.current.onvoiceschanged !== undefined) {
        synthesisRef.current.onvoiceschanged = null
      }
    }
  }, [])
  
  // Get voice for user
  const getVoiceForUser = useCallback((username) => {
    if (!voices.length) return null
    
    if (settings.voiceMode === 'random') {
      if (!userVoicesRef.current.has(username)) {
        const randomVoice = voices[Math.floor(Math.random() * voices.length)]
        userVoicesRef.current.set(username, randomVoice)
      }
      return userVoicesRef.current.get(username)
    } else {
      const voiceIndex = parseInt(settings.voiceMode)
      return voices[voiceIndex] || voices[0]
    }
  }, [voices, settings.voiceMode])
  
  // Process speech queue
  const processQueue = useCallback(() => {
    if (processingRef.current || speechQueue.length === 0 || isPaused || !settings.enabled) {
      return
    }
    
    processingRef.current = true
    const nextMessage = speechQueue[0]
    
    setSpeechQueue(prev => prev.slice(1))
    setCurrentMessage(nextMessage)
    setIsPlaying(true)
    
    const utterance = new SpeechSynthesisUtterance(nextMessage.text)
    const voice = getVoiceForUser(nextMessage.username)
    
    if (voice) {
      utterance.voice = voice
    }
    
    utterance.volume = settings.volume
    utterance.rate = settings.rate
    utterance.pitch = settings.pitch
    
    utterance.onstart = () => {
      setIsPlaying(true)
    }
    
    utterance.onend = () => {
      setIsPlaying(false)
      setCurrentMessage(null)
      currentUtteranceRef.current = null
      processingRef.current = false
      
      // Process next message after a short delay
      setTimeout(() => {
        processQueue()
      }, 100)
    }
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      setIsPlaying(false)
      setCurrentMessage(null)
      currentUtteranceRef.current = null
      processingRef.current = false
      
      // Try next message
      setTimeout(() => {
        processQueue()
      }, 500)
    }
    
    currentUtteranceRef.current = utterance
    synthesisRef.current.speak(utterance)
  }, [speechQueue, isPaused, settings, getVoiceForUser])
  
  // Auto-process queue when conditions change
  useEffect(() => {
    if (!isPlaying && speechQueue.length > 0 && settings.enabled && !isPaused) {
      processQueue()
    }
  }, [speechQueue, isPlaying, settings.enabled, isPaused, processQueue])
  
  // Update stats
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      queueSize: speechQueue.length
    }))
  }, [speechQueue.length])
  
  // Add message to queue
  const addMessage = useCallback((username, message) => {
    if (!settings.enabled || isUserMuted(username, settings.mutedUsers)) {
      return false
    }
    
    const filteredMessage = filterMessage(message)
    if (!filteredMessage) return false
    
    const messageData = {
      id: generateId(),
      username,
      text: filteredMessage,
      timestamp: Date.now(),
      color: getUserColor(username)
    }
    
    setSpeechQueue(prev => {
      const newQueue = [...prev, messageData]
      // Limit queue size
      if (newQueue.length > settings.maxQueueSize) {
        return newQueue.slice(-settings.maxQueueSize)
      }
      return newQueue
    })
    
    // Update stats
    setStats(prev => {
      const newUniqueUsers = new Set(prev.uniqueUsers)
      newUniqueUsers.add(username)
      
      return {
        totalMessages: prev.totalMessages + 1,
        queueSize: prev.queueSize + 1,
        uniqueUsers: newUniqueUsers
      }
    })
    
    return true
  }, [settings.enabled, settings.mutedUsers, settings.maxQueueSize])
  
  // Control functions
  const toggleEnabled = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }))
    if (settings.enabled) {
      // Stop current speech and clear queue
      synthesisRef.current.cancel()
      setSpeechQueue([])
      setCurrentMessage(null)
      setIsPlaying(false)
      currentUtteranceRef.current = null
      processingRef.current = false
    }
  }, [settings.enabled])
  
  const togglePause = useCallback(() => {
    if (isPaused) {
      synthesisRef.current.resume()
      setIsPaused(false)
    } else {
      synthesisRef.current.pause()
      setIsPaused(true)
    }
  }, [isPaused])
  
  const clearQueue = useCallback(() => {
    synthesisRef.current.cancel()
    setSpeechQueue([])
    setCurrentMessage(null)
    setIsPlaying(false)
    setIsPaused(false)
    currentUtteranceRef.current = null
    processingRef.current = false
  }, [])
  
  const skipCurrent = useCallback(() => {
    if (currentUtteranceRef.current) {
      synthesisRef.current.cancel()
    }
  }, [])
  
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])
  
  const removeFromQueue = useCallback((messageId) => {
    setSpeechQueue(prev => prev.filter(msg => msg.id !== messageId))
  }, [])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      synthesisRef.current.cancel()
    }
  }, [])
  
  return {
    // State
    settings,
    voices,
    speechQueue,
    currentMessage,
    isPlaying,
    isPaused,
    stats: {
      ...stats,
      uniqueUsersCount: stats.uniqueUsers.size
    },
    
    // Actions
    addMessage,
    toggleEnabled,
    togglePause,
    clearQueue,
    skipCurrent,
    updateSettings,
    removeFromQueue,
    
    // Computed
    isReady: voices.length > 0,
    queueSize: speechQueue.length,
    canSpeak: settings.enabled && voices.length > 0
  }
}