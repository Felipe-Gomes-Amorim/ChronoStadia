import { useEffect, useRef } from 'react'

interface ContextMenuItem {
  label: string
  onClick: () => void
}

interface ContextMenuProps {
  x: number
  y?: number
  anchorBottom?: number
  items: ContextMenuItem[]
  onClose: () => void
}

function ContextMenu({ x, y, anchorBottom, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleMouseDown(event: MouseEvent): void {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    window.addEventListener('mousedown', handleMouseDown)
    return () => window.removeEventListener('mousedown', handleMouseDown)
  }, [onClose])

  const positionStyle =
    anchorBottom !== undefined
      ? { left: x, bottom: anchorBottom }
      : { left: x, top: y }

  return (
    <div ref={menuRef} className="context-menu" style={positionStyle}>
      {items.map((item) => (
        <button
          key={item.label}
          className="context-menu-item"
          onClick={() => {
            item.onClick()
            onClose()
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default ContextMenu
