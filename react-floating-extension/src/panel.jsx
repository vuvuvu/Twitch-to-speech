import React from 'react'
import { createRoot } from 'react-dom/client'
import PanelView from './components/PanelView'
import './index.css'

// Initialize the panel component
const container = document.getElementById('root')
if (!container) {
  // Create root element if it doesn't exist
  const rootElement = document.createElement('div')
  rootElement.id = 'root'
  rootElement.className = 'panel-root'
  document.body.appendChild(rootElement)
  
  const root = createRoot(rootElement)
  root.render(<PanelView />)
} else {
  const root = createRoot(container)
  root.render(<PanelView />)
}

// Add global styles for panel
document.body.style.margin = '0'
document.body.style.padding = '0'
document.body.style.background = '#1a1a1a'
document.body.style.fontFamily = 'Inter, system-ui, sans-serif'

// Handle keyboard shortcuts for panel
document.addEventListener('keydown', (e) => {
  // Only handle shortcuts when Alt is pressed
  if (!e.altKey) return
  
  switch (e.key.toLowerCase()) {
    case '1':
      // Switch to controls tab
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('panel-tab', { detail: 'controls' }))
      break
    case '2':
      // Switch to settings tab
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('panel-tab', { detail: 'settings' }))
      break
    case '3':
      // Switch to queue tab
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('panel-tab', { detail: 'queue' }))
      break
    case '4':
      // Switch to stats tab
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('panel-tab', { detail: 'stats' }))
      break
    case 't':
      // Toggle TTS
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('tts-toggle'))
      break
    case 'p':
      // Pause/Resume
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('tts-pause'))
      break
    case 's':
      // Skip current
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('tts-skip'))
      break
    case 'c':
      // Clear queue
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('tts-clear'))
      break
  }
})

// Handle panel-specific events
window.addEventListener('message', (event) => {
  // Handle messages from other extension components
  if (event.data && event.data.type === 'tts-update') {
    // Forward TTS updates to the panel component
    window.dispatchEvent(new CustomEvent('tts-update', { detail: event.data.payload }))
  }
})

// Debug mode for development
if (process.env.NODE_ENV === 'development') {
  console.log('📱 Twitch TTS Panel loaded')
  console.log('📋 Keyboard shortcuts:')
  console.log('  Alt + 1-4: Switch tabs')
  console.log('  Alt + T: Toggle TTS')
  console.log('  Alt + P: Pause/Resume')
  console.log('  Alt + S: Skip current')
  console.log('  Alt + C: Clear queue')
}