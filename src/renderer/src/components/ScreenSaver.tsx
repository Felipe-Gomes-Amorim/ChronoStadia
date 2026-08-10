import { useEffect, useRef, useState } from 'react'

const COLORS = ['#ff4444', '#ff8c00', '#ffd700', '#44dd44', '#00ccff', '#8844ff', '#ff44cc', '#ffffff']
const SPEED = 1.4  // px por frame

interface ScreenSaverProps {
  onDismiss: () => void
}

function ScreenSaver({ onDismiss }: ScreenSaverProps) {
  const textRef = useRef<HTMLDivElement>(null)
  const velRef = useRef({ x: SPEED, y: SPEED * 0.7 })
  const posRef = useRef({ x: 120, y: 80 })
  const colorIdxRef = useRef(0)
  const rafRef = useRef<number>(0)

  const [pos, setPos] = useState({ x: 120, y: 80 })
  const [color, setColor] = useState(COLORS[0])

  useEffect(() => {
    function tick() {
      const el = textRef.current
      if (!el) { rafRef.current = requestAnimationFrame(tick); return }

      const pw = window.innerWidth
      const ph = window.innerHeight
      const tw = el.offsetWidth
      const th = el.offsetHeight

      let { x, y } = posRef.current
      let { x: vx, y: vy } = velRef.current

      x += vx
      y += vy

      let bounced = false
      if (x <= 0)        { x = 0;       vx =  Math.abs(vx); bounced = true }
      if (x + tw >= pw)  { x = pw - tw; vx = -Math.abs(vx); bounced = true }
      if (y <= 0)        { y = 0;       vy =  Math.abs(vy); bounced = true }
      if (y + th >= ph)  { y = ph - th; vy = -Math.abs(vy); bounced = true }

      if (bounced) {
        colorIdxRef.current = (colorIdxRef.current + 1) % COLORS.length
        setColor(COLORS[colorIdxRef.current])
      }

      posRef.current  = { x, y }
      velRef.current  = { x: vx, y: vy }
      setPos({ x, y })

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className="screensaver-overlay" onClick={onDismiss}>
      <div
        ref={textRef}
        className="screensaver-text"
        style={{ left: pos.x, top: pos.y, color }}
      >
        ChronoStadia
      </div>
      <div className="screensaver-hint">Clique para sair</div>
    </div>
  )
}

export default ScreenSaver
