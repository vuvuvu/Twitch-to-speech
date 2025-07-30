import { useState, useEffect, useCallback, useRef } from 'react'

const MOCK_CHAT_MESSAGES = [
  { username: 'viewer1', message: 'Hello everyone!' },
  { username: 'gamer_pro', message: 'This stream is awesome!' },
  { username: 'chat_master', message: 'Can you play that song again?' },
  { username: 'stream_fan', message: 'Love the new overlay!' },
  { username: 'twitch_user', message: 'First time here, great content!' }
]

export function useTwitchExtension() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [context, setContext] = useState(null)
  const [configuration, setConfiguration] = useState({})
  const [isTestMode, setIsTestMode] = useState(false)
  const [error, setError] = useState(null)
  
  const twitchRef = useRef(null)
  const chatListenerRef = useRef(null)
  const mockIntervalRef = useRef(null)
  
  // Initialize Twitch Extension Helper
  useEffect(() => {
    const initializeTwitch = () => {
      if (window.Twitch && window.Twitch.ext) {
        twitchRef.current = window.Twitch.ext
        
        // Set up authorization callback
        twitchRef.current.onAuthorized((auth) => {
          console.log('Twitch Extension Authorized:', auth)
          setIsAuthorized(true)
          setError(null)
        })
        
        // Set up context callback
        twitchRef.current.onContext((context, changed) => {
          console.log('Twitch Context Updated:', context, changed)
          setContext(context)
        })
        
        // Set up configuration callback
        twitchRef.current.configuration.onChanged(() => {
          const config = twitchRef.current.configuration.broadcaster || {}
          console.log('Configuration Changed:', config)
          setConfiguration(config)
        })
        
        // Set up error handling
        twitchRef.current.onError((error) => {
          console.error('Twitch Extension Error:', error)
          setError(error)
        })
        
        console.log('Twitch Extension Helper initialized')
      } else {
        console.warn('Twitch Extension Helper not available, enabling test mode')
        setIsTestMode(true)
        setIsAuthorized(true)
        setContext({
          theme: 'dark',
          language: 'en',
          mode: 'viewer'
        })
      }
    }
    
    // Check if Twitch is already loaded
    if (window.Twitch && window.Twitch.ext) {
      initializeTwitch()
    } else {
      // Wait for Twitch to load
      const checkTwitch = setInterval(() => {
        if (window.Twitch && window.Twitch.ext) {
          clearInterval(checkTwitch)
          initializeTwitch()
        }
      }, 100)
      
      // Fallback to test mode after 5 seconds
      setTimeout(() => {
        if (!twitchRef.current) {
          clearInterval(checkTwitch)
          console.warn('Twitch Extension Helper failed to load, enabling test mode')
          setIsTestMode(true)
          setIsAuthorized(true)
          setContext({
            theme: 'dark',
            language: 'en',
            mode: 'viewer'
          })
        }
      }, 5000)
      
      return () => clearInterval(checkTwitch)
    }
  }, [])
  
  // Listen to chat messages
  const listenToChat = useCallback((onMessage) => {
    if (!onMessage) return () => {}
    
    if (isTestMode) {
      // Mock chat messages for testing
      let messageIndex = 0
      
      const sendMockMessage = () => {
        const mockMessage = MOCK_CHAT_MESSAGES[messageIndex % MOCK_CHAT_MESSAGES.length]
        onMessage(mockMessage.username, mockMessage.message)
        messageIndex++
      }
      
      // Send initial message after 2 seconds
      const initialTimeout = setTimeout(sendMockMessage, 2000)
      
      // Send messages every 8-15 seconds
      const interval = setInterval(() => {
        sendMockMessage()
      }, Math.random() * 7000 + 8000)
      
      mockIntervalRef.current = interval
      
      return () => {
        clearTimeout(initialTimeout)
        clearInterval(interval)
        mockIntervalRef.current = null
      }
    }
    
    if (twitchRef.current && twitchRef.current.listen) {
      try {
        // Listen to chat messages via PubSub
        const unlisten = twitchRef.current.listen('broadcast', (target, contentType, message) => {
          try {
            if (contentType === 'application/json') {
              const data = JSON.parse(message)
              if (data.type === 'chat_message' && data.username && data.message) {
                onMessage(data.username, data.message)
              }
            }
          } catch (error) {
            console.error('Error parsing chat message:', error)
          }
        })
        
        chatListenerRef.current = unlisten
        return unlisten
      } catch (error) {
        console.error('Error setting up chat listener:', error)
        setError(error)
        return () => {}
      }
    }
    
    return () => {}
  }, [isTestMode])
  
  // Send configuration
  const sendConfiguration = useCallback((config) => {
    if (isTestMode) {
      console.log('Mock: Sending configuration:', config)
      setConfiguration(config)
      return Promise.resolve()
    }
    
    if (twitchRef.current && twitchRef.current.configuration) {
      try {
        twitchRef.current.configuration.set('broadcaster', '1.0', JSON.stringify(config))
        return Promise.resolve()
      } catch (error) {
        console.error('Error sending configuration:', error)
        setError(error)
        return Promise.reject(error)
      }
    }
    
    return Promise.reject(new Error('Twitch Extension not available'))
  }, [isTestMode])
  
  // Send broadcast message
  const sendBroadcast = useCallback((message) => {
    if (isTestMode) {
      console.log('Mock: Sending broadcast:', message)
      return Promise.resolve()
    }
    
    if (twitchRef.current && twitchRef.current.send) {
      try {
        twitchRef.current.send('broadcast', 'application/json', JSON.stringify(message))
        return Promise.resolve()
      } catch (error) {
        console.error('Error sending broadcast:', error)
        setError(error)
        return Promise.reject(error)
      }
    }
    
    return Promise.reject(new Error('Twitch Extension not available'))
  }, [isTestMode])
  
  // Get user info
  const getUserInfo = useCallback(() => {
    if (isTestMode) {
      return {
        id: 'test_user_123',
        login: 'test_user',
        displayName: 'Test User',
        role: 'viewer'
      }
    }
    
    if (twitchRef.current && twitchRef.current.viewer) {
      return {
        id: twitchRef.current.viewer.id,
        login: twitchRef.current.viewer.login,
        displayName: twitchRef.current.viewer.displayName,
        role: twitchRef.current.viewer.role
      }
    }
    
    return null
  }, [isTestMode])
  
  // Get channel info
  const getChannelInfo = useCallback(() => {
    if (isTestMode) {
      return {
        id: 'test_channel_456',
        name: 'test_streamer',
        displayName: 'Test Streamer',
        game: 'Just Chatting'
      }
    }
    
    if (context && context.channelId) {
      return {
        id: context.channelId,
        name: context.channelName || 'Unknown',
        displayName: context.displayName || context.channelName || 'Unknown',
        game: context.game || 'Unknown'
      }
    }
    
    return null
  }, [context, isTestMode])
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (chatListenerRef.current) {
        chatListenerRef.current()
      }
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current)
      }
    }
  }, [])
  
  return {
    // State
    isAuthorized,
    context,
    configuration,
    isTestMode,
    error,
    
    // Actions
    listenToChat,
    sendConfiguration,
    sendBroadcast,
    getUserInfo,
    getChannelInfo,
    
    // Computed
    isReady: isAuthorized,
    theme: context?.theme || 'dark',
    language: context?.language || 'en',
    mode: context?.mode || 'viewer',
    channelId: context?.channelId,
    
    // Twitch Extension Helper reference
    twitch: twitchRef.current
  }
}