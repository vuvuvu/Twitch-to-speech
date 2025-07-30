import React from 'react'
import { createRoot } from 'react-dom/client'
import ConfigView from './components/ConfigView'
import './index.css'

// Initialize the config component
const container = document.getElementById('root')
if (!container) {
  // Create root element if it doesn't exist
  const rootElement = document.createElement('div')
  rootElement.id = 'root'
  rootElement.className = 'config-root'
  document.body.appendChild(rootElement)
  
  const root = createRoot(rootElement)
  root.render(<ConfigView />)
} else {
  const root = createRoot(container)
  root.render(<ConfigView />)
}

// Add global styles for config
document.body.style.margin = '0'
document.body.style.padding = '0'
document.body.style.background = '#1a1a1a'
document.body.style.fontFamily = 'Inter, system-ui, sans-serif'
document.body.style.minHeight = '100vh'

// Handle keyboard shortcuts for config
document.addEventListener('keydown', (e) => {
  // Handle Ctrl/Cmd + S for save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('config-save'))
    return
  }
  
  // Handle Ctrl/Cmd + R for reset
  if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('config-reset'))
    return
  }
  
  // Handle Escape to close advanced settings
  if (e.key === 'Escape') {
    window.dispatchEvent(new CustomEvent('config-escape'))
    return
  }
})

// Handle config-specific events
window.addEventListener('message', (event) => {
  // Handle messages from Twitch Extension API
  if (event.data && event.data.type === 'twitch-config') {
    window.dispatchEvent(new CustomEvent('twitch-config', { detail: event.data.payload }))
  }
})

// Auto-save functionality
let autoSaveTimeout
window.addEventListener('config-change', () => {
  // Clear existing timeout
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout)
  }
  
  // Set new timeout for auto-save (5 seconds after last change)
  autoSaveTimeout = setTimeout(() => {
    window.dispatchEvent(new CustomEvent('config-auto-save'))
  }, 5000)
})

// Handle beforeunload to warn about unsaved changes
let hasUnsavedChanges = false

window.addEventListener('config-change', () => {
  hasUnsavedChanges = true
})

window.addEventListener('config-save', () => {
  hasUnsavedChanges = false
})

window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges) {
    e.preventDefault()
    e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
    return e.returnValue
  }
})

// Accessibility improvements
document.addEventListener('DOMContentLoaded', () => {
  // Add focus management
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const focusable = Array.from(document.querySelectorAll(focusableElements))
      const firstFocusable = focusable[0]
      const lastFocusable = focusable[focusable.length - 1]
      
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault()
          lastFocusable.focus()
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault()
          firstFocusable.focus()
        }
      }
    }
  })
})

// Debug mode for development
if (process.env.NODE_ENV === 'development') {
  console.log('⚙️ Twitch TTS Configuration loaded')
  console.log('📋 Keyboard shortcuts:')
  console.log('  Ctrl/Cmd + S: Save configuration')
  console.log('  Ctrl/Cmd + R: Reset to defaults')
  console.log('  Escape: Close advanced settings')
  console.log('  Tab: Navigate between form elements')
  
  // Add development helpers
  window.ttsConfig = {
    exportSettings: () => {
      const settings = localStorage.getItem('tts-settings')
      console.log('Current settings:', JSON.parse(settings || '{}'))
      return settings
    },
    importSettings: (settingsJson) => {
      localStorage.setItem('tts-settings', settingsJson)
      window.location.reload()
    },
    clearSettings: () => {
      localStorage.removeItem('tts-settings')
      window.location.reload()
    }
  }
  
  console.log('🛠️ Development helpers available:')
  console.log('  window.ttsConfig.exportSettings() - Export current settings')
  console.log('  window.ttsConfig.importSettings(json) - Import settings')
  console.log('  window.ttsConfig.clearSettings() - Clear all settings')
}