import React from 'react'
import { createRoot } from 'react-dom/client'
import FloatingVideoOverlay from './components/FloatingVideoOverlay'
import './index.css'

// Initialize the video overlay component
const container = document.getElementById('root')
if (!container) {
  // Create root element if it doesn't exist
  const rootElement = document.createElement('div')
  rootElement.id = 'root'
  rootElement.className = 'video-overlay-root'
  document.body.appendChild(rootElement)
  
  const root = createRoot(rootElement)
  root.render(<FloatingVideoOverlay />)
} else {
  const root = createRoot(container)
  root.render(<FloatingVideoOverlay />)
}

// Add global styles for video overlay
document.body.style.margin = '0'
document.body.style.padding = '0'
document.body.style.background = 'transparent'
document.body.style.overflow = 'hidden'

// Prevent context menu on right click
document.addEventListener('contextmenu', (e) => {
  e.preventDefault()
})

// Handle keyboard shortcuts globally
document.addEventListener('keydown', (e) => {
  // Only handle shortcuts when Alt is pressed
  if (!e.altKey) return
  
  switch (e.key.toLowerCase()) {
    case 't':
      // Toggle TTS - will be handled by the component
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
    case 'h':
      // Toggle visibility
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('tts-hide'))
      break
  }
})

// Handle window resize for responsive behavior
window.addEventListener('resize', () => {
  window.dispatchEvent(new CustomEvent('window-resize'))
})

// Debug mode for development
if (process.env.NODE_ENV === 'development') {
  console.log('🎮 Twitch TTS Video Overlay loaded')
  console.log('📋 Keyboard shortcuts:')
  console.log('  Alt + T: Toggle TTS')
  console.log('  Alt + P: Pause/Resume')
  console.log('  Alt + S: Skip current')
  console.log('  Alt + C: Clear queue')
  console.log('  Alt + H: Toggle visibility')
}