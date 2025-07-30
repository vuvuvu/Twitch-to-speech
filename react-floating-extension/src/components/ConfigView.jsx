import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, 
  RotateCcw, 
  Settings, 
  Volume2, 
  Users, 
  MessageSquare,
  Info,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { useTTS } from '../hooks/useTTS'
import { useTwitchExtension } from '../hooks/useTwitchExtension'
import { cn } from '../utils'

const ConfigView = () => {
  const [saveStatus, setSaveStatus] = useState(null) // 'saving', 'success', 'error'
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [previewSettings, setPreviewSettings] = useState(null)
  
  // Initialize hooks
  const {
    settings,
    voices,
    updateSettings,
    resetSettings,
    isReady
  } = useTTS()
  
  const {
    isAuthorized,
    sendConfiguration,
    getUserInfo,
    getChannelInfo
  } = useTwitchExtension()
  
  const userInfo = getUserInfo()
  const channelInfo = getChannelInfo()
  
  // Default settings for reset
  const defaultSettings = {
    enabled: true,
    volume: 0.8,
    rate: 1.0,
    pitch: 1.0,
    voiceMode: 'random',
    mutedUsers: [],
    maxQueueSize: 20,
    minMessageLength: 1,
    maxMessageLength: 500,
    enableEmotes: true,
    enableCommands: false,
    commandPrefix: '!'
  }
  
  const handleSettingChange = useCallback((key, value) => {
    const newSettings = { ...settings, [key]: value }
    updateSettings({ [key]: value })
    setPreviewSettings(newSettings)
  }, [settings, updateSettings])
  
  const handleVolumeChange = useCallback((e) => {
    handleSettingChange('volume', parseFloat(e.target.value))
  }, [handleSettingChange])
  
  const handleRateChange = useCallback((e) => {
    handleSettingChange('rate', parseFloat(e.target.value))
  }, [handleSettingChange])
  
  const handlePitchChange = useCallback((e) => {
    handleSettingChange('pitch', parseFloat(e.target.value))
  }, [handleSettingChange])
  
  const handleVoiceModeChange = useCallback((e) => {
    handleSettingChange('voiceMode', e.target.value)
  }, [handleSettingChange])
  
  const handleMutedUsersChange = useCallback((e) => {
    const users = e.target.value.split(',').map(u => u.trim()).filter(Boolean)
    handleSettingChange('mutedUsers', users)
  }, [handleSettingChange])
  
  const handleMaxQueueSizeChange = useCallback((e) => {
    handleSettingChange('maxQueueSize', parseInt(e.target.value))
  }, [handleSettingChange])
  
  const handleMinMessageLengthChange = useCallback((e) => {
    handleSettingChange('minMessageLength', parseInt(e.target.value))
  }, [handleSettingChange])
  
  const handleMaxMessageLengthChange = useCallback((e) => {
    handleSettingChange('maxMessageLength', parseInt(e.target.value))
  }, [handleSettingChange])
  
  const handleToggleChange = useCallback((key) => {
    handleSettingChange(key, !settings[key])
  }, [settings, handleSettingChange])
  
  const saveConfiguration = useCallback(async () => {
    setSaveStatus('saving')
    
    try {
      await sendConfiguration(settings)
      setSaveStatus('success')
      setPreviewSettings(null)
      
      // Clear success status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (error) {
      console.error('Failed to save configuration:', error)
      setSaveStatus('error')
      
      // Clear error status after 5 seconds
      setTimeout(() => setSaveStatus(null), 5000)
    }
  }, [settings, sendConfiguration])
  
  const resetToDefaults = useCallback(() => {
    Object.entries(defaultSettings).forEach(([key, value]) => {
      updateSettings({ [key]: value })
    })
    setPreviewSettings(null)
  }, [updateSettings])
  
  const currentSettings = previewSettings || settings
  
  return (
    <div className="w-full h-full bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-twitch-purple to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Settings className="w-8 h-8" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold">TTS Configuration</h1>
              <p className="text-purple-200">
                Configure Text-to-Speech settings for {channelInfo?.displayName || 'your channel'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={cn(
              'status-indicator',
              isReady ? 'online' : 'offline'
            )}>
              <div className="w-3 h-3 rounded-full bg-current" />
              {isReady ? 'Ready' : 'Loading'}
            </div>
            
            {userInfo?.role === 'broadcaster' && (
              <div className="px-3 py-1 bg-yellow-500 text-black rounded-full text-sm font-semibold">
                Broadcaster
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Save Status */}
          <AnimatePresence>
            {saveStatus && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  'flex items-center gap-3 p-4 rounded-lg',
                  saveStatus === 'saving' && 'bg-blue-500/20 text-blue-300',
                  saveStatus === 'success' && 'bg-green-500/20 text-green-300',
                  saveStatus === 'error' && 'bg-red-500/20 text-red-300'
                )}
              >
                {saveStatus === 'saving' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Settings className="w-5 h-5" />
                  </motion.div>
                )}
                {saveStatus === 'success' && <CheckCircle className="w-5 h-5" />}
                {saveStatus === 'error' && <AlertCircle className="w-5 h-5" />}
                
                <span className="font-medium">
                  {saveStatus === 'saving' && 'Saving configuration...'}
                  {saveStatus === 'success' && 'Configuration saved successfully!'}
                  {saveStatus === 'error' && 'Failed to save configuration. Please try again.'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Voice Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Volume2 className="w-6 h-6 text-twitch-purple" />
              <h2 className="text-xl font-bold">Voice Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Volume: {Math.round(currentSettings.volume * 100)}%</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={currentSettings.volume}
                  onChange={handleVolumeChange}
                  className="form-range"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Mute</span>
                  <span>Max</span>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Speed: {currentSettings.rate}x</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={currentSettings.rate}
                  onChange={handleRateChange}
                  className="form-range"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0.5x</span>
                  <span>2x</span>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Pitch: {currentSettings.pitch}</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={currentSettings.pitch}
                  onChange={handlePitchChange}
                  className="form-range"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Voice Selection</label>
                <select
                  value={currentSettings.voiceMode}
                  onChange={handleVoiceModeChange}
                  className="form-select"
                >
                  <option value="random">Random per user</option>
                  <option value="consistent">Consistent per user</option>
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
          </motion.section>
          
          {/* User Management */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-twitch-purple" />
              <h2 className="text-xl font-bold">User Management</h2>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Muted Users</label>
                <input
                  type="text"
                  value={currentSettings.mutedUsers.join(', ')}
                  onChange={handleMutedUsersChange}
                  placeholder="username1, username2, username3..."
                  className="form-input"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Comma-separated list of usernames to ignore. Messages from these users won't be read aloud.
                </p>
              </div>
            </div>
          </motion.section>
          
          {/* Message Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-twitch-purple" />
              <h2 className="text-xl font-bold">Message Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Max Queue Size: {currentSettings.maxQueueSize}</label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={currentSettings.maxQueueSize}
                  onChange={handleMaxQueueSizeChange}
                  className="form-range"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>5</span>
                  <span>100</span>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Min Message Length: {currentSettings.minMessageLength}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={currentSettings.minMessageLength}
                  onChange={handleMinMessageLengthChange}
                  className="form-range"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1</span>
                  <span>10</span>
                </div>
              </div>
              
              <div className="form-group md:col-span-2">
                <label className="form-label">Max Message Length: {currentSettings.maxMessageLength}</label>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={currentSettings.maxMessageLength}
                  onChange={handleMaxMessageLengthChange}
                  className="form-range"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>50</span>
                  <span>1000</span>
                </div>
              </div>
            </div>
          </motion.section>
          
          {/* Advanced Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-3 mb-6 text-twitch-purple hover:text-twitch-purple-dark transition-colors"
            >
              {showAdvanced ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              <h2 className="text-xl font-bold">Advanced Settings</h2>
            </button>
            
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-semibold">Enable Emotes</h4>
                        <p className="text-sm text-gray-400">Read emote names in messages</p>
                      </div>
                      <button
                        onClick={() => handleToggleChange('enableEmotes')}
                        className={cn(
                          'toggle',
                          currentSettings.enableEmotes && 'enabled'
                        )}
                      >
                        <span className="toggle-thumb" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-semibold">Enable Commands</h4>
                        <p className="text-sm text-gray-400">Read chat commands</p>
                      </div>
                      <button
                        onClick={() => handleToggleChange('enableCommands')}
                        className={cn(
                          'toggle',
                          currentSettings.enableCommands && 'enabled'
                        )}
                      >
                        <span className="toggle-thumb" />
                      </button>
                    </div>
                  </div>
                  
                  {currentSettings.enableCommands && (
                    <div className="form-group">
                      <label className="form-label">Command Prefix</label>
                      <input
                        type="text"
                        value={currentSettings.commandPrefix}
                        onChange={(e) => handleSettingChange('commandPrefix', e.target.value)}
                        placeholder="!"
                        className="form-input max-w-xs"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Prefix for chat commands (e.g., ! for !help)
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
          
          {/* System Information */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-800 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Info className="w-6 h-6 text-twitch-purple" />
              <h2 className="text-xl font-bold">System Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-400">Extension Status:</span>
                <span className={isAuthorized ? 'text-green-400' : 'text-red-400'}>
                  {isAuthorized ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="flex justify-between p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-400">TTS Ready:</span>
                <span className={isReady ? 'text-green-400' : 'text-yellow-400'}>
                  {isReady ? 'Yes' : 'Loading...'}
                </span>
              </div>
              
              <div className="flex justify-between p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-400">Available Voices:</span>
                <span className="text-white">{voices.length}</span>
              </div>
              
              <div className="flex justify-between p-3 bg-gray-700 rounded-lg">
                <span className="text-gray-400">User Role:</span>
                <span className="text-white">{userInfo?.role || 'Viewer'}</span>
              </div>
              
              {channelInfo && (
                <>
                  <div className="flex justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-400">Channel:</span>
                    <span className="text-white">{channelInfo.displayName}</span>
                  </div>
                  
                  <div className="flex justify-between p-3 bg-gray-700 rounded-lg">
                    <span className="text-gray-400">Game:</span>
                    <span className="text-white">{channelInfo.game || 'Not set'}</span>
                  </div>
                </>
              )}
            </div>
          </motion.section>
          
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={saveConfiguration}
              disabled={saveStatus === 'saving'}
              className="btn btn-primary flex-1 flex items-center justify-center gap-3"
            >
              {saveStatus === 'saving' ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Settings className="w-5 h-5" />
                </motion.div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              {saveStatus === 'saving' ? 'Saving...' : 'Save Configuration'}
            </button>
            
            <button
              onClick={resetToDefaults}
              className="btn btn-secondary flex items-center justify-center gap-3"
            >
              <RotateCcw className="w-5 h-5" />
              Reset to Defaults
            </button>
          </motion.div>
          
          {/* Footer */}
          <div className="text-center text-gray-400 text-sm py-4">
            <p>Configuration changes are saved automatically and synced across all extension views.</p>
            <p className="mt-1">For support, visit the extension's GitHub repository.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfigView