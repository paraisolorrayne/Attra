'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const posRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isTouch, setIsTouch] = useState(false)

  // Detect touch device
  useEffect(() => {
    const isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches

    setIsTouch(isTouchDevice)
  }, [])

  // Smooth animation loop with lerp
  const animate = useCallback(() => {
    const lerp = 0.15
    posRef.current.x += (targetRef.current.x - posRef.current.x) * lerp
    posRef.current.y += (targetRef.current.y - posRef.current.y) * lerp

    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0) translate(-50%, -50%) scale(${isHovering ? 1.5 : 1})`
    }

    rafRef.current = requestAnimationFrame(animate)
  }, [isHovering])

  useEffect(() => {
    if (isTouch) return

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current.x = e.clientX
      targetRef.current.y = e.clientY
      if (!isVisible) setIsVisible(true)
    }

    const handleMouseEnter = () => setIsVisible(true)
    const handleMouseLeave = () => setIsVisible(false)

    // Detect hover on interactive elements
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isInteractive = target.closest(
        'a, button, [role="button"], input, textarea, select, [data-cursor-hover]'
      )
      setIsHovering(!!isInteractive)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseover', handleElementHover, { passive: true })
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    // Start animation loop
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleElementHover)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [isTouch, isVisible, animate])

  // Don't render on touch devices
  if (isTouch) return null

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
      aria-hidden="true"
      style={{
        opacity: isVisible ? 1 : 0,
      }}
    >
      <img
        src="/images/A.png"
        alt=""
        width={32}
        height={32}
        draggable={false}
        className="custom-cursor__image"
      />
    </div>
  )
}

