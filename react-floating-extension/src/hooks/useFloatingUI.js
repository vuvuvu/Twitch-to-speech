import { useState, useEffect, useCallback, useRef } from 'react'
import { debounce } from '../utils'

const DEFAULT_POSITION = {
  x: 20,
  y: 20
}

const DEFAULT_SIZE = {
  width: 320,
  height: 180
}

const STORAGE_KEY = 'twitch-tts-floating-ui'

export function useFloatingUI({
  initialPosition = DEFAULT_POSITION,
  initialSize = DEFAULT_SIZE,
  bounds = null,
  snapToEdges = true,
  snapThreshold = 20,
  persistPosition = true
} = {}) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [opacity, setOpacity] = useState(1)
  const [zIndex, setZIndex] = useState(1000)
  
  const dragStartRef = useRef({ x: 0, y: 0 })
  const elementStartRef = useRef({ x: 0, y: 0 })
  const resizeStartRef = useRef({ width: 0, height: 0, x: 0, y: 0 })
  const elementRef = useRef(null)
  
  // Load saved position on mount
  useEffect(() => {
    if (persistPosition) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const { position: savedPosition, size: savedSize, isMinimized: savedMinimized } = JSON.parse(saved)
          if (savedPosition) setPosition(savedPosition)
          if (savedSize) setSize(savedSize)
          if (typeof savedMinimized === 'boolean') setIsMinimized(savedMinimized)
        }
      } catch (error) {
        console.warn('Failed to load floating UI position:', error)
      }
    }
  }, [persistPosition])
  
  // Save position when it changes
  const savePosition = useCallback(
    debounce((pos, sz, minimized) => {
      if (persistPosition) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            position: pos,
            size: sz,
            isMinimized: minimized
          }))
        } catch (error) {
          console.warn('Failed to save floating UI position:', error)
        }
      }
    }, 500),
    [persistPosition]
  )
  
  // Get viewport bounds
  const getViewportBounds = useCallback(() => {
    if (bounds) return bounds
    
    return {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight
    }
  }, [bounds])
  
  // Constrain position to bounds
  const constrainPosition = useCallback((pos, sz = size) => {
    const viewport = getViewportBounds()
    
    let { x, y } = pos
    const { width, height } = sz
    
    // Keep within bounds
    x = Math.max(viewport.left, Math.min(x, viewport.right - width))
    y = Math.max(viewport.top, Math.min(y, viewport.bottom - height))
    
    // Snap to edges if enabled
    if (snapToEdges) {
      if (x < viewport.left + snapThreshold) x = viewport.left
      if (x > viewport.right - width - snapThreshold) x = viewport.right - width
      if (y < viewport.top + snapThreshold) y = viewport.top
      if (y > viewport.bottom - height - snapThreshold) y = viewport.bottom - height
    }
    
    return { x, y }
  }, [size, getViewportBounds, snapToEdges, snapThreshold])
  
  // Handle drag start
  const handleDragStart = useCallback((event) => {
    event.preventDefault()
    
    const clientX = event.clientX || (event.touches && event.touches[0]?.clientX) || 0
    const clientY = event.clientY || (event.touches && event.touches[0]?.clientY) || 0
    
    setIsDragging(true)
    setZIndex(prev => prev + 1)
    
    dragStartRef.current = { x: clientX, y: clientY }
    elementStartRef.current = { ...position }
    
    document.addEventListener('mousemove', handleDragMove)
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('touchmove', handleDragMove, { passive: false })
    document.addEventListener('touchend', handleDragEnd)
  }, [position])
  
  // Handle drag move
  const handleDragMove = useCallback((event) => {
    if (!isDragging) return
    
    event.preventDefault()
    
    const clientX = event.clientX || (event.touches && event.touches[0]?.clientX) || 0
    const clientY = event.clientY || (event.touches && event.touches[0]?.clientY) || 0
    
    const deltaX = clientX - dragStartRef.current.x
    const deltaY = clientY - dragStartRef.current.y
    
    const newPosition = {
      x: elementStartRef.current.x + deltaX,
      y: elementStartRef.current.y + deltaY
    }
    
    const constrainedPosition = constrainPosition(newPosition)
    setPosition(constrainedPosition)
  }, [isDragging, constrainPosition])
  
  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    
    document.removeEventListener('mousemove', handleDragMove)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchmove', handleDragMove)
    document.removeEventListener('touchend', handleDragEnd)
    
    savePosition(position, size, isMinimized)
  }, [handleDragMove, position, size, isMinimized, savePosition])
  
  // Handle resize start
  const handleResizeStart = useCallback((event, direction) => {
    event.preventDefault()
    event.stopPropagation()
    
    const clientX = event.clientX || (event.touches && event.touches[0]?.clientX) || 0
    const clientY = event.clientY || (event.touches && event.touches[0]?.clientY) || 0
    
    setIsResizing(direction)
    
    resizeStartRef.current = {
      x: clientX,
      y: clientY,
      width: size.width,
      height: size.height,
      posX: position.x,
      posY: position.y
    }
    
    document.addEventListener('mousemove', handleResizeMove)
    document.addEventListener('mouseup', handleResizeEnd)
    document.addEventListener('touchmove', handleResizeMove, { passive: false })
    document.addEventListener('touchend', handleResizeEnd)
  }, [size, position])
  
  // Handle resize move
  const handleResizeMove = useCallback((event) => {
    if (!isResizing) return
    
    event.preventDefault()
    
    const clientX = event.clientX || (event.touches && event.touches[0]?.clientX) || 0
    const clientY = event.clientY || (event.touches && event.touches[0]?.clientY) || 0
    
    const deltaX = clientX - resizeStartRef.current.x
    const deltaY = clientY - resizeStartRef.current.y
    
    let newSize = { ...size }
    let newPosition = { ...position }
    
    const minWidth = 200
    const minHeight = 120
    const maxWidth = 600
    const maxHeight = 400
    
    switch (isResizing) {
      case 'se': // Southeast
        newSize.width = Math.max(minWidth, Math.min(maxWidth, resizeStartRef.current.width + deltaX))
        newSize.height = Math.max(minHeight, Math.min(maxHeight, resizeStartRef.current.height + deltaY))
        break
      case 'sw': // Southwest
        newSize.width = Math.max(minWidth, Math.min(maxWidth, resizeStartRef.current.width - deltaX))
        newSize.height = Math.max(minHeight, Math.min(maxHeight, resizeStartRef.current.height + deltaY))
        newPosition.x = resizeStartRef.current.posX + (resizeStartRef.current.width - newSize.width)
        break
      case 'ne': // Northeast
        newSize.width = Math.max(minWidth, Math.min(maxWidth, resizeStartRef.current.width + deltaX))
        newSize.height = Math.max(minHeight, Math.min(maxHeight, resizeStartRef.current.height - deltaY))
        newPosition.y = resizeStartRef.current.posY + (resizeStartRef.current.height - newSize.height)
        break
      case 'nw': // Northwest
        newSize.width = Math.max(minWidth, Math.min(maxWidth, resizeStartRef.current.width - deltaX))
        newSize.height = Math.max(minHeight, Math.min(maxHeight, resizeStartRef.current.height - deltaY))
        newPosition.x = resizeStartRef.current.posX + (resizeStartRef.current.width - newSize.width)
        newPosition.y = resizeStartRef.current.posY + (resizeStartRef.current.height - newSize.height)
        break
    }
    
    const constrainedPosition = constrainPosition(newPosition, newSize)
    setSize(newSize)
    setPosition(constrainedPosition)
  }, [isResizing, size, position, constrainPosition])
  
  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false)
    
    document.removeEventListener('mousemove', handleResizeMove)
    document.removeEventListener('mouseup', handleResizeEnd)
    document.removeEventListener('touchmove', handleResizeMove)
    document.removeEventListener('touchend', handleResizeEnd)
    
    savePosition(position, size, isMinimized)
  }, [handleResizeMove, position, size, isMinimized, savePosition])
  
  // Handle window resize
  useEffect(() => {
    const handleWindowResize = debounce(() => {
      const constrainedPosition = constrainPosition(position)
      if (constrainedPosition.x !== position.x || constrainedPosition.y !== position.y) {
        setPosition(constrainedPosition)
      }
    }, 100)
    
    window.addEventListener('resize', handleWindowResize)
    return () => window.removeEventListener('resize', handleWindowResize)
  }, [position, constrainPosition])
  
  // Toggle minimize
  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => {
      const newMinimized = !prev
      savePosition(position, size, newMinimized)
      return newMinimized
    })
  }, [position, size, savePosition])
  
  // Toggle visibility
  const toggleVisibility = useCallback(() => {
    setIsVisible(prev => !prev)
  }, [])
  
  // Set opacity
  const updateOpacity = useCallback((newOpacity) => {
    setOpacity(Math.max(0.1, Math.min(1, newOpacity)))
  }, [])
  
  // Reset position
  const resetPosition = useCallback(() => {
    setPosition(initialPosition)
    setSize(initialSize)
    setIsMinimized(false)
    savePosition(initialPosition, initialSize, false)
  }, [initialPosition, initialSize, savePosition])
  
  // Cleanup
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDragMove)
      document.removeEventListener('mouseup', handleDragEnd)
      document.removeEventListener('touchmove', handleDragMove)
      document.removeEventListener('touchend', handleDragEnd)
      document.removeEventListener('mousemove', handleResizeMove)
      document.removeEventListener('mouseup', handleResizeEnd)
      document.removeEventListener('touchmove', handleResizeMove)
      document.removeEventListener('touchend', handleResizeEnd)
    }
  }, [handleDragMove, handleDragEnd, handleResizeMove, handleResizeEnd])
  
  return {
    // State
    position,
    size,
    isDragging,
    isResizing,
    isMinimized,
    isVisible,
    opacity,
    zIndex,
    
    // Refs
    elementRef,
    
    // Handlers
    handleDragStart,
    handleResizeStart,
    
    // Actions
    setPosition: (pos) => setPosition(constrainPosition(pos)),
    setSize,
    toggleMinimize,
    toggleVisibility,
    updateOpacity,
    resetPosition,
    
    // Computed styles
    style: {
      position: 'fixed',
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${size.width}px`,
      height: isMinimized ? 'auto' : `${size.height}px`,
      opacity,
      zIndex,
      display: isVisible ? 'block' : 'none',
      transition: isDragging || isResizing ? 'none' : 'all 0.2s ease-out',
      cursor: isDragging ? 'grabbing' : 'default'
    }
  }
}