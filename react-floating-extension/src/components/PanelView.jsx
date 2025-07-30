import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipForward, 
  Trash2, 
  Settings, 
  MessageSquare,
  Users,
  Activity,
  Info,
  Zap,
  Eye,
  EyeOff
} from 'lucide-react'
import { useTTS } from '../hooks/useTTS'
import { useTwitchExtension } from '../hooks/useTwitchExtension'
import { cn, formatDuration } from '../utils'

const PanelView = () => {
  const [activeTab, setActiveTab] = useState('controls')
  const [showAdvanced, setShowAdvanced] = useState(false)
  
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
    getUserInfo,
    getChannelInfo,
    sendConfiguration
  } = useTwitchExtension()
  
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
  
  const handleMaxQueueSizeChange = useCallback((e) => {
    updateSettings({ maxQueueSize: parseInt(e.target.value) })
  }, [updateSettings])
  
  const saveConfiguration = useCallback(async () => {
    try {
      await sendConfiguration(settings)
      // Show success feedback
    } catch (error) {
      console.error('Failed to save configuration:', error)
      // Show error feedback
    }
  }, [settings, sendConfiguration])
  
  const userInfo = getUserInfo()
  const channelInfo = getChannelInfo()
  
  const tabs = [
    { id: 'controls', label: 'Controls', icon: Volume2 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'queue', label: 'Queue', icon: MessageSquare },
    { id: 'stats', label: 'Stats', icon: Activity }
  ]
  
  return (
    <div className="w-full h-full bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-twitch-purple to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
            >
              {settings.enabled ? (
                isPlaying ? <Volume2 className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />
              ) : (
                <VolumeX className="w-6 h-6" />
              )}
            </motion.div>
            <div>
              <h1 className="text-lg font-bold">TTS Chat Reader</h1>
              <p className="text-sm text-purple-200">
                {isTestMode ? 'Test Mode' : channelInfo?.displayName || 'Extension Panel'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={cn(
              'status-indicator',
              isReady ? 'online' : 'offline'
            )}>
              <div className="w-2 h-2 rounded-full bg-current" />
              {isReady ? 'Ready' : 'Loading'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-twitch-purple text-white border-b-2 border-twitch-purple'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>
      
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="wait">
          {activeTab === 'controls' && (
            <motion.div
              key="controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4"
            >
              {/* Main Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div>
                  <h3 className="font-semibold">Text-to-Speech</h3>
                  <p className="text-sm text-gray-400">Enable chat message reading</p>
                </div>
                <button
                  onClick={toggleEnabled}
                  className={cn(
                    'toggle',
                    settings.enabled && 'enabled'
                  )}
                >
                  <span className="toggle-thumb" />
                </button>
              </div>
              
              {/* Playback Controls */}
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Playback Controls
                </h3>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePause}
                    disabled={!isPlaying}
                    className="btn btn-secondary flex-1"
                  >
                    {isPaused ? (
                      <><Play className="w-4 h-4 mr-2" /> Resume</>
                    ) : (
                      <><Pause className="w-4 h-4 mr-2" /> Pause</>
                    )}
                  </button>
                  
                  <button
                    onClick={skipCurrent}
                    disabled={!isPlaying}
                    className="btn btn-secondary"
                    title="Skip Current"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={clearQueue}
                    disabled={speechQueue.length === 0}
                    className="btn btn-danger"
                    title="Clear Queue"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Current Message */}
              <AnimatePresence>
                {currentMessage && (
                  <motion.div
                    className="current-message"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div className="current-message-header">
                      <span 
                        className="current-message-username"
                        style={{ color: currentMessage.color }}
                      >
                        {currentMessage.username}
                      </span>
                      <div className="flex items-center gap-2">
                        {isPlaying && (
                          <motion.div
                            className="flex items-center gap-1 text-xs text-twitch-purple"
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <Zap className="w-3 h-3" />
                            Speaking
                          </motion.div>
                        )}
                      </div>
                    </div>
                    <p className="current-message-text">
                      {currentMessage.text}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-800 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-twitch-purple">{speechQueue.length}</div>
                  <div className="text-xs text-gray-400">In Queue</div>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-green-400">{stats.totalMessages}</div>
                  <div className="text-xs text-gray-400">Total</div>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg text-center">
                  <div className="text-lg font-bold text-blue-400">{stats.uniqueUsersCount}</div>
                  <div className="text-xs text-gray-400">Users</div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4"
            >
              {/* Voice Settings */}
              <div className="space-y-3">
                <h3 className="font-semibold">Voice Settings</h3>
                
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
                  <label className="form-label">Voice Selection</label>
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
                  <p className="text-xs text-gray-400 mt-1">
                    {voices.length} voices available
                  </p>
                </div>
              </div>
              
              {/* User Management */}
              <div className="space-y-3">
                <h3 className="font-semibold">User Management</h3>
                
                <div className="form-group">
                  <label className="form-label">Muted Users</label>
                  <input
                    type="text"
                    value={settings.mutedUsers.join(', ')}
                    onChange={handleMutedUsersChange}
                    placeholder="username1, username2, ..."
                    className="form-input"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Comma-separated list of usernames to ignore
                  </p>
                </div>
              </div>
              
              {/* Advanced Settings */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 font-semibold text-twitch-purple hover:text-twitch-purple-dark transition-colors"
                >
                  {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  Advanced Settings
                </button>
                
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <div className="form-group">
                        <label className="form-label">Max Queue Size: {settings.maxQueueSize}</label>
                        <input
                          type="range"
                          min="5"
                          max="50"
                          step="5"
                          value={settings.maxQueueSize}
                          onChange={handleMaxQueueSizeChange}
                          className="form-range"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Maximum number of messages to queue
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Save Configuration */}
              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={saveConfiguration}
                  className="btn btn-primary w-full"
                >
                  Save Configuration
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Settings are automatically saved locally
                </p>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'queue' && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Message Queue ({speechQueue.length})</h3>
                <button
                  onClick={clearQueue}
                  disabled={speechQueue.length === 0}
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear All
                </button>
              </div>
              
              {speechQueue.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No messages in queue</p>
                  <p className="text-sm">Chat messages will appear here when TTS is enabled</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {speechQueue.map((message, index) => (
                    <motion.div
                      key={message.id}
                      className="message-item"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="message-content">
                        <div 
                          className="message-username"
                          style={{ color: message.color }}
                        >
                          {index + 1}. {message.username}
                        </div>
                        <div className="message-text">
                          {message.text}
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromQueue(message.id)}
                        className="btn btn-ghost btn-icon btn-sm text-red-400 hover:text-red-300"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 space-y-4"
            >
              <h3 className="font-semibold">Statistics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-twitch-purple">{stats.totalMessages}</div>
                  <div className="text-sm text-gray-400">Total Messages</div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{stats.uniqueUsersCount}</div>
                  <div className="text-sm text-gray-400">Unique Users</div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">{speechQueue.length}</div>
                  <div className="text-sm text-gray-400">Queue Size</div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">{voices.length}</div>
                  <div className="text-sm text-gray-400">Available Voices</div>
                </div>
              </div>
              
              {/* System Info */}
              <div className="space-y-3">
                <h4 className="font-semibold">System Information</h4>
                
                <div className="bg-gray-800 p-3 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Extension Status:</span>
                    <span className={isAuthorized ? 'text-green-400' : 'text-red-400'}>
                      {isAuthorized ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">TTS Ready:</span>
                    <span className={isReady ? 'text-green-400' : 'text-yellow-400'}>
                      {isReady ? 'Yes' : 'Loading...'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Test Mode:</span>
                    <span className={isTestMode ? 'text-yellow-400' : 'text-green-400'}>
                      {isTestMode ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  {channelInfo && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Channel:</span>
                        <span className="text-white">{channelInfo.displayName}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Game:</span>
                        <span className="text-white">{channelInfo.game}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Keyboard Shortcuts */}
              <div className="space-y-3">
                <h4 className="font-semibold">Keyboard Shortcuts</h4>
                
                <div className="bg-gray-800 p-3 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Toggle TTS:</span>
                    <span className="text-white font-mono">Alt + T</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pause/Resume:</span>
                    <span className="text-white font-mono">Alt + P</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Skip Current:</span>
                    <span className="text-white font-mono">Alt + S</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Clear Queue:</span>
                    <span className="text-white font-mono">Alt + C</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PanelView