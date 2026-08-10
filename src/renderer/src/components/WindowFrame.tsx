import { useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react'
import { useDraggable } from '../hooks/useDraggable'

export const DIALOG_Z_INDEX = 1000

const DEFAULT_WIDTH = 380
const DEFAULT_HEIGHT = 340
const MIN_W = 200
const MIN_H = 150

interface WindowFrameProps {
  title: string
  onClose: () => void
  onMinimize?: () => void
  onMaximize?: () => void
  onFocus?: () => void
  minimized?: boolean
  maximized?: boolean
  showWindowControls?: boolean
  resizable?: boolean
  noPadding?: boolean
  titleIconSrc?: string
  width?: number
  initialHeight?: number
  zIndex?: number
  children: ReactNode
  initialPosition?: { x: number; y: number }
}

function WindowFrame({
  title,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  minimized = false,
  maximized = false,
  showWindowControls = true,
  resizable = true,
  noPadding = false,
  titleIconSrc,
  width,
  initialHeight,
  zIndex,
  children,
  initialPosition = { x: 160, y: 100 }
}: WindowFrameProps) {
  const { position, handleMouseDown: handleDragMouseDown } = useDraggable(initialPosition)
  const [dims, setDims] = useState({
    width: width ?? DEFAULT_WIDTH,
    height: initialHeight ?? DEFAULT_HEIGHT
  })

  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number; dir: string } | null>(null)

  function startResize(event: ReactMouseEvent, dir: string): void {
    event.stopPropagation()
    event.preventDefault()
    resizeRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      startW: dims.width,
      startH: dims.height,
      dir
    }

    function handleMouseMove(e: MouseEvent): void {
      const r = resizeRef.current
      if (!r) return
      const dx = e.clientX - r.startX
      const dy = e.clientY - r.startY
      setDims((current) => ({
        width:  (r.dir === 'e' || r.dir === 'se') ? Math.max(MIN_W, r.startW + dx) : current.width,
        height: (r.dir === 's' || r.dir === 'se') ? Math.max(MIN_H, r.startH + dy) : current.height
      }))
    }

    function handleMouseUp(): void {
      resizeRef.current = null
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  const style: CSSProperties = minimized
    ? { display: 'none', zIndex }
    : maximized
      ? { left: 0, top: 0, right: 0, bottom: 36, width: 'auto', height: 'auto', zIndex }
      : {
          left: position.x,
          top: position.y,
          width: dims.width,
          height: resizable ? dims.height : undefined,
          zIndex
        }

  const showHandles = resizable && !maximized && !minimized

  return (
    <div
      className={`window app-window${maximized ? ' maximized' : ''}${resizable ? ' resizable-window' : ''}`}
      style={style}
      onMouseDown={onFocus}
    >
      <div className="title-bar" onMouseDown={maximized ? undefined : handleDragMouseDown}>
        <div className="title-bar-text">
          {titleIconSrc && (
            <img src={titleIconSrc} width={14} height={14} alt="" className="pixel-icon title-bar-icon" />
          )}
          {title}
        </div>
        <div className="title-bar-controls">
          {showWindowControls && (
            <>
              <button aria-label="Minimize" onClick={onMinimize}></button>
              <button aria-label="Maximize" onClick={onMaximize}></button>
            </>
          )}
          <button aria-label="Close" onClick={onClose}></button>
        </div>
      </div>
      <div className="window-body" style={noPadding ? { padding: 0 } : undefined}>{children}</div>

      {showHandles && (
        <>
          <div className="resize-e" onMouseDown={(e) => startResize(e, 'e')} />
          <div className="resize-s" onMouseDown={(e) => startResize(e, 's')} />
          <div className="resize-se" onMouseDown={(e) => startResize(e, 'se')} />
        </>
      )}
    </div>
  )
}

export default WindowFrame
