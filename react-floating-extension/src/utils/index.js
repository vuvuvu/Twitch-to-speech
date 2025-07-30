import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names with tailwind-merge for better className handling
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function to limit function execution frequency
 */
export function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Format time duration in a human-readable format
 */
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Generate a random color from a predefined palette
 */
export function getRandomColor() {
  const colors = [
    '#9146FF', // Twitch Purple
    '#00F5FF', // Cyan
    '#FF6B6B', // Red
    '#FFB347', // Orange
    '#4ECDC4', // Teal
    '#A970FF', // Light Purple
    '#FF69B4', // Pink
    '#32CD32', // Lime Green
    '#FFD700', // Gold
    '#FF4500'  // Orange Red
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Get a consistent color for a user based on their username
 */
export function getUserColor(username) {
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  const colors = [
    '#9146FF', '#00F5FF', '#FF6B6B', '#FFB347', '#4ECDC4',
    '#A970FF', '#FF69B4', '#32CD32', '#FFD700', '#FF4500'
  ]
  
  return colors[Math.abs(hash) % colors.length]
}

/**
 * Filter and clean chat messages
 */
export function filterMessage(message) {
  if (!message || typeof message !== 'string') return ''
  
  // Remove excessive repeated characters (more than 3 in a row)
  let filtered = message.replace(/([a-zA-Z])\1{3,}/g, '$1$1$1')
  
  // Replace URLs with "link"
  filtered = filtered.replace(/https?:\/\/[^\s]+/g, 'link')
  
  // Remove excessive emotes (more than 5 of the same emote)
  filtered = filtered.replace(/(\S+)\s+\1\s+\1\s+\1\s+\1\s+\1/g, '$1 $1 $1')
  
  // Limit message length
  if (filtered.length > 200) {
    filtered = filtered.substring(0, 200) + '...'
  }
  
  return filtered.trim()
}

/**
 * Check if a user is muted
 */
export function isUserMuted(username, mutedUsers) {
  if (!mutedUsers || !Array.isArray(mutedUsers)) return false
  return mutedUsers.some(muted => 
    muted.toLowerCase() === username.toLowerCase()
  )
}

/**
 * Parse muted users string into array
 */
export function parseMutedUsers(mutedUsersString) {
  if (!mutedUsersString || typeof mutedUsersString !== 'string') return []
  
  return mutedUsersString
    .split(',')
    .map(user => user.trim())
    .filter(user => user.length > 0)
}

/**
 * Generate a unique ID
 */
export function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Failed to get ${key} from localStorage:`, error)
      return defaultValue
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn(`Failed to set ${key} in localStorage:`, error)
      return false
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error)
      return false
    }
  }
}

/**
 * Animation easing functions
 */
export const easing = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
}

/**
 * Check if the browser supports Speech Synthesis
 */
export function isSpeechSynthesisSupported() {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
}

/**
 * Format number with commas
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Validate extension configuration
 */
export function validateConfig(config) {
  const errors = []
  
  if (config.volume < 0 || config.volume > 1) {
    errors.push('Volume must be between 0 and 1')
  }
  
  if (config.rate < 0.1 || config.rate > 2) {
    errors.push('Rate must be between 0.1 and 2')
  }
  
  if (config.pitch < 0 || config.pitch > 2) {
    errors.push('Pitch must be between 0 and 2')
  }
  
  return errors
}