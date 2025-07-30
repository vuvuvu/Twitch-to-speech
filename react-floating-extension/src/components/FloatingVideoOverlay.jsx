import React, { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipForward, 
  Trash2, 
  Settings, 
  Minimize2, 
  Maximize2, 
  Move,
  MessageSquare,
  Users,
  Activity
} from 'lucide-react'
import { useTTS } from '../hooks/useTTS'
import { useTwitchExtension } from '../hooks/useTwitchExtension'
import { useFloatingUI } from '../hooks/useFloatingUI'
import { cn, formatDuration } from '../utils'

const FloatingVideoOverlay = () => {
  const [showSettings, setShowSettings] = useState(false)
  const [showStats, setShowStats] = useState(false)
  
  // Initialize hooks
  const {
    settings,
    voices,
    speechQueue,
    currentMessage,
    isPlaying,
    isPaused,
    stats,
    addMessage,
    toggleEnabled,
    togglePause,
    clearQueue,
    skipCurrent,
    updateSettings,
    removeFromQueue,
    isReady,
    canSpeak
  } = useTTS()
  
  const {
    isAuthorized,
    isTestMode,
    listenToChat,
    getUserInfo,
    getChannelInfo
  } = useTwitchExtension()
  
  const {
    position,
    size,
    isDragging,
    isMinimized,
    isVisible,
    opacity,
    elementRef,
    handleDragStart,
    handleResizeStart,
    toggleMinimize,
    toggleVisibility,
    updateOpacity,
    resetPosition,
    style
  } = useFloatingUI({
    initialPosition: { x: 20, y: 20 },
    initialSize: { width: 320, height: 180 },
    snapToEdges: true,
    persistPosition: true
  })
  
  // Set up chat listener
  useEffect(() => {
    if (!isAuthorized) return
    
    const unsubscribe = listenToChat((username, message) => {
      addMessage(username, message)
    })
    
    return unsubscribe
  }, [isAuthorized, listenToChat, addMessage])
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.altKey) {
        switch (event.key.toLowerCase()) {
          case 't':
            event.preventDefault()
            toggleEnabled()
            break
          case 'p':
            event.preventDefault()
            if (isPlaying) togglePause()
            break
          case 's':
            event.preventDefault()
            if (isPlaying) skipCurrent()
            break
          case 'c':
            event.preventDefault()
            clearQueue()
            break
          case 'm':
            event.preventDefault()
            toggleMinimize()
            break
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [toggleEnabled, togglePause, skipCurrent, clearQueue, toggleMinimize, isPlaying])
  
  const handleVolumeChange = useCallback((e) => {
    updateSettings({ volume: parseFloat(e.target.value) })
  }, [updateSettings])
  
  const handleRateChange = useCallback((e) => {
    updateSettings({ rate: parseFloat(e.target.value) })
  }, [updateSettings])
  
  const handlePitchChange = useCallback((e) => {
    updateSettings({ pitch: parseFloat(e.target.value) })
  }, [updateSettings])
  
  const handleVoiceModeChange = useCallback((e) => {
    updateSettings({ voiceMode: e.target.value })
  }, [updateSettings])
  
  const handleMutedUsersChange = useCallback((e) => {
    const users = e.target.value.split(',').map(u => u.trim()).filter(Boolean)
    updateSettings({ mutedUsers: users })
  }, [updateSettings])
  
  const userInfo = getUserInfo()
  const channelInfo = getChannelInfo()
  
  if (!isVisible) return null
  
  return (
    <motion.div
      ref={elementRef}
      style={style}
      className={cn(
        'floating-container select-none',
        isDragging && 'dragging',
        isMinimized && 'minimized'
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div 
        className="floating-header"
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
      >
        <div className="floating-title">
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
          >
            {settings.enabled ? (
              isPlaying ? <Volume2 className="w-4 h-4 text-twitch-purple" /> : <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-500" />
            )}
          </motion.div>
          <span className="text-gradient">TTS Chat</span>
          {isTestMode && (
            <span className="px-1.5 py-0.5 bg-yellow-600/20 text-yellow-400 text-xs rounded border border-yellow-600/30">
              TEST
            </span>
          )}
        </div>
        
        <div className="floating-controls">
          <button
            onClick={() => setShowStats(!showStats)}
            className="btn btn-ghost btn-icon btn-sm"
            title="Toggle Stats"
          >
            <Activity className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-ghost btn-icon btn-sm"
            title="Settings"
          >
            <Settings className="w-3 h-3" />
          </button>
          
          <button
            onClick={toggleMinimize}
            className="btn btn-ghost btn-icon btn-sm"
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>
      
      {/* Content */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            className="floating-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Main Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={toggleEnabled}
                className={cn(
                  'toggle',
                  settings.enabled && 'enabled'
                )}
                title={`${settings.enabled ? 'Disable' : 'Enable'} TTS (Alt+T)`}
              >
                <span className="toggle-thumb" />
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePause}
                  disabled={!isPlaying}
                  className="btn btn-secondary btn-sm"
                  title={`${isPaused ? 'Resume' : 'Pause'} (Alt+P)`}
                >
                  {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                </button>
                
                <button
                  onClick={skipCurrent}
                  disabled={!isPlaying}
                  className="btn btn-secondary btn-sm"
                  title="Skip Current (Alt+S)"
                >
                  <SkipForward className="w-3 h-3" />
                </button>
                
                <button
                  onClick={clearQueue}
                  disabled={speechQueue.length === 0}
                  className="btn btn-danger btn-sm"
                  title="Clear Queue (Alt+C)"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            {/* Current Message */}
            <AnimatePresence>
              {currentMessage && (
                <motion.div
                  className="current-message"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="current-message-header">
                    <span 
                      className="current-message-username"
                      style={{ color: currentMessage.color }}
                    >
                      {currentMessage.username}
                    </span>
                    <div className="flex items-center gap-1">
                      {isPlaying && (
                        <motion.div
                          className="w-2 h-2 bg-twitch-purple rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </div>
                  <p className="current-message-text text-sm">
                    {currentMessage.text}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Queue Status */}
            {speechQueue.length > 0 && (
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {speechQueue.length} in queue
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {stats.uniqueUsersCount} users
                </span>
              </div>
            )}
            
            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  className="space-y-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="form-group">
                    <label className="form-label">Volume: {Math.round(settings.volume * 100)}%</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.volume}
                      onChange={handleVolumeChange}
                      className="form-range"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Speed: {settings.rate}x</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={settings.rate}
                      onChange={handleRateChange}
                      className="form-range"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Pitch: {settings.pitch}</label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={settings.pitch}
                      onChange={handlePitchChange}
                      className="form-range"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Voice Mode</label>
                    <select
                      value={settings.voiceMode}
                      onChange={handleVoiceModeChange}
                      className="form-select"
                    >
                      <option value="random">Random per user</option>
                      {voices.map((voice, index) => (
                        <option key={voice.name} value={index}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Muted Users (comma-separated)</label>
                    <input
                      type="text"
                      value={settings.mutedUsers.join(', ')}
                      onChange={handleMutedUsersChange}
                      placeholder="username1, username2"
                      className="form-input"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Stats Panel */}
            <AnimatePresence>
              {showStats && (
                <motion.div
                  className="space-y-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700/30"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-gray-400">Total Messages:</div>
                    <div className="text-white font-medium">{stats.totalMessages}</div>
                    
                    <div className="text-gray-400">Queue Size:</div>
                    <div className="text-white font-medium">{stats.queueSize}</div>
                    
                    <div className="text-gray-400">Unique Users:</div>
                    <div className="text-white font-medium">{stats.uniqueUsersCount}</div>
                    
                    <div className="text-gray-400">Voices Available:</div>
                    <div className="text-white font-medium">{voices.length}</div>
                  </div>
                  
                  {channelInfo && (
                    <div className="pt-2 border-t border-gray-700/30">
                      <div className="text-xs text-gray-400 mb-1">Channel Info:</div>
                      <div className="text-xs text-white">{channelInfo.displayName}</div>
                      <div className="text-xs text-gray-400">{channelInfo.game}</div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Status Indicators */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'status-indicator',
                  isReady ? 'online' : 'offline'
                )}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  {isReady ? 'Ready' : 'Loading...'}
                </div>
                
                {isAuthorized && (
                  <div className="status-indicator online">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                    Connected
                  </div>
                )}
              </div>
              
              <div className="text-gray-500">
                Alt+T: Toggle | Alt+P: Pause | Alt+S: Skip | Alt+C: Clear
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Resize Handles */}
      {!isMinimized && (
        <>
          <div 
            className="resize-handle se"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            onTouchStart={(e) => handleResizeStart(e, 'se')}
          />
          <div 
            className="resize-handle sw"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            onTouchStart={(e) => handleResizeStart(e, 'sw')}
          />
          <div 
            className="resize-handle ne"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            onTouchStart={(e) => handleResizeStart(e, 'ne')}
          />
          <div 
            className="resize-handle nw"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            onTouchStart={(e) => handleResizeStart(e, 'nw')}
          />
        </>
      )}
    </motion.div>
  )
}

export default FloatingVideoOverlay