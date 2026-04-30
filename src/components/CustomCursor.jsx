import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef  = useRef(null)
  const ringRef = useRef(null)
  const mouse   = useRef({ x: 0, y: 0 })
  const ring    = useRef({ x: 0, y: 0 })
  const raf     = useRef(null)
  const hovered = useRef(false)

  useEffect(() => {
    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px'
        dotRef.current.style.top  = e.clientY + 'px'
      }
    }

    const INTERACTIVE = 'button, a, [role="button"], .species-btn, .filter-chip, .feature-card, .caregiver-card, .route-card, .tab-btn, .toggle-btn, .swatch, label'

    const onEnter = () => {
      hovered.current = true
      if (ringRef.current) ringRef.current.classList.add('hover')
      if (dotRef.current) dotRef.current.style.transform = 'translate(-50%, -50%) scale(2)'
    }
    const onLeave = () => {
      hovered.current = false
      if (ringRef.current) ringRef.current.classList.remove('hover')
      if (dotRef.current) dotRef.current.style.transform = 'translate(-50%, -50%) scale(1)'
    }

    const bindInteractive = () => {
      document.querySelectorAll(INTERACTIVE).forEach(el => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    const animate = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.12
      ring.current.y += (mouse.current.y - ring.current.y) * 0.12
      if (ringRef.current) {
        ringRef.current.style.left = ring.current.x + 'px'
        ringRef.current.style.top  = ring.current.y + 'px'
      }
      raf.current = requestAnimationFrame(animate)
    }

    document.addEventListener('mousemove', onMove)
    bindInteractive()
    animate()

    const observer = new MutationObserver(bindInteractive)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf.current)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <div ref={dotRef}  className="cursor" />
      <div ref={ringRef} className="cursor-ring" />
    </>
  )
}
